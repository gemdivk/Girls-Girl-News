const News = require('../models/News');

const createNews = async (req, res, next) => {
    try {
        const news = new News({ ...req.body, author: req.user.id });
        await news.save();
        res.status(201).json(news);
    } catch (err) {
        next(err);
    }
};

const getNews = async (req, res, next) => {
    try {
        const news = await News.find().populate('author', 'name email');
        res.json(news);
    } catch (err) {
        next(err);
    }
};

const getNewsById = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id).populate('author', 'name email');
        if (!news) return res.status(404).json({ message: 'News not found' });
        res.json(news);
    } catch (err) {
        next(err);
    }
};

const updateNews = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ message: 'News not found' });

        // Ensure the user is the owner or an admin
        if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        Object.assign(news, req.body);
        await news.save();
        res.json(news);
    } catch (err) {
        next(err);
    }
};

const deleteNews = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ message: 'News not found' });

        await News.findByIdAndDelete(req.params.id);
        res.json({ message: 'News deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = { createNews, getNews, getNewsById, updateNews, deleteNews };
