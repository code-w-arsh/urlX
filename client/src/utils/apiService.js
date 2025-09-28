// api service for url shortener backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // vercel will handle api routes automatically
  : 'http://localhost:3000'; // for local development with vercel dev

class ApiService {
  constructor() {
    // generate unique browser session id
    this.sessionId = this.getOrCreateSessionId();
  }

  // get or create unique session id for this browser
  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('url_shortener_session');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('url_shortener_session', sessionId);
    }
    return sessionId;
  }

  // create shortened url
  async createShortUrl(originalUrl, customCode = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          originalUrl, 
          customCode,
          sessionId: this.sessionId 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'failed to create short url');
      }

      return data.data;
    } catch (error) {
      console.error('error creating short url:', error);
      throw error;
    }
  }

  // get all urls for this browser session
  async getAllUrls() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urls?sessionId=${this.sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'failed to fetch urls');
      }

      return data.data;
    } catch (error) {
      console.error('error fetching urls:', error);
      throw error;
    }
  }

  // get analytics for specific url
  async getUrlAnalytics(shortCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/${shortCode}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'failed to fetch analytics');
      }

      return data.data;
    } catch (error) {
      console.error('error fetching analytics:', error);
      throw error;
    }
  }

  // delete url
  async deleteUrl(shortCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/delete?shortCode=${shortCode}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId: this.sessionId 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'failed to delete url');
      }

      return data;
    } catch (error) {
      console.error('error deleting url:', error);
      throw error;
    }
  }

  // get redirect url (for click tracking)
  getRedirectUrl(shortCode) {
    return `${window.location.origin}/${shortCode}`;
  }
}

// create singleton instance
const apiService = new ApiService();

export default apiService;
