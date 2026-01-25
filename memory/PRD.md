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
- Premium "Wizard of Oz" themed UI (emerald, gold, ruby, glitter effects)

## Design Theme
**"Wizard of Oz" Premium Theme**:
- Emerald green gradients (Emerald City)
- Gold/yellow accents (Yellow Brick Road)
- Ruby red highlights (Ruby Slippers)
- Glitter/sparkle effects
- Premium typography (Cinzel serif for headings)
- **NO Emergent branding**

---

## ✅ PILOT-READY STATUS (January 25, 2026)

### All Core Features Working:
| Feature | Status | Notes |
|---------|--------|-------|
| Multi-Role Authentication | ✅ Working | 6 roles with proper routing |
| BRICK AI Chat | ✅ Working | Markdown responses, auto-saves to dossier |
| Notification System | ✅ Working | Sweep alerts, real-time polling |
| Document Vault | ✅ Working | Upload/view documents |
| Resource Map | ✅ Working | 6 Las Vegas services |
| Workbook/Flashcards | ✅ Working | 12 auto-generated for new users |
| Form-Based Dossier | ✅ Working | Color-coded by source |
| Agency Unified Database | ✅ Working | Cross-agency client view |
| HUD Reports | ✅ Working | Full compliance reporting |
| Organization Theming | ✅ Working | Shine-A-Light (amber), Recover (teal) |
| Registration Flow | ✅ Working | "Get Started Free" CTA button |

### Testing Results:
- **Backend:** 100% (26/26 tests passed)
- **Frontend:** 100% (All features verified)
- **Test Report:** `/app/test_reports/iteration_3.json`

---

## Login Credentials

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

---

## Features Implemented

### User Features
- ✅ **Landing Page** - Premium Wizard of Oz theme with "Get Started Free" CTA
- ✅ **BRICK AI Chat** - Trauma-responsive AI with auto-dossier updates
- ✅ **Notification Bell** - Real-time sweep alerts with badge count
- ✅ **Document Vault** - Upload and store vital documents
- ✅ **Resource Map** - Las Vegas services with Leaflet maps
- ✅ **Workbook** - Interactive flashcards with points/levels
- ✅ **Dossier** - Comprehensive personal history form

### Agency Features
- ✅ **Unified Client Database** - Cross-agency data sharing
- ✅ **HUD Compliance Reports** - Full metrics for grant applications
- ✅ **Organization Branding** - Custom themes per agency
- ✅ **Dashboard Overview Cards** - Key metrics at a glance

### Cleanup Crew Features
- ✅ **Post Sweep Schedules** - With automatic user notifications
- ✅ **View Scheduled Sweeps** - List of upcoming operations

### Legal Aid Features
- ✅ **Client Cases Tab** - View legal cases
- ✅ **Resources Library** - Forms and guides
- ✅ **Workshop Calendar** - Pro bono event scheduling

---

## Remaining Backlog (Post-Pilot)

### P0 - Next Priority
- [ ] Quick-Apply - Auto-fill housing applications from dossier

### P1 - High Priority
- [ ] Pop-up Event creation UI on map
- [ ] Legal consultation request flow
- [ ] Print/export Dossier to PDF

### P2 - Medium Priority
- [ ] Enhanced BRICK AI - Generate workbook tasks from flashcards
- [ ] Inter-agency messaging
- [ ] SMS notifications

---

## Technical Architecture

```
/app/
├── backend/
│   ├── server.py              # FastAPI with all endpoints
│   ├── requirements.txt
│   ├── .env                   # MONGO_URL, JWT_SECRET, EMERGENT_LLM_KEY
│   └── tests/
│       └── test_brick_api.py  # 26 passing tests
├── frontend/
│   ├── src/
│   │   ├── App.js             # Router with role-based redirects
│   │   ├── index.css          # Premium Wizard of Oz theme
│   │   ├── components/
│   │   │   └── NotificationBell.js
│   │   └── pages/
│   │       ├── LandingPage.js     # With CTA buttons
│   │       ├── BrickChat.js       # AI chat + notifications
│   │       ├── AgencyDashboard.js # Org-themed dashboard
│   │       ├── CleanupDashboard.js
│   │       ├── LegalAidPortal.js
│   │       ├── Workbook.js
│   │       ├── Dossier.js
│   │       ├── ResourceMap.js
│   │       └── Vault.js
│   └── public/index.html      # Title: "BRICK - AI Caseworker"
└── test_reports/
    ├── iteration_1.json
    ├── iteration_2.json
    └── iteration_3.json       # Final pilot-readiness test
```

## Third-Party Integrations
- **Emergent LLM Key** - Powers BRICK AI chatbot
- **OpenStreetMap/Leaflet** - Resource map visualization
- **MongoDB** - Document database

---

*Last Updated: January 25, 2026*
*Status: PILOT-READY*
