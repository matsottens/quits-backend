const { google } = require('googleapis');

// Gmail API scopes
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.metadata'
];

// Create Gmail API client
const createGmailClient = (accessToken) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth });
};

// Search query for subscription emails
const SEARCH_QUERY = 'subject:(subscription OR "renewal notice" OR "payment receipt" OR "invoice")';

module.exports = {
  SCOPES,
  createGmailClient,
  SEARCH_QUERY
}; 