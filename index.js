require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.SESSION_SECRET || 'fintechkathon-secret-key-2026-dev',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));


app.use(express.static(path.join(__dirname, 'public')));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');

app.use('/', authRoutes);
app.use('/', contactRoutes);
app.use('/', adminRoutes);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/handbook', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'handbook', 'handbook.html'));
});


app.get('/handbook/', (req, res) => {
    res.redirect('/handbook');
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
