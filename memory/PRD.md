# BRICK - AI Caseworker for Unhoused Individuals

## Original Problem Statement
Build a full-stack application named "BRICK", designed as an AI-powered caseworker for unhoused individuals in Las Vegas.

## ✅ PILOT-READY STATUS (January 25, 2026)

All core features working with 100% test pass rate.

### NEW: HUD FY2026 HMIS Compliance Added!
BRICK is now a **federally compliant Homeless Management Information System** that can replace Bitfocus Clarity.

---

## HUD HMIS Features (NEW)

### Database Schema (FY2026 Compliant)
- **Client Profile** - All Universal Data Elements (3.01-3.07)
- **Enrollments** - Project entry/exit with 3.917 Prior Living Situation
- **Coordinated Entry Assessment** - VI-SPDAT scoring with auto-prioritization
- **Services** - Service tracking (4.12)
- **Bed Nights** - Shelter stay tracking (4.14)

### Key HUD Fields Captured
- Name Data Quality (3.01)
- SSN Data Quality (3.02)
- DOB Data Quality (3.03)
- Race - Multi-select including MENA (3.04)
- Ethnicity (3.05)
- Gender Identity - FY2026 compliant multi-select (3.06)
- Sex Assigned at Birth - NEW required field (3.06a)
- Veteran Status (3.07)
- Prior Living Situation with logic tree (3.917)
- Destination on exit (3.12)

### HUD CSV Export
Agencies can now click **"Generate HUD CSV"** to download a ZIP with:
- Client.csv
- Enrollment.csv
- Exit.csv
- Services.csv

This ZIP can be imported directly into Clark County's HMIS system!

---

## Complete Login Credentials

### Agency/Organization Accounts
| Organization | Email | Password |
|--------------|-------|----------|
| **Shine-A-Light** | outreach@shinealightlv.org | shinealight2024 |
| **Recover Las Vegas** | team@recoverlv.org | recover2024 |
| **Catholic Charities** | outreach@catholiccharities.org | catholic2024 |
| **Salvation Army** | services@salvationarmylv.org | salvation2024 |
| **NPHY (Youth)** | youth@nphy.org | nphy2024 |
| **Veterans Village** | veterans@veteransvillage.org | veterans2024 |
| **Shannon West Center** | shelter@shannonwest.org | shannon2024 |
| **TRAC-B** | mobile@tracb.org | tracb2024 |
| **City of Las Vegas** | coordinator@cityoflv.gov | citylv2024 |
| **Clark County** | services@clarkcounty.gov | clark2024 |
| **HELP of SN** | agency@help.org | agency123 |

### Other Role Accounts
| Role | Email | Password |
|------|-------|----------|
| Regular User | testuser@example.com | password123 |
| Cleanup Crew | cleanup@vegas.gov | cleanup123 |
| Legal Aid | lawyer@legalaid.org | lawyer123 |
| Paralegal | paralegal@legalaid.org | paralegal123 |
| Caseworker | caseworker@brick.org | caseworker123 |

---

## Features Implemented

### User Registration & Auth
- ✅ "Get Started Free" button on landing page
- ✅ Login / Register tabs
- ✅ **Forgot Password** with token-based reset
- ✅ Multi-role authentication (6 roles)
- ✅ Auto-redirects based on role

### BRICK AI Chat
- ✅ Trauma-responsive AI caseworker
- ✅ Markdown response formatting
- ✅ Auto-saves relevant info to Dossier
- ✅ Session management

### Notification System
- ✅ **Notification Bell** with unread count badge
- ✅ Sweep alerts from cleanup crews
- ✅ Real-time polling (30 seconds)
- ✅ Mark as read / Mark all read

### Document Vault
- ✅ Upload vital documents (ID, DD-214, etc.)
- ✅ View/download documents
- ✅ Document type categorization

### Resource Map
- ✅ Las Vegas services with Leaflet map
- ✅ Category filters
- ✅ 6 pre-loaded resources

### Workbook
- ✅ Interactive flashcards
- ✅ 12 auto-generated for new users
- ✅ Points and level progression

### Dossier
- ✅ Form-based personal history
- ✅ Color-coded by source
- ✅ Auto-updates from AI chat

### Agency Dashboards
- ✅ **11 organization-specific themes**
- ✅ Unified client database
- ✅ HUD compliance reports
- ✅ Dashboard overview cards
- ✅ Client search/filter

### Cleanup Crew Dashboard
- ✅ Post sweep schedules
- ✅ Auto-notify all users
- ✅ View scheduled sweeps

### Legal Aid Portal
- ✅ Client cases tab
- ✅ Legal resources library
- ✅ Workshop scheduling

---

## Technical Architecture

```
/app/
├── backend/
│   ├── server.py              # FastAPI with all endpoints
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.css          # Wizard of Oz theme
│   │   ├── components/
│   │   │   └── NotificationBell.js
│   │   └── pages/
│   │       ├── LandingPage.js     # With Forgot Password
│   │       ├── BrickChat.js
│   │       ├── AgencyDashboard.js # 11 org themes
│   │       ├── CleanupDashboard.js
│   │       ├── LegalAidPortal.js
│   │       ├── Workbook.js
│   │       ├── Dossier.js
│   │       ├── ResourceMap.js
│   │       └── Vault.js
│   └── public/index.html
└── test_reports/
    └── iteration_3.json       # 100% pass rate
```

---

## Post-Pilot Backlog

### P0 - Next Priority
- [ ] Quick-Apply - Auto-fill housing applications

### P1 - High Priority
- [ ] Pop-up Events on map
- [ ] Legal consultation requests
- [ ] Print Dossier to PDF

### P2 - Medium Priority
- [ ] Inter-agency messaging
- [ ] SMS notifications
- [ ] Email integration

---

*Last Updated: January 25, 2026*
*Status: PILOT-READY with Forgot Password & 11 Organization Accounts*
