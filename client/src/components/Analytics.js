// analytics page component with terminal-inspired design
import React, { useState, useEffect } from 'react';
import apiService from '../utils/apiService';
import './Analytics.css';
import { FiCopy, FiDownload, FiBarChart2, FiClock, FiLink, FiX, FiInfo } from 'react-icons/fi';

const Analytics = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUrl, setSelectedUrl] = useState(null);

  // close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedUrl && !event.target.closest('.url-display') && !event.target.closest('.performer-url-display')) {
        setSelectedUrl(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [selectedUrl]);

  // load urls on component mount
  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const urlData = await apiService.getAllUrls();
        setUrls(urlData);
      } catch (error) {
        console.error('error loading urls:', error);
        setError('failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUrls();
  }, []);

  // calculate stats
  const totalUrls = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const activeUrls = urls.filter(url => url.clicks > 0).length;
  const topUrl = urls.reduce((top, url) => url.clicks > (top?.clicks || 0) ? url : top, null);

  // copy to clipboard function
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      setError('Failed to copy to clipboard');
    }
  };

  // delete url function
  const deleteUrl = async (shortCode) => {
    if (!window.confirm('Are you sure you want to delete this URL? This action cannot be undone.')) {
      return;
    }

    try {
      // optimistically update UI first
      setUrls(prevUrls => prevUrls.filter(url => url.shortCode !== shortCode));
      setSuccess('URL deleted successfully!');
      setTimeout(() => setSuccess(''), 2000);
      
      // then make the API call
      await apiService.deleteUrl(shortCode);
    } catch (error) {
      console.error('error deleting url:', error);
      setError(error.message || 'failed to delete url');
      // revert the optimistic update on error
      const updatedUrls = await apiService.getAllUrls();
      setUrls(updatedUrls);
    }
  };

  // sort urls
  const sortedUrls = [...urls].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // export data
  const exportData = () => {
    const csvContent = [
      ['Original URL', 'Short Code', 'Clicks', 'Created Date', 'Last Accessed'],
      ...urls.map(url => [
        url.originalUrl,
        url.shortCode,
        url.clicks,
        new Date(url.createdAt).toLocaleDateString(),
        url.lastAccessed ? new Date(url.lastAccessed).toLocaleDateString() : 'Never'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'url-analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    setSuccess('Analytics data exported!');
    setTimeout(() => setSuccess(''), 2000);
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-terminal">
          <div className="terminal-line">
            <span className="prompt">$</span>loading analytical data<span className="cursor">_</span>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="analytics-container">
      {/* header section */}
      <header className="analytics-header">
        <h1 className="analytics-title">
          Analy<span className="gradient-text">tics</span> Dashboard
        </h1>
      </header>

      {/* messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* stats overview */}
      <section className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
            <FiLink />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalUrls}</div>
            <div className="stat-label">Total URLs</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FiBarChart2 />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalClicks.toLocaleString()}</div>
            <div className="stat-label">Total Clicks</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <div className="stat-number">{activeUrls}</div>
            <div className="stat-label">Active URLs</div>
          </div>
        </div>
      </section>

      {/* top performer */}
      {topUrl && (
        <section className="top-performer">
          <h3 className="section-title">🏆 Top Performer</h3>
          <div className="performer-card">
            <div className="performer-info">
              <div className="performer-url-display">
                <a 
                  href={`${window.location.origin}/${topUrl.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="performer-short-url clickable-link"
                  title="Click to visit URL"
                >
                  {window.location.origin}/{topUrl.shortCode}
                </a>
                <button 
                  onClick={() => setSelectedUrl(selectedUrl === `top-${topUrl.id}` ? null : `top-${topUrl.id}`)}
                  className="info-btn"
                  title="View original URL"
                >
                  <FiInfo />
                </button>
              </div>
              {selectedUrl === `top-${topUrl.id}` && (
                <div className="original-url-tooltip">
                  {topUrl.originalUrl}
                </div>
              )}
            </div>
            <div className="performer-stats">
              <span className="performer-clicks">{topUrl.clicks} clicks</span>
            </div>
          </div>
        </section>
      )}

      {/* controls */}
      <section className="analytics-controls">
        <div className="sort-controls">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="createdAt">Created Date</option>
            <option value="clicks">Clicks</option>
            <option value="shortCode">Short Code</option>
          </select>
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
        
        {urls.length > 0 && (
          <button onClick={exportData} className="export-btn">
            <FiDownload />
            Export Data
          </button>
        )}
      </section>

      {/* urls section - using Home page style */}
      {urls.length > 0 && (
        <section className="recent-urls" id="recent-urls">
          <h2 className="section-title">All URLs</h2>
          <div className="urls-list">
            {sortedUrls.map((url) => (
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
                <div className="url-meta">
                  <span className="click-count">{url.clicks} clicks</span>
                  <span className="created-date">{new Date(url.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="url-actions">
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
    </div>
  );
};

export default Analytics;
