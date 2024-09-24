const seatLayout = document.getElementById('seat-layout');

// Fetch the seats and display them on the UI
async function fetchSeats() {
  const response = await fetch('/seats-status');
  const seats = await response.json();

  seatLayout.innerHTML = ''; // Clear the current seat layout

  seats.forEach(seat => {
    const seatElement = document.createElement('div');
    seatElement.classList.add('seat');
    seatElement.textContent = seat.number;
    
    // Mark booked seats with a different style
    if (seat.isBooked) {
      seatElement.classList.add('booked');
    }
    
    seatLayout.appendChild(seatElement);
  });
}

// Function to reserve seats
async function reserveSeats() {
  const seatCount = document.getElementById('seat-count').value;
  
  // Check if the seat count is within valid range
  if (seatCount < 1 || seatCount > 7) {
    alert('Please enter a number between 1 and 7');
    return;
  }

  // Send a request to the server to reserve seats
  const response = await fetch('/reserve-seats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ seats: parseInt(seatCount) })
  });

  if (response.ok) {
    const result = await response.json();
    alert(`Seats booked: ${result.bookedSeats.map(seat => seat.number).join(', ')}`);

    // Refresh the seat layout after booking
    fetchSeats();
  } else {
    alert('Unable to book seats. Please try again.');
  }
}

// Fetch the initial seat layout when the page loads
window.onload = fetchSeats;
