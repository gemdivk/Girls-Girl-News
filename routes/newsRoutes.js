const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const News = require("../models/News"); 


router.post("/delete/:id", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        await News.findByIdAndDelete(id);
        res.status(200).json({ message: "Новость удалена" });
    } catch (error) {
        res.status(500).json({ error: "Ошибка при удалении новости" });
    }
});

router.delete("/:id", authenticateUser, async (req, res) => {
    try {
        const newsId = req.params.id;
        const news = await News.findById(newsId);

        if (!news) {
            return res.status(404).json({ message: "News not found" });
        }

        // Проверяем права доступа
        if (req.user.role !== "admin" && news.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this news" });
        }

        await news.deleteOne(); // Используем deleteOne() вместо findByIdAndDelete
        res.json({ message: "News deleted successfully" });
    } catch (error) {
        console.error("Error deleting news:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
