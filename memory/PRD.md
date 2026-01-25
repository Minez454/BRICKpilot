# BRICK - AI Caseworker for Unhoused Individuals

## Original Problem Statement
Build a full-stack application named "BRICK", designed as an AI-powered caseworker for unhoused individuals in Las Vegas. The app should have:
- Trauma-responsive AI chatbot (BRICK) that learns user stories and guides them
- Live resource map showing nearby services and pop-up events
- Secure document vault for vital documents (IDs, DD-214, etc.)
- Personalized workbook with flashcards and tasks
- Legal aid portal with forms and workshop calendar
- Administrative backend for agencies with HUD-compliant reporting
- Multi-role system with unique dashboards for each role

## User Personas
1. **Unhoused Individual (Primary User)** - Needs guidance, resource access, document storage
2. **Agency Staff** - Needs unified client database, HUD reporting, event posting
3. **Cleanup Crew** - Posts sweep schedules to alert individuals
4. **Legal Professional** - Assists users with legal matters, forms, consultations
5. **TRAC-B/Healthcare** - Posts mobile service locations

## Design Theme
**"Wizard of Oz" Premium Theme** - User explicitly requested:
- Emerald green gradients (Emerald City)
- Gold/yellow accents (Yellow Brick Road)
- Ruby red highlights
- Glitter/sparkle effects
- Premium typography (Cinzel serif for headings)
- No generic "AI slop" aesthetic
- **NO Emergent branding**

---

## What's Been Implemented

### Core Features (Complete)
- ✅ **Multi-Role Authentication** - JWT-based auth with roles: user, agency_staff, cleanup_crew, legal_aid, caseworker
- ✅ **BRICK AI Chat** - Trauma-responsive AI powered by Emergent LLM Key, auto-updates dossier
- ✅ **Resource Map** - Leaflet map with Las Vegas shelters, food banks, medical, legal services
- ✅ **Interactive Workbook** - Flashcard system with multiple choice, points, levels
- ✅ **Form-Based Dossier** - Comprehensive personal history form with color-coded sources
- ✅ **Unified Agency Database** - Cross-agency client data sharing with HUD reporting

### Dashboard Implementations (Complete)
- ✅ **Agency Dashboard** - Unified client list, HUD reports, search/filter, organization-specific theming
- ✅ **Cleanup Dashboard** - Post sweep schedules, view scheduled operations
- ✅ **Legal Aid Portal** - Case management tabs, consultation requests, resources library
- ✅ **Dashboard Overview Cards** - Key metrics at a glance on all role dashboards

### Organization-Specific Branding (January 2026)
- ✅ **Shine-A-Light Las Vegas** - Amber/yellow sun theme with "Bringing Light to Those in Need" tagline
- ✅ **Recover Las Vegas** - Teal/emerald leaf theme with "Recovery. Restoration. Hope." tagline
- ✅ **HELP of Southern Nevada** - Blue/indigo theme with custom branding

### UI/UX Redesign (Complete - January 2026)
- ✅ **Premium Wizard of Oz Theme** applied to all pages
- ✅ **Removed all "Made with Emergent" branding**
- ✅ **Gold shimmer text effects** on BRICK logo
- ✅ **Glitter/sparkle animations** throughout
- ✅ **Emerald gradient backgrounds** 
- ✅ **Feature cards with rainbow gradient borders**
- ✅ **Role-specific color themes** (emerald for agency, amber for cleanup, purple for legal)

### Backend APIs (Complete)
- `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- `/api/chat/message` - AI chat with session management
- `/api/dossier` - GET/POST personal history
- `/api/workbook/tasks`, `/api/workbook/stats`
- `/api/flashcards` - GET/POST/answer
- `/api/agency/clients/unified` - Cross-agency client database
- `/api/caseworker/hud-report` - HUD-compliant reporting
- `/api/cleanup/sweeps` - POST/GET sweep schedules
- `/api/legal/cases` - Legal case management
- `/api/resources` - Las Vegas services
- `/api/events/popup` - Pop-up events

---

## Prioritized Backlog

### P0 - Critical (Next)
- [ ] **Vault Implementation** - Secure document upload/storage with encryption
- [ ] **Quick-Apply Feature** - Auto-fill applications from Dossier data

### P1 - High Priority
- [ ] Pop-up Event creation UI for agencies (map integration)
- [ ] Sweep notifications to affected users
- [ ] Legal consultation request flow

### P2 - Medium Priority
- [ ] Enhanced BRICK AI - Generate workbook tasks from flashcard answers
- [ ] Real-time notifications system
- [ ] Print/export Dossier to PDF
- [ ] Inter-agency messaging

### P3 - Low Priority / Backlog
- [ ] TRAC-B specific dashboard
- [ ] Mobile app optimization
- [ ] Offline mode for resource access
- [ ] SMS notifications

---

## Technical Architecture

```
/app/
├── backend/
│   ├── server.py         # FastAPI with all endpoints
│   ├── requirements.txt
│   └── .env              # MONGO_URL, JWT_SECRET, EMERGENT_LLM_KEY
├── frontend/
│   ├── src/
│   │   ├── App.js        # Router with role-based redirects
│   │   ├── index.css     # Premium Wizard of Oz theme
│   │   └── pages/
│   │       ├── LandingPage.js
│   │       ├── BrickChat.js
│   │       ├── AgencyDashboard.js
│   │       ├── CleanupDashboard.js
│   │       ├── LegalAidPortal.js
│   │       ├── Workbook.js
│   │       ├── Dossier.js
│   │       ├── ResourceMap.js
│   │       └── Vault.js
│   └── public/index.html  # Title: "BRICK - AI Caseworker"
└── test_reports/
```

## Test Credentials
| Role | Email | Password | Organization |
|------|-------|----------|--------------|
| Regular User | testuser@example.com | password123 | - |
| Agency Staff | agency@help.org | agency123 | HELP of Southern Nevada |
| **Shine-A-Light** | outreach@shinealightlv.org | shinealight2024 | Shine-A-Light Las Vegas |
| **Recover LV** | team@recoverlv.org | recover2024 | Recover Las Vegas |
| Cleanup Crew | cleanup@vegas.gov | cleanup123 | Las Vegas Metro |
| Legal Aid | lawyer@legalaid.org | lawyer123 | Legal Aid Center |
| Paralegal | paralegal@legalaid.org | paralegal123 | Legal Aid Center |
| Caseworker | caseworker@brick.org | caseworker123 | BRICK Platform |

## Third-Party Integrations
- **Emergent LLM Key** - Powers BRICK AI chatbot
- **OpenStreetMap/Leaflet** - Resource map visualization
- **MongoDB** - Document database

---

*Last Updated: January 25, 2026*
