const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    content: { type: String, required: true },
})

module.exports = mongoose.model('Comment', CommentSchema)