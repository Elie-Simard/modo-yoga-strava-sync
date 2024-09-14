const axios = require('axios');
const { authenticateStrava } = require('../utils/stravaAuth');

const createYogaActivity = async (session) => {
  try {
    const token = await authenticateStrava();
    const response = await axios.post(
      'https://www.strava.com/api/v3/activities',
      {
        name: session.name,
        type: 'Yoga',  // Fixed type for all activities
        start_date_local: session.date,  // Date and time for the activity
        elapsed_time: 3600  // Fixed duration (1 hour)
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Successfully created activity:', response.data);
  } catch (error) {
    console.error('Error creating activity:', {
      message: error.message,
      status: error.response ? error.response.status : 'No response status',
      data: error.response ? error.response.data : 'No response data',
      headers: error.response ? error.response.headers : 'No response headers'
    });
  }
};

module.exports = { createYogaActivity };