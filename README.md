# REPRO PLAN

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
┌───────────────────────────────────────────┐
│               React PWA                  │
│               Frontend                   │
│                                           │
│ • Offline Mode     • Local Storage        │
│ • PWA Install      • Service Worker       │
│ • Push Notifs      • Accessibility        │
└───────────────────────────────────────────┘
```

### Technology Stack

#### Frontend (React PWA)
- **Framework**: React 18.2.0 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State**: React hooks with local storage persistence
- **PWA**: Service Worker, Web App Manifest, offline support
- **Accessibility**: WCAG 2.1 AA compliant
- **Internationalization**: Multi-language support ready

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

## 🔒 Security & Privacy

### Authentication
- **Secret Codes**: One-time use authentication (frontend-only in testing)
- **Role-Based Access**: Granular permissions per stakeholder type

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

### Production Environment
- **Domain**: reproplan.netlify.app (frontend)
- **Monitoring**: Built-in health checks and logging

### Scalability Features
- **CDN Distribution**: Global content delivery
- **Caching**: PWA with service worker caching
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

## 🧪 Testing & Mock Data

Added persistent mock data for key role workflows and modal-heavy areas by seeding offline storage at app startup.

What’s now seeded for full feature/modals testing:
- SRHR alerts (`srhr_alerts`)
- Chatbot history (`chat_history`)
- Quiz stats (`quiz_stats`)
- Consent game stats (`consent_game_stats`)
- Cycle tracker data (`cycle_data`)
- Mentorship requests & chat (`mentorship_requests`, `chat_messages`)

Additional seeded datasets for broader role coverage:
- Safe spaces (`safe_spaces`)
- Emergency contacts/logs (`emergency_contacts`, `emergency_logs`)
- Inclusive services/resources/support groups (`inclusive_services`, `inclusive_resources`, `support_groups`)
- Storytelling posts (`srhr_stories`)
- QR verification history (`repro-plan-verification-history`)

Changes:
- `frontend/src/utils/offlineStorage.ts` now handles array storage correctly and includes `seedMockData()`.
- `frontend/src/App.tsx` calls `offlineStorage.seedMockData()` during initialization.

If you want more seeded datasets (e.g., Safe Space entries, Emergency logs, QR verification history), tell me which ones and I’ll add them.

---

**REPRO PLAN v3.0** - Building a safer, more accessible future for youth sexual and reproductive health across Africa.

