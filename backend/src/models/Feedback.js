const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
    rating: { type: Number, min: 1, max: 5 },
    message: { type: String, default: '', maxlength: 1000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
