// main react component for url shortener application
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FiGithub, FiMenu, FiX } from 'react-icons/fi';
import { FaLinkedin } from 'react-icons/fa';
import Home from './components/Home';
import Analytics from './components/Analytics';
import './App.css';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);


  return (
    <Router>
      <div className="App">
        {/* navigation header with logo and mobile menu */}
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              <div className="terminal-logo">
                <div className="terminal-dot teal-gradient"></div>
                <div className="terminal-dot white"></div>
                <div className="terminal-dot teal-gradient"></div>
              </div>
              <span className="logo-text">URL-<span className="gradient-text">X</span></span>
            </Link>
            
            {/* desktop navigation menu */}
            <div className="nav-menu">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/analytics" className="nav-link">Analytics</Link>
            </div>

            {/* mobile menu toggle button */}
            <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </div>
          </div>

          {/* mobile navigation menu */}
          {mobileMenuOpen && (
            <div className="mobile-menu">
              <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/analytics" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Analytics</Link>
            </div>
          )}
        </nav>

        {/* routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>

        {/* footer section */}
        <footer className="footer">
          <div className="footer-content">
            <p className="footer-text">Built with <span className="heart">♥</span> by <a href="https://arshfs.tech/" target="_blank" rel="noopener noreferrer" className="footer-link">Arsh</a></p>
            <span className="big-dot">•</span>
            <div className="social-links">
              <a href="https://www.linkedin.com/in/sync-w-arsh/" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaLinkedin />
              </a>
              <a href="https://github.com/code-w-arsh" target="_blank" rel="noopener noreferrer" className="social-link">
                <FiGithub />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
