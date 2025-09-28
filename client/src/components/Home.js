// home component with url shortening functionality
import React, { useState, useEffect } from 'react';
import apiService from '../utils/apiService';
import './Home.css';
import { FiCopy, FiExternalLink, FiX, FiInfo } from 'react-icons/fi';

const Home = () => {
  // state management for form inputs and ui
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentUrls, setRecentUrls] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);

  // close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedUrl && !event.target.closest('.url-display')) {
        setSelectedUrl(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [selectedUrl]);

  // load urls from api on component mount
  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const urls = await apiService.getAllUrls();
        setRecentUrls(urls);
      } catch (error) {
        console.error('error loading urls:', error);
        setError('failed to load urls');
      }
    };
    
    fetchUrls();
  }, []);


  // handle form submission for url shortening
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setResult(null);

    try {
      // create url using api service
      const urlData = await apiService.createShortUrl(url, customCode || null);
      
      setResult({
        originalUrl: urlData.originalUrl,
        shortUrl: urlData.shortUrl,
        shortCode: urlData.shortCode
      });
      
      setSuccess('URL shortened successfully!');
      
      // refresh the urls list
      const updatedUrls = await apiService.getAllUrls();
      setRecentUrls(updatedUrls);
      
      // clear form
      setUrl('');
      setCustomCode('');
      
    } catch (error) {
      console.error('error shortening url:', error);
      setError(error.message || 'failed to shorten url');
    } finally {
      setLoading(false);
    }
  };

  // function to copy text to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      setError('Failed to copy to clipboard');
    }
  };



  // function to delete a url
  const deleteUrl = async (shortCode) => {
    if (!window.confirm('Are you sure you want to delete this URL? This action cannot be undone.')) {
      return;
    }

    try {
      // optimistically update UI first
      setRecentUrls(prevUrls => prevUrls.filter(url => url.shortCode !== shortCode));
      setSuccess('URL deleted successfully!');
      setTimeout(() => setSuccess(''), 2000);
      
      // then make the API call
      await apiService.deleteUrl(shortCode);
    } catch (error) {
      console.error('error deleting url:', error);
      setError(error.message || 'failed to delete url');
      // revert the optimistic update on error
      const updatedUrls = await apiService.getAllUrls();
      setRecentUrls(updatedUrls);
    }
  };

  return (
    <div className="container">
      {/* hero section with title and description */}
      <header className="hero">
        <h1 className="hero-title">URL Short<span className="gradient-text">ener</span></h1>
        <p className="hero-subtitle">Transform long URLs into short, shareable links with analytics</p>
      </header>

      {/* main application content */}
      <main className="main">
        {/* url shortening form */}
        <form onSubmit={handleSubmit} className="url-form">
          <div className="input-group">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your long URL here..."
              required
              className="form-input"
            />
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="Custom code (optional)"
              className="form-input"
              maxLength="20"
            />
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>

        {/* error and success message display */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* shortened url result display */}
        {result && (
          <div className="result-section">
            <div className="result-card">
              <h3 className="result-title">Your Short<span className="gradient-text">ened</span> URL</h3>
              <div className="url-display">
                <input
                  type="text"
                  value={result.shortUrl}
                  readOnly
                  className="result-input"
                />
                <div className="url-actions">
                  <button
                    onClick={() => copyToClipboard(result.shortUrl)}
                    className="action-btn copy-btn"
                    title="Copy to clipboard"
                  >
                    <FiCopy />
                  </button>
                  <a
                    href={result.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn visit-btn"
                    title="Visit original URL"
                  >
                    <FiExternalLink />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* user's urls section - only show if user has created URLs */}
        {recentUrls.length > 0 && (
          <section className="recent-urls" id="recent-urls">
            <h2>My URLs</h2>
            <div className="urls-list">
              {recentUrls.map((url) => (
                <div key={url.id} className="url-item">
                  <div className="url-info">
                    <div className="url-display">
                      <a 
                        href={`${window.location.origin}/${url.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="short-url clickable-link"
                        title="Click to visit URL"
                      >
                        {window.location.origin}/{url.shortCode}
                      </a>
                      <button 
                        onClick={() => setSelectedUrl(selectedUrl === url.id ? null : url.id)}
                        className="info-btn"
                        title="View original URL"
                      >
                        <FiInfo />
                      </button>
                    </div>
                    {selectedUrl === url.id && (
                      <div className="original-url-tooltip">
                        {url.originalUrl}
                      </div>
                    )}
                  </div>
                  <div className="url-actions">
                    <span className="click-count">{url.clicks} clicks</span>
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}/${url.shortCode}`)}
                      className="action-btn copy-btn-small"
                      title="Copy to clipboard"
                    >
                      <FiCopy />
                    </button>
                    <button
                      onClick={() => deleteUrl(url.shortCode)}
                      className="action-btn delete-btn"
                      title="Delete URL"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default Home;
