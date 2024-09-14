const { createYogaActivity } = require('./stravaSync');

const handleModoWebhook = async (req, res) => {
  const { action, reservation } = req.body;

  // Ensure we're only handling the check-in event
  if (action === 'reservation.checkedin') {
    // Extract relevant session data from the reservation payload
    const session = {
      name: reservation.class_session.class_name, // Activity name (e.g., "Special Class")
      date: reservation.class_session.start_datetime, // Activity start date and time
    };

    try {
      // Send the session data to Strava for synchronization
      await createYogaActivity(session);
      console.log('Séance synchronisée avec Strava.');
      res.status(200).send('Webhook received and activity synced');
    } catch (error) {
      console.error('Erreur lors de la synchronisation avec Strava :', error);
      res.status(500).send('Error syncing activity');
    }
  } else {
    console.error('Unsupported event type.');
    res.status(400).send('Unsupported event type');
  }
};

module.exports = { handleModoWebhook };