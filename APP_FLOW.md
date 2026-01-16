## App Flow Guide (All Roles)

This document describes the end-to-end user flows for each role in the frontend-only REPRO PLAN app, including key pages, actions, and modal-heavy paths used during testing.

---

## Shared Entry Flow (All Roles)

### Access Portal
1. Open the app landing entry.
2. Choose access type:
   - **Main User** (Anonymous user)
   - **Stakeholder** (ADMIN, POLICE, SAFEHOUSE, MEDICAL, NGO)
3. Continue to the appropriate login/entry experience.

### Global Behaviors (All Roles)
- Offline-first storage persists mock data.
- Role-based routing loads the correct dashboard and tabs.
- All list-heavy pages have mobile card views and desktop tables where applicable.
- QR verification uses time-limited codes for anonymous validation.

---

## Main User Flow (Anonymous User)

### A. Onboarding & Access
1. **Tutorial**
   - Complete or skip the tutorial.
   - Learn core features (privacy, offline mode, emergency help).
2. **Secret Code Access (Anonymous)**
   - Enter a one-time access code for main user flow (not stakeholder).
   - Proceed to the main user dashboard.

### B. Home & Core Navigation
1. **Home**
   - Review featured content and quick actions.
   - Jump to Emergency, Clinics, Tracker, Mentorship, or QR Verification.
2. **Notifications**
   - View system updates and reminders.
3. **Settings**
   - Configure language, notifications, and local data controls.
   - Generate QR verification code.
   - Export or delete local data.

### C. Health & Services
1. **Clinics**
   - Browse clinic directory and details.
2. **Medication Order**
   - Add items to cart and submit mock orders.
3. **Patient Records (User View)**
   - Review seeded medical history.

### D. Education & Content
1. **Articles**
   - Filter by category/difficulty.
   - Bookmark and read details.
2. **Videos**
   - View list and open description modal.
   - Watch embedded content and manage offline availability.
3. **Games**
   - Access quiz, consent game, and engagement stats.

### E. Mentorship & Community
1. **Mentorship**
   - Submit mentorship requests.
   - Continue chat threads.
2. **Storytelling**
   - View community posts and stories.

### F. Safety & Emergency
1. **Emergency**
   - Trigger panic/emergency alert workflow.
   - Review emergency history logs.
2. **Secure Map**
   - Search safe spaces by type.
   - View details, request OTP, and start navigation.
3. **QR Verification**
   - Generate QR code for stakeholder verification.
   - View verification history.

### G. Offline Support
1. **Offline Mode**
   - Review offline downloads and essential content.
   - Open or remove offline items.

---

## Stakeholder Access Flow (All Roles)

### A. Role Selection
1. From the access portal, select **Stakeholder**.
2. Choose a role: **ADMIN**, **POLICE**, **SAFEHOUSE**, **MEDICAL**, **NGO**.

### B. Sign In / Sign Up
1. **Sign In**
   - Provide phone and email.
   - Receive OTP (mock).
2. **Sign Up**
   - Provide phone and email.
   - Optional survey link for follow-up context.
3. **Recover Access**
   - Use phone or email to request recovery instructions.
4. **OTP Verification**
   - Enter 6-digit code.
   - Login success routes to the role dashboard.

---

## ADMIN Flow

### Dashboard Tabs
1. **Overview**
   - Review system KPIs, alerts, and user activity.
   - Open recent activity actions (view/download).
2. **Messages**
   - Inter-role messaging with POLICE, SAFEHOUSE, MEDICAL, NGO.
3. **Users**
   - User Management: list, filter, and inspect user entries.
4. **Security**
   - Placeholder for security monitoring insights.
5. **Analytics**
   - Placeholder for analytics dashboards.
6. **Settings**
   - System Settings: notifications, security, database, API, and email config.

### Key Modals & Actions
- Activity view/download actions.
- Settings form submissions and toggle controls.

---

## POLICE Flow

### Dashboard Tabs
1. **Overview**
   - Emergency alerts summary and quick actions.
2. **Cases**
   - Case list (mobile cards, desktop table).
   - Actions: view or open case details.
3. **Incidents**
   - Incident Reports page for full case history.
   - Search and filter by status.
4. **Messages**
   - Inter-role messaging with ADMIN, SAFEHOUSE, MEDICAL, NGO.
5. **Patrol**
   - Placeholder for patrol routes and GPS tracking.

### Key Modals & Actions
- Case actions and incident filters.
- Incident detail view action.

---

## SAFEHOUSE Flow

### Dashboard Tabs
1. **Overview**
   - Active residents, capacity, and status indicators.
2. **Residents**
   - Resident list with details and status indicators.
3. **Intake**
   - Resident Intake form with immediate needs checklist.
4. **Security**
   - Security alerts with severity badges.
5. **Access**
   - Access logs (mobile cards and desktop table).
6. **Resources**
   - Placeholder for resource management.
7. **Messages**
   - Inter-role messaging with ADMIN, POLICE, MEDICAL, NGO.

### Key Modals & Actions
- Intake form submission and reset.
- Access log review.

---

## MEDICAL Flow

### Dashboard Tabs
1. **Overview**
   - Appointments overview and quick stats.
2. **Appointments**
   - Appointment list and status actions.
3. **Patients**
   - Patient Records list and detail modal.
4. **Emergency**
   - Emergency alerts with severity.
5. **Resources**
   - Placeholder for medical resource management.
6. **Messages**
   - Inter-role messaging with ADMIN, POLICE, SAFEHOUSE, NGO.

### Key Modals & Actions
- Appointment view/complete actions.
- Patient detail modal view.

---

## NGO Flow

### Dashboard Tabs
1. **Overview**
   - Program metrics and community stats.
2. **Programs**
   - Program list and details.
3. **Program Details**
   - Objectives, activities, and progress tracking.
4. **Outreach**
   - Placeholder for outreach scheduling.
5. **Resources**
   - Placeholder for resource distribution.
6. **Messages**
   - Inter-role messaging with ADMIN, POLICE, SAFEHOUSE, MEDICAL.

### Key Modals & Actions
- Program detail actions.
- Progress review.

---

## QR Verification Flow (Cross-Role)

### User
1. Open **QR Verification** page.
2. Generate QR code.
3. Share code with stakeholder staff.

### Stakeholder
1. Scan QR code.
2. Verify anonymous access and review verification history.

---

## Notes for Testing

- All flows are frontend-only with seeded mock data.
- Use `TEST_LOGINS.md` for stakeholder credentials.
- Mock data includes alerts, cases, residents, events, and incident reports.
- OTP verification accepts any 6-digit code in testing.
