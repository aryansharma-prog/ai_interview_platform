const mongoose = require('mongoose');

// Daily rollup per user, used to power progress charts efficiently.
const analyticsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    interviewsCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    topicAccuracy: [
      {
        topic: String,
        accuracy: Number,
      },
    ],
  },
  { timestamps: true }
);

analyticsSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
