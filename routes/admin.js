const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const path = require('path');
const fs = require('fs');




const isAdmin = (req, res, next) => {
    if (req.session.is_admin_logged_in) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'Unauthorized' });
};


const isAdminPage = (req, res, next) => {
    if (req.session.is_admin_logged_in) {
        return next();
    }
    return res.redirect('/admin/login');
};




router.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'login.html'));
});


router.get('/admin', isAdminPage, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'dashboard.html'));
});


router.get('/admin/dashboard', isAdminPage, (req, res) => {
    res.redirect('/admin');
});


router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }

        const admin = await prisma.admin.findUnique({
            where: { username }
        });

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, admin.password_hash);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        req.session.admin_id = admin.id;
        req.session.username = admin.username;
        req.session.is_admin_logged_in = true;

        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ success: false, message: 'Session error' });
            }
            res.json({ success: true, message: 'Login successful', redirect: '/admin' });
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.post('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
        res.json({ success: true, message: 'Logout successful' });
    });
});


router.get('/api/admin/teams', isAdmin, async (req, res) => {
    try {
        const { search, sortBy, order } = req.query;

        const where = {};

        if (search) {
            where.team_name = { contains: search };
        }


        const orderBy = {};
        if (sortBy === 'name') {
            orderBy.team_name = order === 'desc' ? 'desc' : 'asc';
        } else if (sortBy === 'id') {
            orderBy.id = order === 'desc' ? 'desc' : 'asc';
        } else {

            orderBy.created_at = order === 'asc' ? 'asc' : 'desc';
        }


        const teams = await prisma.team.findMany({
            where,
            include: {
                leader: true
            },
            orderBy
        });
        res.json({ success: true, data: teams });
    } catch (error) {
        console.error('Fetch teams error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.get('/api/admin/teams/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const team = await prisma.team.findUnique({
            where: { id: parseInt(id) },
            include: {
                leader: true,
                members: true
            }
        });

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        res.json({ success: true, data: team });
    } catch (error) {
        console.error('Fetch team details error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.put('/api/admin/teams/:id', isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { team_name, leader } = req.body;

        await prisma.$transaction(async (tx) => {

            if (team_name) {
                await tx.team.update({
                    where: { id },
                    data: { team_name }
                });
            }


            if (leader) {

                const existingLeader = await tx.teamLeader.findUnique({ where: { team_id: id } });

                if (existingLeader) {
                    await tx.teamLeader.update({
                        where: { team_id: id },
                        data: {
                            full_name: leader.full_name,
                            email: leader.email,
                            whatsapp: leader.whatsapp,
                            line_id: leader.line_id,
                            github_id: leader.github_id,
                            birth_place: leader.birth_place,

                            ...(leader.birth_date && { birth_date: new Date(leader.birth_date) }),
                            is_binusian: leader.is_binusian === 'true' || leader.is_binusian === true
                        }
                    });
                }
            }
        });

        res.json({ success: true, message: 'Team updated successfully' });

    } catch (error) {
        console.error('Update team error:', error);
        res.status(500).json({ success: false, message: 'Update failed: ' + error.message });
    }
});



router.delete('/api/admin/teams/:id', isAdmin, async (req, res) => {
    try {
        const teamId = parseInt(req.params.id);

        if (isNaN(teamId)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }


        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { leader: true }
        });

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }


        if (team.leader) {
            if (team.leader.cv_path) {
                fs.unlink(team.leader.cv_path, (err) => {
                    if (err && err.code !== 'ENOENT') console.error('Failed to delete CV:', err);
                });
            }
            if (team.leader.id_card_path) {
                fs.unlink(team.leader.id_card_path, (err) => {
                    if (err && err.code !== 'ENOENT') console.error('Failed to delete ID:', err);
                });
            }
        }


        await prisma.team.delete({
            where: { id: teamId }
        });

        res.json({ success: true, message: 'Team deleted successfully' });

    } catch (error) {
        console.error('Delete team error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
