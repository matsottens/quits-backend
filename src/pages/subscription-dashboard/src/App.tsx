import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignupPage />} />
      </Routes>
    </Router>
  );
}

export default App; 