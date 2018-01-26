const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// Schema
const userSchema = new Schema({ 
    username: String,
    googleID: String,
    image: String
})

// Model
const User = mongoose.model('user', userSchema)

module.exports = User;