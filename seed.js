const mongoose = require('mongoose');
const Seat = require('./models/Seat');

mongoose.connect('mongodb://localhost:27017/trainBooking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  await Seat.deleteMany({});  // Clear existing seats

  const seats = [];
  for (let i = 1; i <= 80; i++) {
    seats.push({ number: i, isBooked: false });
  }

  await Seat.insertMany(seats);
  console.log('Database seeded with 80 seats.');
  process.exit();
});
