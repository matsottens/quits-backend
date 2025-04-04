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

## TypeScript Configuration

The project has been set up with proper TypeScript configurations to ensure compatibility with all UI components. Key fixes include:

1. Ensuring TypeScript is in the main dependencies (not just devDependencies) for build environments 
2. Adding proper type declarations for:
   - React JSX intrinsic elements in `src/types/global.d.ts`
   - Radix UI components in `src/types/radix-ui.d.ts`
   - Sonner toast library in `src/types/sonner.d.ts`

3. Updated build script to directly reference TypeScript from node_modules:
   ```
   "build": "node ./node_modules/.bin/tsc --skipLibCheck && vite build"
   ```

If you encounter TypeScript errors, check that the type declarations properly match the component props being used.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 