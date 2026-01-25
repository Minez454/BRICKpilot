# BRICK Deployment Guide (100% Free)

## Quick Deploy - 3 Steps

### Step 1: MongoDB Atlas (Free Database)

1. Go to https://mongodb.com/atlas
2. Create free account → Create FREE M0 cluster
3. Security → Database Access → Add user (save username/password)
4. Security → Network Access → Add IP `0.0.0.0/0` (allows all)
5. Deployment → Database → Connect → Drivers → Copy connection string

Your string looks like:
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/brick_db?retryWrites=true&w=majority
```

---

### Step 2: Render (Free Backend)

1. Go to https://render.com → Sign up free
2. Dashboard → New → Web Service
3. Connect GitHub → Select your repo
4. Settings:
   - **Name**: `brick-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

5. Environment Variables (click "Add Environment Variable"):
   ```
   MONGO_URL = mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/brick_db?retryWrites=true&w=majority
   DB_NAME = brick_db
   JWT_SECRET = make-up-a-long-random-string-here
   EMERGENT_LLM_KEY = your-emergent-key-here
   ```

6. Click "Create Web Service" → Wait for deploy
7. Copy your URL: `https://brick-api.onrender.com`

---

### Step 3: Vercel (Free Frontend)

1. Go to https://vercel.com → Sign up free
2. Add New → Project → Import your GitHub repo
3. Settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`

4. Environment Variables:
   ```
   REACT_APP_BACKEND_URL = https://brick-api.onrender.com
   ```
   (Use YOUR Render URL from Step 2)

5. Click "Deploy" → Wait ~2 minutes
6. Your app is live at: `https://your-app.vercel.app`

---

## 🎉 Done! Share Your URL

Your app is now live with:
- ✅ No branding
- ✅ No "Made with X"
- ✅ 100% free
- ✅ Your BRICK Wizard of Oz theme

---

## Optional: Custom Domain (Free or ~$10/year)

### Vercel:
1. Project Settings → Domains → Add
2. Add your domain: `app.yourdomain.com`
3. Update your DNS settings as shown

### Render:
1. Service Settings → Custom Domains
2. Add: `api.yourdomain.com`

---

## Environment Variables Reference

### Backend (Render)
| Variable | Description |
|----------|-------------|
| `MONGO_URL` | MongoDB Atlas connection string |
| `DB_NAME` | `brick_db` |
| `JWT_SECRET` | Random string for auth tokens |
| `EMERGENT_LLM_KEY` | Your Emergent LLM key for AI chat |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `REACT_APP_BACKEND_URL` | Your Render backend URL |

---

## Troubleshooting

### Backend won't start on Render
- Check logs in Render dashboard
- Make sure all environment variables are set
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### Frontend can't connect to backend
- Check `REACT_APP_BACKEND_URL` is correct (no trailing slash)
- Redeploy frontend after changing env vars

### AI Chat not working
- Verify `EMERGENT_LLM_KEY` is set in Render
- Check Render logs for errors

---

## Login Credentials

| Organization | Email | Password |
|--------------|-------|----------|
| Shine-A-Light | outreach@shinealightlv.org | shinealight2024 |
| Recover LV | team@recoverlv.org | recover2024 |
| H.E.L.P. of SN | services@helpsn.org | helpsn2024 |
| The Courtyard | staff@courtyardlv.org | courtyard2024 |
| Catholic Charities | outreach@catholiccharities.org | catholic2024 |
| Salvation Army | services@salvationarmylv.org | salvation2024 |
| NPHY (Youth) | youth@nphy.org | nphy2024 |
| Veterans Village | veterans@veteransvillage.org | veterans2024 |
| Shannon West | shelter@shannonwest.org | shannon2024 |
| TRAC-B | mobile@tracb.org | tracb2024 |
| City of LV | coordinator@cityoflv.gov | citylv2024 |
| Clark County | services@clarkcounty.gov | clark2024 |
| Cleanup Crew | cleanup@vegas.gov | cleanup123 |
| Legal Aid | lawyer@legalaid.org | lawyer123 |
| Test User | testuser@example.com | password123 |
