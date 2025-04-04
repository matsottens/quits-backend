# Quits Frontend

Subscription management application.

Last deployment trigger: 2025-04-03

## Features

- User authentication
- Subscription management
- Notification system
- User settings
- Modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/quits.git
```

2. Install dependencies:
```bash
cd quits
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Technologies Used

- React
- TypeScript
- React Router
- Tailwind CSS
- Headless UI

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Local Development

The application supports running in local development mode with mock data. This allows you to develop and test the UI without needing a backend API server.

When running in local development mode:
- The application will display a "Dev Mode" indicator in various components
- API requests are intercepted and mock data is returned
- Authentication tokens are simulated
- No actual API calls are made to external services

To run the application in local development mode:
```bash
npm run dev
``` 