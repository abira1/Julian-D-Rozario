# API Contracts - Julian D Rozario Portfolio

## Overview
This document outlines the API contracts for Julian D Rozario's 3D portfolio website. Currently, the frontend is implemented with **mock data only** for the initial preview. This contract defines how to integrate the backend for full functionality.

## Current Implementation Status
✅ **FRONTEND COMPLETE** - All sections implemented with mock data  
🔄 **BACKEND INTEGRATION** - To be implemented  

## Mock Data Used
Located in `/app/frontend/src/data/mockData.js`:
- Hero section data
- About section with stats and skills
- Services data (6 service cards)
- Blog articles (6 mock articles)
- Testimonials (3 testimonials)
- Contact information

## API Endpoints to Implement

### 1. Contact Form Submission
**Endpoint:** `POST /api/contact`
**Current:** Frontend form with mock submission
**Backend needed:**
```json
{
  "method": "POST",
  "endpoint": "/api/contact",
  "body": {
    "name": "string",
    "email": "string", 
    "message": "string"
  },
  "response": {
    "success": true,
    "message": "Thank you for your message!"
  }
}
```

### 2. Blog Articles Management
**Endpoint:** `GET /api/blog`
**Current:** Mock blog data in frontend
**Backend needed:**
```json
{
  "method": "GET",
  "endpoint": "/api/blog",
  "response": {
    "articles": [
      {
        "id": "string",
        "title": "string",
        "excerpt": "string", 
        "content": "string",
        "date": "ISO date",
        "readTime": "string",
        "category": "string",
        "author": "Julian D Rozario",
        "image": "url"
      }
    ]
  }
}
```

### 3. Newsletter Subscription (Optional)
**Endpoint:** `POST /api/newsletter`
**Backend needed:**
```json
{
  "method": "POST",
  "endpoint": "/api/newsletter", 
  "body": {
    "email": "string"
  },
  "response": {
    "success": true,
    "message": "Subscribed successfully!"
  }
}
```

### 4. Analytics/Stats (Optional)
**Endpoint:** `GET /api/stats`
**Current:** Static numbers in aboutData.stats
**Backend needed:**
```json
{
  "method": "GET",
  "endpoint": "/api/stats",
  "response": {
    "yearsExperience": 8,
    "projectsCompleted": 150,
    "clientSatisfaction": 95,
    "happyClients": 50
  }
}
```

## Database Schema Needed

### contacts Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  message: String,
  createdAt: Date,
  status: String // "new", "read", "replied"
}
```

### blog_articles Collection
```javascript
{
  _id: ObjectId,
  title: String,
  excerpt: String,
  content: String,
  slug: String,
  category: String,
  tags: [String],
  image: String,
  author: String,
  readTime: String,
  published: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### newsletter_subscribers Collection (Optional)
```javascript
{
  _id: ObjectId,
  email: String,
  subscribedAt: Date,
  status: String // "active", "unsubscribed"
}
```

## Frontend Integration Points

### Files to Update for Backend Integration:
1. **ContactSection.js** - Replace mock form submission
2. **BlogSection.js** - Replace mock blog data with API call
3. **AboutSection.js** - Replace static stats with dynamic data
4. **Create new API service file** - `/app/frontend/src/services/api.js`

### Current Mock Data Locations:
- `/app/frontend/src/data/mockData.js` - All static data
- Form submissions are currently simulated with `setTimeout`
- No actual API calls are made yet

## Next Steps for Backend Integration:

1. **Implement MongoDB models** for contacts, blog articles
2. **Create API endpoints** as specified above
3. **Replace mock data** in frontend components with API calls
4. **Add error handling** and loading states
5. **Test full-stack integration**

## 3D Effects & Performance Notes:
- **GradualBlur** and **MagicBento** components are performance-optimized
- GSAP animations are conditionally disabled on mobile for better performance
- All 3D effects use CSS transforms and are GPU-accelerated
- Particle effects are limited and cleaned up properly to prevent memory leaks

## Security Considerations:
- Contact form needs input validation and sanitization
- Rate limiting should be implemented for contact submissions
- Email validation required on both frontend and backend
- CORS configuration needed for production deployment