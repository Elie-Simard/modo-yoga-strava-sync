require('dotenv').config(); // Load environment variables

const express = require('express');
const { createYogaActivity } = require('./controllers/stravaSync');
const yogaSessions = require('./controllers/yogaSessions');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
app.use(express.json()); // Parse JSON bodies (as sent by API clients)

// Sync static yoga sessions on startup (for dev testing purposes)
const syncYogaSessions = async () => {
  for (const session of yogaSessions) {
    try {
      await createYogaActivity(session); // Ensure sessions are processed one at a time
    } catch (error) {
      console.error('Error syncing session:', error);
    }
  }
};

syncYogaSessions();

// Set up routes
app.use('/api', apiRoutes); // All API routes under /api

// A basic home route (optional)
app.get('/', (req, res) => {
  res.send('Welcome to the Modo Yoga / Strava Sync app!'); // the route / is used to display a welcome message for now
});

// Global error handler (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});