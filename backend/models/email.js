const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  subject: String,
  from: String,
  date: Date,
  body: String,
  category: String,
});

module.exports = mongoose.model('Email', EmailSchema);