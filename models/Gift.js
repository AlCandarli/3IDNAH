const mongoose = require("mongoose");

const giftSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: ['message', 'image', 'audio'],
            required: true
        },
        content: {
            type: String,
            required: function() {
                return this.type === 'message';
            }
        },
        fileUrl: {
            type: String,
            required: function() {
                return this.type === 'image' || this.type === 'audio';
            }
        },
        fileName: {
            type: String
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Gift', giftSchema);