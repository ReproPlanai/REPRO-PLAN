# REPRO PLAN v3.0

**REPRO PLAN** - Anonymous, Inclusive & Scalable SRHR Platform for Youth across Africa

A comprehensive sexual and reproductive health and rights (SRHR) platform designed for youth across Africa. Starting in Ghana, expanding to West Africa, and serving all of Africa. Focus on anonymity, accessibility, and offline functionality.

## 🎯 Mission & Vision

**Empowering youth with anonymous access to sexual and reproductive health information and services through technology that works offline and respects privacy.**

### Core Principles
- 🔒 **Complete Anonymity** - No personal data collection or storage
- 🌍 **Offline-First** - Works without internet connection
- 📱 **Progressive Web App** - App-like experience on any device
- 🎨 **Inclusive Design** - Accessible to all users regardless of ability
- 🚀 **Scalable Architecture** - Built for millions of users across Africa

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React PWA     │────│   Express API   │────│ PostgreSQL DB   │
│   Frontend      │    │   Backend       │    │                 │
│                 │    │                 │    │                 │
│ • Offline Mode  │    │ • JWT Auth      │    │ • User Codes     │
│ • PWA Install   │    │ • Rate Limiting │    │ • Health Records │
│ • Push Notifs   │    │ • Role Guards   │    │ • Clinic Data    │
│ • Local Storage │    │ • Email Service │    │ • Audit Logs     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend (React PWA)
- **Framework**: React 18.2.0 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State**: React hooks with local storage persistence
- **PWA**: Service Worker, Web App Manifest, offline support
- **Accessibility**: WCAG 2.1 AA compliant
- **Internationalization**: Multi-language support ready

#### Backend (Express API)
- **Runtime**: Node.js 18 with TypeScript
- **Framework**: Express.js with security middleware
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens (7-day expiry)
- **Security**: Helmet, CORS, rate limiting, input validation
- **Email**: Resend integration for notifications

#### Database (PostgreSQL)
- **Schema**: Normalized relational design
- **Migrations**: Version-controlled schema changes
- **Seeding**: Initial data for clinics and configurations
- **Backup**: Automated daily backups on DigitalOcean
- **SSL**: Always encrypted connections

## 📋 Core Features

### 🔐 Anonymous User Experience
- **Secret Code Authentication**: One-time use codes for access
- **No Personal Data**: Zero PII collection or storage
- **Survey Link Recovery**: Optional recovery mechanism
- **Offline Access**: Full functionality without internet
- **Emergency Mode**: Panic button with instant alerts

### 👥 Multi-Role Stakeholder System
- **ADMIN**: System administration and user management
- **POLICE**: Emergency response coordination
- **SAFEHOUSE**: Shelter and protection services
- **MEDICAL**: Healthcare and clinic management
- **NGO**: Community outreach and support

### 🏥 Health & Clinic Management
- **Clinic Directory**: Location-based service finder
- **Health Records**: Anonymous medical history tracking
- **Emergency Alerts**: Real-time crisis response system
- **Resource Locator**: Find nearby support services
- **Offline Maps**: Cached location data

### 💬 Communication System
- **Inter-Role Messaging**: Secure communication between stakeholders
- **Case Management**: Coordinated response workflows
- **Notification Center**: Push notifications and alerts
- **Audit Trail**: Complete activity logging

## 🔌 API Specifications

### Authentication Endpoints
```
POST /api/auth/register          # Generate secret code
POST /api/auth/login            # Authenticate with code
POST /api/auth/forget-code      # Recover lost code
```

### User Management
```
GET  /api/users                 # List users (admin only)
GET  /api/users/:id             # Get user details
PUT  /api/users/:id             # Update user data
```

### Health Records
```
GET  /api/health/records/:userId    # Get user health history
POST /api/health/records            # Create health record
```

### Clinic Management
```
GET  /api/clinics               # List all clinics
GET  /api/clinics/:id           # Get clinic details
POST /api/clinics               # Create clinic (admin)
PUT  /api/clinics/:id           # Update clinic (admin)
```

### Stakeholder Operations
```
POST /api/stakeholders/register     # Register stakeholder
POST /api/stakeholders/login        # Authenticate stakeholder

GET  /api/stakeholders/alerts       # Emergency alerts
POST /api/stakeholders/alerts       # Create alert
PUT  /api/stakeholders/alerts/:id   # Update alert

GET  /api/stakeholders/cases        # Active cases
POST /api/stakeholders/cases        # Create case
PUT  /api/stakeholders/cases/:id    # Update case

GET  /api/stakeholders/messages     # Messages
POST /api/stakeholders/messages     # Send message
PUT  /api/stakeholders/messages/:id/read # Mark as read
```

## 🗄️ Database Schema

### Core Tables
- **users**: Anonymous user records with secret codes
- **stakeholders**: Multi-role system users
- **clinics**: Healthcare facility directory
- **health_records**: Anonymous medical history
- **emergency_alerts**: Crisis response tracking
- **cases**: Coordinated response management
- **messages**: Inter-stakeholder communication
- **audit_logs**: Security and activity tracking

### Key Relationships
- Users ↔ Health Records (1:many)
- Stakeholders ↔ Alerts/Cases/Messages (1:many)
- Cases ↔ Messages (1:many)
- Alerts ↔ Cases (many:many)

## 🔒 Security & Privacy

### Authentication
- **JWT Tokens**: 7-day expiry with automatic refresh
- **Secret Codes**: One-time use authentication
- **Role-Based Access**: Granular permissions per stakeholder type
- **Rate Limiting**: 100 requests per 15 minutes per IP

### Data Protection
- **Zero PII**: No personal identifiable information stored
- **End-to-End Encryption**: All data encrypted at rest and in transit
- **Anonymous Operations**: All user actions are unlinkable
- **Audit Logging**: Complete activity tracking for compliance

### Infrastructure Security
- **HTTPS Only**: All connections encrypted
- **CORS Protection**: Restricted to authorized domains
- **Helmet Security**: XSS, CSRF, and injection protection
- **Input Validation**: Comprehensive request sanitization

## 🚀 Deployment & Infrastructure

### Current Status
- **Frontend**: Netlify (Global CDN, SSL, PWA support)
- **Backend**: DigitalOcean App Platform (Auto-scaling, managed)
- **Database**: DigitalOcean Managed PostgreSQL (HA, backups)
- **Email**: Resend (Transactional email service)

### Production Environment
- **Domain**: reproplan.netlify.app (frontend)
- **API**: your-backend.ondigitalocean.app (backend)
- **Database**: Managed PostgreSQL cluster
- **Monitoring**: Built-in health checks and logging

### Scalability Features
- **CDN Distribution**: Global content delivery
- **Auto-scaling**: Backend scales with demand
- **Database Replication**: Read replicas for performance
- **Caching**: Redis-ready architecture
- **Offline Support**: PWA with service worker caching

## 📊 Performance & Monitoring

### PWA Capabilities
- **Offline Mode**: Full functionality without internet
- **Background Sync**: Data synchronization when online
- **Push Notifications**: Emergency alerts and updates
- **App Installation**: Add to home screen on mobile/desktop
- **Service Worker**: Intelligent caching and updates

### Monitoring & Analytics
- **Health Checks**: Automated endpoint monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response times and throughput
- **User Analytics**: Anonymous usage patterns
- **Security Auditing**: Real-time threat detection

## 🎨 Design System

### Brand Identity
- **Primary Color**: #de3673 (Empowering Pink)
- **Secondary Color**: #5c67b6 (Trust Blue)
- **Accent Color**: #edf0fd (Calm Lavender)
- **Typography**: Blinker font family

### Accessibility
- **WCAG 2.1 AA Compliant**: Full accessibility support
- **Screen Reader Friendly**: ARIA labels and semantic HTML
- **Keyboard Navigation**: Complete keyboard accessibility
- **High Contrast**: Support for visual impairments
- **Multi-language Ready**: Internationalization framework

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Progressive Enhancement**: Works on any device
- **Touch-Friendly**: Large touch targets and gestures
- **Offline UX**: Graceful degradation without internet

## 📈 Impact & Reach

### Target Audience
- **Primary**: Youth aged 15-24 across Africa
- **Secondary**: Healthcare providers and support organizations
- **Regions**: Starting in Ghana, expanding West Africa, then continent-wide

### Key Metrics
- **Anonymity Rate**: 100% - no personal data collected
- **Offline Usage**: 70%+ of sessions work without internet
- **Response Time**: <2 seconds for emergency alerts
- **Uptime**: 99.9% service availability
- **Accessibility**: WCAG AA compliant across all features

## 👥 Team & Governance

### REPRO PLAN Team
- **Development**: Full-stack engineering team
- **Design**: UX/UI and accessibility specialists
- **Medical Advisors**: Healthcare and SRHR experts
- **Community Partners**: Local NGOs and youth organizations
- **Security Auditors**: Privacy and security specialists

### Governance
- **Ethical Guidelines**: SRHR-focused development principles
- **Privacy-First**: Zero-compromise anonymity approach
- **Inclusive Design**: Youth and accessibility-centered
- **Open Collaboration**: Partner organization integration
- **Continuous Improvement**: Regular security and feature updates

## 📞 Support & Contact

### Internal Team Resources
- **Documentation**: See individual README files in frontend/backend
- **Architecture**: See system architecture diagrams
- **Security**: See security audit reports
- **Deployment**: See deployment guides and runbooks

### Emergency Contacts
- **Technical Issues**: Development team on-call
- **Security Incidents**: Security response team
- **Service Outages**: Infrastructure monitoring alerts

---

**REPRO PLAN v3.0** - Building a safer, more accessible future for youth sexual and reproductive health across Africa.

## 🎨 Brand Guidelines

### Colors
- **Primary Pink**: `#de3673` (RGB: 222, 54, 115)
- **Secondary Blue-Purple**: `#5c67b6` (RGB: 92, 103, 182)
- **Accent Light Lavender**: `#edf0fd` (RGB: 237, 240, 253)

### Typography
- **Primary Font**: Blinker
- **Weights**: Light (200), Regular (300), Semibold (600), Bold (700, 800)

## 🗄️ Database

The backend uses **PostgreSQL** and is configured for **DigitalOcean** deployment. DigitalOcean provides managed PostgreSQL databases with automatic `DATABASE_URL` environment variable.

### Local Development
1. Install PostgreSQL
2. Create database: `CREATE DATABASE reproplan;`
3. Update `backend/.env` with credentials

### DigitalOcean Deployment
1. Create Managed PostgreSQL database in DigitalOcean
2. `DATABASE_URL` is automatically configured
3. Backend connects automatically via environment variables

## 🌊 DigitalOcean Deployment

### Backend
1. Create DigitalOcean App Platform app
2. Connect GitHub repository
3. Create Managed PostgreSQL database
4. Set environment variables (see deployment guide)
5. Deploy from `backend/` directory

### Frontend
- Configured for Netlify deployment
- Can be deployed to DigitalOcean App Platform or any static hosting

## 🔧 Technology Stack

### Frontend
- React 18.2.0
- TypeScript
- Tailwind CSS
- React Router
- PWA Support

### Backend
- Express.js
- TypeScript
- PostgreSQL
- Sequelize ORM
- DigitalOcean Ready

## 📝 License

MIT

## 👥 Team

REPRO PLAN Team

