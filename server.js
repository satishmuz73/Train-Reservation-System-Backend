const express = require("express");
const mongoose = require("mongoose");
const Seat = require("./models/Seat");
const app = express();

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/trainBooking", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    // Seed the database with seats on server start
    const seatCount = await Seat.countDocuments(); // Check if the seats are already present

    if (seatCount === 0) {
      // If no seats exist, seed the database
      const seats = [];
      for (let i = 1; i <= 80; i++) {
        seats.push({ number: i, isBooked: false });
      }
      await Seat.insertMany(seats);
      console.log("Database seeded with 80 seats.");
    } else {
      console.log("Seats already present in the database.");
    }
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

// Fetch seat status
app.get("/seats-status", async (req, res) => {
  const seats = await Seat.find();
  res.json(seats);
});

// Reserve seats
app.post('/reserve-seats', async (req, res) => {
    const { seats } = req.body;
  
    if (!seats || seats < 1 || seats > 7) {
      return res.status(400).json({ message: 'Invalid seat count. Must be between 1 and 7.' });
    }
  
    try {
      // Find available seats
      const availableSeats = await Seat.find({ isBooked: false }).sort({ number: 1 });
  
      if (availableSeats.length < seats) {
        return res.status(400).json({ message: 'Not enough seats available.' });
      }
  
      let bookedSeats = [];
  
      // Attempt to book seats in a single row if possible
      for (let i = 0; i < availableSeats.length; i++) {
        const currentRow = Math.floor((availableSeats[i].number - 1) / 7);
        let consecutive = true;
  
        for (let j = 0; j < seats; j++) {
          if (i + j >= availableSeats.length || Math.floor((availableSeats[i + j].number - 1) / 7) !== currentRow) {
            consecutive = false;
            break;
          }
        }
  
        if (consecutive) {
          bookedSeats = availableSeats.slice(i, i + seats);
          break;
        }
      }
  
      // If no consecutive seats found, book nearby seats
      if (bookedSeats.length === 0) {
        bookedSeats = availableSeats.slice(0, seats);
      }
  
      // Update the selected seats as booked in the database
      const seatIds = bookedSeats.map(seat => seat._id);
      await Seat.updateMany({ _id: { $in: seatIds } }, { $set: { isBooked: true } });
  
      // Fetch the updated status of all seats
      const allSeats = await Seat.find().sort({ number: 1 });
  
      res.json({
        bookedSeats,
        allSeats
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error booking seats' });
    }
  });
  
  
// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
