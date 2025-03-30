const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  crn: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  courseNumber: { type: String, required: true },
  title: { type: String, required: true },
  section: { type: String, required: true },
  instructor: { type: String },
  schedule: { type: String },
  campus: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
