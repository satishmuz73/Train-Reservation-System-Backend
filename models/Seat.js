const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  isBooked: { type: Boolean, default: false },
});

module.exports = mongoose.model('Seat', seatSchema);
