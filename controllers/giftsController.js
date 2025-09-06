const Gift = require("../models/Gift");
const User = require("../models/User");
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

const sendGift = async (req, res) => {
    try {
        const { receiverId, type, content } = req.body;
        const senderId = req.user.id;

        // Validate receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        let fileUrl = null;
        let fileName = null;

        if (type === 'image' || type === 'audio') {
            if (!req.file) {
                return res.status(400).json({ message: 'File is required for image/audio gifts' });
            }
            fileUrl = req.file.path;
            fileName = req.file.originalname;
        }

        const gift = new Gift({
            sender: senderId,
            receiver: receiverId,
            type,
            content: type === 'message' ? content : null,
            fileUrl,
            fileName
        });

        await gift.save();

        res.status(201).json({
            message: 'Gift sent successfully',
            gift: {
                id: gift._id,
                type: gift.type,
                createdAt: gift.createdAt
            }
        });
    } catch (error) {
        console.error('Error sending gift:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getReceivedGifts = async (req, res) => {
    try {
        const userId = req.user.id;

        const gifts = await Gift.find({ receiver: userId })
            .populate('sender', 'username')
            .sort({ createdAt: -1 });

        res.json(gifts);
    } catch (error) {
        console.error('Error fetching gifts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const markGiftAsRead = async (req, res) => {
    try {
        const { giftId } = req.params;
        const userId = req.user.id;

        const gift = await Gift.findOneAndUpdate(
            { _id: giftId, receiver: userId },
            { isRead: true },
            { new: true }
        );

        if (!gift) {
            return res.status(404).json({ message: 'Gift not found' });
        }

        res.json({ message: 'Gift marked as read' });
    } catch (error) {
        console.error('Error marking gift as read:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    sendGift,
    getReceivedGifts,
    markGiftAsRead,
    upload
};