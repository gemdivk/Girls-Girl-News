const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const ejs = require('ejs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { authenticateUser, authorizeAdmin } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch(err => console.error("MongoDB Atlas Connection Error:", err));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);

app.use(errorHandler);

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
    res.render('index', { user: null });
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

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
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

app.get('/news', authenticateUser, async (req, res) => {
    try {
        const news = await News.find();
        res.render('news', { user: req.user || null, news });
    } catch (error) {
        console.error("Ошибка при загрузке новостей:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});


app.post('/news', upload.single('photo'), authenticateUser, async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).send('All fields are required');

    const photo = req.file ? req.file.filename : null; 

    try {
        await new News({ title, description, photo, author: req.user.id }).save();
        res.redirect('/news');
    } catch (error) {
        console.error("Ошибка при публикации новости:", error);
        res.status(500).json({ message: "Ошибка при добавлении новости" });
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

app.delete('/news/:id', authenticateUser, async (req, res) => {
    try {
        console.log("Пользователь:", req.user); 
        
        const newsId = req.params.id;
        const userId = req.user._id; 

        const news = await News.findById(newsId);
        if (!news) {
            return res.status(404).json({ error: 'Новость не найдена' });
        }

        if (req.user.role !== 'admin' && news.author.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Нет прав для удаления этой новости' });
        }

        await News.findByIdAndDelete(newsId);
        res.json({ message: 'Новость удалена' });
    } catch (error) {
        console.error("Ошибка при удалении новости:", error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});



app.get('/profile', authenticateUser, async (req, res) => {
    const user = await User.findById(req.user.id);
    const userNews = await News.find({ author: user._id });
    res.render('profile', { user, userNews });
});

app.post('/profile/edit', authenticateUser, async (req, res) => {
    const { name, email } = req.body;
    await User.findByIdAndUpdate(req.user.id, { name, email });
    res.redirect('/profile');
});

app.post('/profile/photo', authenticateUser, upload.single('avatar'), async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, { avatar: req.file.filename });
    res.redirect('/profile');
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});