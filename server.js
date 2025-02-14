const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const ejs = require('ejs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { authenticateUser, authorizeAdmin } = require('./middleware/auth');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch(err => console.error("MongoDB Atlas Connection Error:", err));

app.use(session({
    secret: process.env.SESSION_SECRET || 'mysecret',
    resave: false,
    saveUninitialized: false
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const publicDir = 'public';
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const User = require('./models/User');
const News = require('./models/News');

app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.render('login', { error: 'All fields are required!' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'Invalid email or password!' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.render('login', { error: 'Invalid email or password!' });
        }

        req.session.user = user;
        return res.redirect('/profile');
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).send("Internal Server Error");
    }
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.render('register', { error: 'All fields are required!' });
    }
    if (password.length < 6) {
        return res.render('register', { error: 'Password must be at least 6 characters!' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.render('register', { error: 'This email is already registered!' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ name, email, password: hashedPassword }).save();
    res.redirect('/login');
});

app.get('/news', async (req, res) => {
    const news = await News.find();
    res.render('news', { user: req.session.user, news });
});

app.post('/news', upload.single('photo'), authenticateUser, async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).send('All fields are required');
    await new News({ title, description, photo: req.file.filename, author: req.session.user._id }).save();
    res.redirect('/news');
});

app.post('/news/delete/:id', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
        const newsId = req.params.id;
        const news = await News.findById(newsId);
        if (!news) {
            return res.status(404).json({ message: "News not found" });
        }
        await News.findByIdAndDelete(newsId);
        res.redirect('/news');
    } catch (error) {
        console.error("Error deleting news:", error);
        res.status(500).json({ message: "Error deleting news" });
    }
});

app.post('/news/edit/:id', authenticateUser, async (req, res) => {
    try {
        const newsId = req.params.id;
        const { title, description } = req.body;
        const news = await News.findById(newsId);
        if (!news) {
            return res.status(404).json({ message: "News not found" });
        }
        news.title = title || news.title;
        news.description = description || news.description;
        await news.save();
        res.redirect('/news');
    } catch (error) {
        console.error("Error updating news:", error);
        res.status(500).json({ message: "Error updating news" });
    }
});

app.delete("/news/delete/:id", authenticateUser, authorizeAdmin, async (req, res) => {
    try {
        const newsId = req.params.id;
        const deletedNews = await News.findByIdAndDelete(newsId);

        if (!deletedNews) {
            return res.status(404).json({ success: false, message: "News not found" });
        }

        res.json({ success: true, message: "News deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting news" });
    }
});

app.get('/profile', authenticateUser, async (req, res) => {
    const user = await User.findById(req.session.user._id);
    const userNews = await News.find({ author: user._id });
    res.render('profile', { user, userNews });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
