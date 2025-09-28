# URLX - Advanced URL Shortener

Transform long URLs into short, trackable links with advanced analytics. Built with modern web technologies and optimized for speed, reliability, and user experience.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20URLX-teal?style=for-the-badge&logo=vercel)](https://url-shortener.arshfs.tech/)

## Features

- **URL Shortening Service** - Base-36 random generation with collision detection
- **Custom Domain Support** - Personalized short links with custom aliases  
- **Analytics Tracking** - Comprehensive click analytics and performance metrics
- **Real-time Dashboard** - Live statistics and URL management interface
- **Responsive Design** - Cross-platform compatibility with mobile-first approach
- **Dark Theme Interface** - Modern black and teal gradient design

## Tech Stack

**Frontend:** React.js 18+ • CSS3 Grid/Flexbox • Responsive Design  
**Backend:** Node.js Serverless Functions • MongoDB Atlas • RESTful API  
**Deployment:** Vercel Platform • Environment Management • CI/CD Pipeline

## Project Structure

```
urlx/
├── api/
│   ├── shorten.js              # url shortening with collision detection
│   ├── urls.js                 # bulk url retrieval with pagination
│   ├── delete.js               # url deletion with validation
│   ├── [shortCode].js          # dynamic redirect handler
│   └── analytics/[shortCode].js # detailed analytics endpoint
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js         # main shortening interface
│   │   │   ├── Home.css        # home component styles
│   │   │   ├── Analytics.js    # analytics dashboard
│   │   │   └── Analytics.css   # analytics component styles
│   │   ├── utils/
│   │   │   ├── apiService.js   # centralized api communication
│   │   │   └── urlStorage.js   # local storage management
│   │   ├── App.js              # root component with routing
│   │   ├── App.css             # global component styles
│   │   ├── index.js            # react entry point
│   │   └── index.css           # global css variables
│   └── package.json            # frontend dependencies
├── .env.example                # environment template
├── .gitignore                  # git ignore patterns
├── vercel.json                 # deployment configuration
├── package.json                # root dependencies
└── README.md                   # project documentation
```

## Quick Setup

**Clone & Install**
```bash
git clone https://github.com/code-w-arsh/urlX.git
cd urlX
npm install
cd client && npm install && cd ..
```

**Run Locally**
```bash
cd client && npm start
# app runs on http://localhost:3000
```

## API Endpoints

**POST /api/shorten** - Create short URL
```json
{
  "originalUrl": "https://example.com/very-long-url",
  "customCode": "optional-custom-code"
}
```

**GET /api/urls** - Get recent URLs (limit 10)

**GET /[shortCode]** - Redirect to original URL

**GET /api/analytics/[shortCode]** - Get URL analytics

## Technical Implementation

**URL Shortening Algorithm**
- Collision detection with retry mechanism
- 6-character unique code generation
- URL validation and sanitization
- Custom alias support

**Database Optimization**
- Compound indexes on shortCode and sessionId
- Cached MongoDB connections for serverless
- Aggregation pipelines for analytics
- Schema validation with error handling

**Frontend Architecture**
- Modular React components
- Custom API service layer
- Mobile-first responsive design
- Real-time state management

## Performance

- **Response Time:** < 200ms average
- **Uptime:** 99.9% with Vercel infrastructure
- **Scalability:** Auto-scaling serverless functions
- **Database:** Global MongoDB Atlas clusters

## Skills Demonstrated

- RESTful API design and serverless architecture
- React.js with modern hooks and state management
- MongoDB database optimization and indexing
- Responsive CSS with Grid/Flexbox layouts
- Git workflow and production deployment
- Error handling and input validation

---

<div align="center">

**Built with** ❤️ **by Arsh**

[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-teal?style=flat-square&logo=vercel)](https://arshfs.tech/) [![GitHub](https://img.shields.io/badge/GitHub-Follow-28a745?style=flat-square&logo=github)](https://github.com/code-w-arsh) [![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/sync-w-arsh/)

</div>
