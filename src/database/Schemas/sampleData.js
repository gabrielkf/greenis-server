const mongoose = require('mongoose');

const sampleData = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    sample: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Sample = mongoose.model('Sample', sampleData);

module.exports = Sample;
