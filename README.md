# Modo Yoga to Strava Sync App

This personal tool syncs yoga session data from Modo Yoga to Strava automatically. When a user checks in to a class at Modo Yoga, the data is sent to Strava, logging it as a yoga activity.

Could be developped further into a plugin of easy Modo/Strava syncing for regular users. For now it needs api creds.

## Table of Contents

- [Overview](#overview)
- [How it Works](#how-it-works)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Routes](#routes)
- [Authentication](#authentication)
- [Syncing Yoga Sessions](#syncing-yoga-sessions)
- [Error Handling](#error-handling)

## Overview

This app is designed to automate the process of logging Modo Yoga class sessions into Strava as yoga activities. When a user checks in to a class, the app receives a webhook from Modo Yoga and creates an activity in Strava using Strava's API.

## How it Works

1. **Modo Yoga Webhook**: When a user checks in at Modo Yoga, the app receives a webhook notification.
2. **Strava API Authentication**: The app authenticates with the Strava API using OAuth 2.0, ensuring that it can create new activities.
3. **Syncing Data**: The app converts Modo Yoga session data into the correct format for Strava and logs the activity automatically.

## Project Structure

Here is an explanation of each file and how the code in these files interacts:

```
.
├── app.js                  # Main entry point for the app
├── config
│   └── stravaConfig.js      # Configuration file for Strava API credentials
├── controllers
│   ├── modoWebhookHandler.js # Handles incoming webhooks from Modo Yoga (In development, assistance is needed from marianatech API devs to get access)
│   ├── stravaSync.js         # Synchronizes Modo Yoga sessions with Strava
│   └── yogaSessions.js       # (Optional) Static list of yoga sessions for testing
├── env.example             # Example environment variables file
├── package.json            # Project dependencies and scripts
├── routes
│   └── apiRoutes.js         # Defines API routes for the app
└── utils
    └── stravaAuth.js        # Handles Strava API authentication
```

### File Breakdown

### `app.js`

This is the main entry point of the app, where the server is set up and started.

- **Imports**: 
  - `express`: For setting up the server.
  - `createYogaActivity` and `yogaSessions`: These are responsible for handling yoga session syncing.
  - `apiRoutes`: Defines the API routes, including the webhook listener.
  
- **Key Functionality**:
  - **Syncing Yoga Sessions**: On app startup, `yogaSessions` (a static list) is processed, and each session is synchronized to Strava using the `createYogaActivity` function. This is done in an asynchronous loop to handle each session one by one.
  - **API Route Setup**: The app mounts all routes under `/api` using `apiRoutes`.
  - **Error Handling**: A global error handler is defined to catch and log any errors.
  - **Server Start**: The app listens on the port defined in the environment variables or defaults to 3000.

### `config/stravaConfig.js`

This file holds the configuration for connecting to Strava’s API. The values come from environment variables.

```javascript
module.exports = {
  client_id: process.env.STRAVA_CLIENT_ID,
  client_secret: process.env.STRAVA_CLIENT_SECRET,
  redirect_uri: process.env.STRAVA_REDIRECT_URI,
  access_token: process.env.STRAVA_ACCESS_TOKEN,
  refresh_token: process.env.STRAVA_REFRESH_TOKEN
};
```

- **Purpose**: This configuration file centralizes API credentials (client ID, client secret, and tokens), ensuring that sensitive information is stored in environment variables and not directly in the codebase.

### `controllers/modoWebhookHandler.js (IN  DEVELOPPMENT)`

This file ****will want to**** handles the webhook events received from Modo Yoga.

- **Key Function**: `handleModoWebhook`
  - It will take in the webhook data and processes only the `reservation.checkedin` event.
  - Extracts session details (class name, start time) and calls `createYogaActivity` to sync the session with Strava.
  
```javascript
const { createYogaActivity } = require('./stravaSync');

const handleModoWebhook = async (data) => {
  const { action, reservation } = data;

  if (action === 'reservation.checkedin') {
    const session = {
      name: reservation.class_session.class_name,
      date: reservation.class_session.start_datetime,
    };
    await createYogaActivity(session);
  }
};
```

### `controllers/stravaSync.js`

This file is responsible for creating activities in Strava.

- **Key Function**: `createYogaActivity`
  - It authenticates with Strava using the `authenticateStrava` function and then sends a POST request to Strava's API to log the activity.

```javascript
const { authenticateStrava } = require('../utils/stravaAuth');

const createYogaActivity = async (session) => {
  const token = await authenticateStrava();
  await axios.post('https://www.strava.com/api/v3/activities', {
    name: session.name,
    type: 'Yoga', 
    start_date_local: session.date, 
    elapsed_time: 3600 
  }, { headers: { Authorization: `Bearer ${token}` } });
};
```

### `controllers/yogaSessions.js`

This file is optional and used to test static sessions and strava import.

```javascript
module.exports = [
  { name: 'Morning Yoga', date: '2024-09-01T08:00:00Z' },
  { name: 'Evening Yoga', date: '2024-09-01T18:00:00Z' }
];
```

- **Purpose**: Contains a static list of yoga sessions for testing and development.

### `routes/apiRoutes.js`

Defines the routes for handling API calls, including the webhook from Modo Yoga.

```javascript
const express = require('express');
const { handleModoWebhook } = require('../controllers/modoWebhookHandler');

const router = express.Router();

router.post('/webhook/modo', handleModoWebhook);

module.exports = router;
```

- **Purpose**: Exposes the `/webhook/modo` POST endpoint, which is used by Modo Yoga to notify the app when a user checks in to a class.

### `utils/stravaAuth.js`

Handles authentication with Strava, refreshing the access token using the refresh token.

- **Key Function**: `authenticateStrava`
  - Sends a request to Strava’s OAuth endpoint to get a new access token.

```javascript
const authenticateStrava = async () => {
  const response = await axios.post('https://www.strava.com/oauth/token', {
    client_id: config.client_id,
    client_secret: config.client_secret,
    refresh_token: config.refresh_token,
    grant_type: 'refresh_token',
  });
  return response.data.access_token;
};
```

### `env.example`

This file lists the environment variables that need to be configured for the app to run correctly:

```
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REDIRECT_URI=your_redirect_uri
STRAVA_ACCESS_TOKEN=your_access_token
STRAVA_REFRESH_TOKEN=your_refresh_token
```

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/modo-strava-sync.git
   cd modo-strava-sync
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on the `env.example` file and add your Strava API credentials.

## Routes

- **POST /api/webhook/modo**: Modo Yoga sends a webhook here when a user checks in. The app processes this and logs the activity to Strava.

## Authentication

Strava's OAuth 2.0 is used to authenticate the app and get a new access token when needed. The access token allows the app to interact with the Strava API to create activities.

## Syncing Yoga Sessions

The app uses the `createYogaActivity` function to send yoga session details (e.g., name, date) to Strava. These details are taken from the Modo Yoga webhook and then synced as Strava activities.

## Error Handling

The app uses a global error handler to catch any unexpected errors during requests. This ensures the app doesn't crash and provides useful error information for debugging.
