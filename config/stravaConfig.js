require('dotenv').config();

module.exports = {
  client_id: process.env.STRAVA_CLIENT_ID,
  client_secret: process.env.STRAVA_CLIENT_SECRET,
  redirect_uri: process.env.STRAVA_REDIRECT_URI,
  access_token: process.env.STRAVA_ACCESS_TOKEN,
  refresh_token: process.env.STRAVA_REFRESH_TOKEN
};