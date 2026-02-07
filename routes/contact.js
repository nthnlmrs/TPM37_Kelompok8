const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');

// Handle Contact Form Submission
router.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format.'
            });
        }

        // Save to Database
        const newMessage = await prisma.contactMessage.create({
            data: {
                name,
                email,
                subject,
                message
            }
        });

        // Simulate Email Sending (Log to console)
        console.log(`[EMAIL SIMULATION] To: technoscape@bncc.net`);
        console.log(`[EMAIL SIMULATION] From: ${email} (${name})`);
        console.log(`[EMAIL SIMULATION] Subject: ${subject}`);
        console.log(`[EMAIL SIMULATION] Message: ${message}`);

        res.json({
            success: true,
            message: 'Your message has been sent successfully! We will contact you soon.'
        });

    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

module.exports = router;
