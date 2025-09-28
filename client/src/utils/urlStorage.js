// localStorage-based URL storage for browser-specific sessions
class URLStorage {
  constructor() {
    this.storageKey = 'urlShortener_urls';
    this.sessionKey = 'urlShortener_sessionId';
  }

  // generate unique session id for this browser
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
  }

  // get or create session id
  getSessionId() {
    let sessionId = localStorage.getItem(this.sessionKey);
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem(this.sessionKey, sessionId);
    }
    return sessionId;
  }

  // generate short code
  generateShortCode() {
    return Math.random().toString(36).substring(2, 8);
  }

  // save URL to localStorage
  saveUrl(originalUrl, customCode = null) {
    const sessionId = this.getSessionId();
    const shortCode = customCode || this.generateShortCode();
    
    // check if custom code already exists
    if (customCode && this.getUrlByShortCode(shortCode)) {
      throw new Error('Custom code already exists');
    }

    const urlData = {
      id: Date.now().toString(),
      originalUrl,
      shortCode,
      sessionId,
      createdAt: new Date().toISOString(),
      clicks: 0
    };

    const urls = this.getAllUrls();
    urls.push(urlData);
    localStorage.setItem(this.storageKey, JSON.stringify(urls));

    return urlData;
  }

  // get all URLs from localStorage
  getAllUrls() {
    try {
      const urls = localStorage.getItem(this.storageKey);
      return urls ? JSON.parse(urls) : [];
    } catch (error) {
      console.error('Error reading URLs from localStorage:', error);
      return [];
    }
  }

  // get URLs for current session
  getSessionUrls() {
    const sessionId = this.getSessionId();
    const allUrls = this.getAllUrls();
    return allUrls.filter(url => url.sessionId === sessionId);
  }

  // get URL by short code
  getUrlByShortCode(shortCode) {
    const allUrls = this.getAllUrls();
    return allUrls.find(url => url.shortCode === shortCode);
  }

  // increment click count
  incrementClicks(shortCode) {
    const urls = this.getAllUrls();
    const urlIndex = urls.findIndex(url => url.shortCode === shortCode);
    
    if (urlIndex !== -1) {
      urls[urlIndex].clicks += 1;
      localStorage.setItem(this.storageKey, JSON.stringify(urls));
      return urls[urlIndex];
    }
    
    return null;
  }

  // delete URL
  deleteUrl(shortCode) {
    const sessionId = this.getSessionId();
    const urls = this.getAllUrls();
    const filteredUrls = urls.filter(url => 
      !(url.shortCode === shortCode && url.sessionId === sessionId)
    );
    
    localStorage.setItem(this.storageKey, JSON.stringify(filteredUrls));
    return filteredUrls.length < urls.length;
  }

  // clear all URLs for current session
  clearSessionUrls() {
    const sessionId = this.getSessionId();
    const urls = this.getAllUrls();
    const otherSessionUrls = urls.filter(url => url.sessionId !== sessionId);
    
    localStorage.setItem(this.storageKey, JSON.stringify(otherSessionUrls));
  }

  // get analytics for a URL
  getUrlAnalytics(shortCode) {
    const sessionId = this.getSessionId();
    const url = this.getUrlByShortCode(shortCode);
    
    if (url && url.sessionId === sessionId) {
      return {
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        clicks: url.clicks,
        createdAt: url.createdAt,
        sessionId: url.sessionId
      };
    }
    
    return null;
  }
}

// create singleton instance
const urlStorage = new URLStorage();

export default urlStorage;
