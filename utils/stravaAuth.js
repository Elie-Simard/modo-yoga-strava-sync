const axios = require('axios');
const config = require('../config/stravaConfig');

const authenticateStrava = async () => {
  try {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: config.client_id,
      client_secret: config.client_secret,
      refresh_token: config.refresh_token,
      grant_type: 'refresh_token',
    });
    console.log('New Access Token:', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('Error authenticating with Strava:', {
      message: error.message,
      status: error.response ? error.response.status : 'No response status',
      data: error.response ? error.response.data : 'No response data',
      headers: error.response ? error.response.headers : 'No response headers',
    });
  }
};

module.exports = { authenticateStrava };