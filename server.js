/**
 * Quits API - Backend Service
 * This is the main entry point for the Quits API
 */

// Import the main application
const app = require('./server/index');

// Re-export the app for Vercel
module.exports = app; 