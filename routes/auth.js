const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { prisma } = require('../config/database');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only PDF, JPG, JPEG, PNG files are allowed'));
    }
});

// GET login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'auth', 'login-page.html'));
});

// GET register page
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'auth', 'register-page.html'));
});

// Redirect trailing slashes
router.get('/login/', (req, res) => res.redirect('/login'));
router.get('/register/', (req, res) => res.redirect('/register'));

// Dashboard
router.get('/dashboard', (req, res) => {
    if (!req.session.is_logged_in) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

// Unified Register Endpoint
router.post('/register', upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'identity_doc', maxCount: 1 }
]), async (req, res) => {
    // Files to delete if registration fails
    const uploadedFiles = [];
    if (req.files?.cv) uploadedFiles.push(req.files.cv[0].path);
    if (req.files?.identity_doc) uploadedFiles.push(req.files.identity_doc[0].path);

    try {
        console.log('Register Body:', req.body);
        const {
            team_name, password, confirm_password,
            full_name, email, whatsapp, line_id,
            github_id, birth_place, birth_date, is_binusian
        } = req.body;

        // --- VALIDATION ---

        // Basic fields check
        if (!team_name || !password || !confirm_password || !full_name || !email || !whatsapp || !birth_date) {
            throw new Error('Semua field bertanda bintang (*) harus diisi');
        }

        // Password matching
        if (password !== confirm_password) {
            throw new Error('Password tidak cocok');
        }

        // Password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new Error('Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Masukkan email yang valid');
        }

        // WhatsApp validation
        if (whatsapp.length < 9) {
            throw new Error('Nomor WhatsApp minimal 9 digit');
        }

        // Age validation
        const today = new Date();
        const birthDate = new Date(birth_date);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 17) {
            throw new Error('Umur peserta minimal 17 tahun');
        }

        // Files validation
        const cv_path = req.files?.cv ? req.files.cv[0].path : null;
        const identity_doc_path = req.files?.identity_doc ? req.files.identity_doc[0].path : null;

        if (!cv_path) {
            throw new Error('CV harus diunggah');
        }
        if (!identity_doc_path) {
            throw new Error('Kartu Identitas (KTP/Flazz) harus diunggah');
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        const isBinusianBool = is_binusian === 'true' || is_binusian === true;

        // --- TRANSACTION ---
        await prisma.$transaction(async (tx) => {
            // Check uniqueness inside transaction
            const existingTeam = await tx.team.findUnique({ where: { team_name } });
            if (existingTeam) throw new Error('Nama tim sudah terdaftar');

            const existingEmail = await tx.teamLeader.findUnique({ where: { email } });
            if (existingEmail) throw new Error('Email sudah terdaftar');

            const existingWA = await tx.teamLeader.findFirst({ where: { whatsapp } });
            if (existingWA) throw new Error('Nomor WhatsApp sudah terdaftar');

            if (line_id) {
                const existingLine = await tx.teamLeader.findFirst({ where: { line_id } });
                if (existingLine) throw new Error('LINE ID sudah terdaftar');
            }

            // Create Team
            const team = await tx.team.create({
                data: {
                    team_name,
                    password_hash,
                    is_binusian: isBinusianBool
                }
            });

            // Create Leader
            await tx.teamLeader.create({
                data: {
                    team_id: team.id,
                    full_name,
                    email,
                    whatsapp,
                    line_id: line_id || null,
                    github_id: github_id || null,
                    birth_place: birth_place || null,
                    birth_date: birthDate,
                    is_binusian: isBinusianBool,
                    cv_path,
                    id_card_path: identity_doc_path
                }
            });
        });

        res.json({
            success: true,
            message: 'Registrasi berhasil! Silakan login.'
        });

    } catch (error) {
        console.error('Registration error:', error.message);

        // Clean up uploaded files if registration failed
        uploadedFiles.forEach(filepath => {
            fs.unlink(filepath, (err) => {
                if (err) console.error('Failed to delete file:', filepath);
            });
        });

        res.status(400).json({
            success: false,
            message: error.message || 'Terjadi kesalahan saat registrasi'
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { team_name, password } = req.body;

        if (!team_name || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nama tim dan password harus diisi'
            });
        }

        // Find team
        const team = await prisma.team.findUnique({
            where: { team_name }
        });
        if (!team) {
            return res.status(401).json({
                success: false,
                message: 'Nama tim atau password salah'
            });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, team.password_hash);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Nama tim atau password salah'
            });
        }

        // Set session
        req.session.team_id = team.id;
        req.session.team_name = team.team_name;
        req.session.is_logged_in = true;

        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ success: false, message: 'Session error' });
            }
            res.json({
                success: true,
                message: 'Login berhasil',
                redirect: '/dashboard'
            });
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Gagal logout'
            });
        }
        res.json({
            success: true,
            message: 'Logout berhasil'
        });
    });
});

// Get current user/team info
router.get('/me', async (req, res) => {
    try {
        if (!req.session.is_logged_in) {
            return res.status(401).json({
                success: false,
                message: 'Belum login'
            });
        }

        const team = await prisma.team.findUnique({
            where: { id: req.session.team_id },
            include: {
                leader: true
            }
        });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Tim tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: {
                id: team.id,
                team_name: team.team_name,
                is_binusian: team.is_binusian,
                created_at: team.created_at,
                leader: {
                    ...team.leader,
                    cv_path: team.leader.cv_path ? team.leader.cv_path.replace(/\\/g, '/') : null,
                    id_card_path: team.leader.id_card_path ? team.leader.id_card_path.replace(/\\/g, '/') : null
                }
            }
        });


    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

module.exports = router;
