# GolfHero — Golf Score Tracking & Monthly Prize Draw Platform

> **Play Golf. Win Prizes. Change Lives.**
> 
> A full-stack subscription platform where golfers track their Stableford scores, participate in monthly prize draws, and support their chosen charities.

---

## ✨ Features

- **User Authentication**: Secure signup/login with JWT
- **Subscription Plans**: Monthly (₹499) & Yearly (₹4,799) with Razorpay payment integration
- **Score Tracking**: Add daily golf scores, auto-remove when 6th score is added
- **Monthly Draws**: Random & algorithmic draw generation with winner detection
- **Charity Support**: 10-100% of subscription goes to chosen charity
- **Admin Panel**: Manage users, create draws, verify winners, view analytics
- **Real Payment Gateway**: Razorpay test & live mode support

---

## 🛠 Tech Stack

- **Frontend**: React 18.2.0 + Vite 5.1.0 + Tailwind CSS 3.4.1
- **Backend**: Node.js 22.19.0 + Express 4.18.2
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + bcryptjs
- **Payments**: Razorpay (primary for India)
- **Deployment**: Vercel (frontend) + Railway (backend)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v22+
- Git
- Supabase account

### 1. Setup Database

```bash
# Create new Supabase project
# Go to SQL Editor and run schema.sql
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Update SUPABASE_URL, SUPABASE_SERVICE_KEY, RAZORPAY keys
npm start
# Server runs on http://localhost:3001
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

---

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Subscriptions
- `POST /api/subscriptions/checkout` - Create payment order
- `POST /api/subscriptions/razorpay-callback` - Verify payment
- `POST /api/subscriptions/cancel` - Cancel subscription
- `GET /api/subscriptions/status` - Check subscription status

### Scores
- `POST /api/scores` - Add golf score
- `GET /api/scores` - Get user's scores
- `PUT /api/scores/:id` - Update score
- `DELETE /api/scores/:id` - Delete score

### Draws
- `GET /api/draws` - Get all draws
- `POST /api/admin/draws` - Create draw (admin)
- `POST /api/admin/draws/:id/publish` - Publish draw (admin)

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/draws` - Manage draws
- `GET /api/admin/winners` - View winners
- `GET /api/admin/analytics` - Analytics dashboard

---

## 💳 Payment Testing

**Test Card (Razorpay):**
- Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

**Test Payment**: ₹499 or ₹4,799 subscription activation

---

## 📊 Database Schema

8 tables with proper relationships:
- `users` - User accounts & subscription status
- `subscriptions` - Active subscriptions
- `scores` - Daily golf scores
- `draws` - Monthly draw data
- `draw_winners` - Prize winners & amounts
- `charities` - NGO/charity details
- `charity_contributions` - Contribution tracking

---

## 🔐 Environment Variables

**Backend (.env):**
```
PORT=3001
CLIENT_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret_key
JWT_SECRET=your_secret_key
DEMO_MODE=false
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001
```

---

## 🎯 Admin Credentials

- **Email**: admin@golfhero.com
- **Password**: Admin@123456

---

## 📈 Deployment

### Vercel (Frontend)
```bash
1. Connect GitHub repo to Vercel
2. Set VITE_API_URL environment variable
3. Deploy
```

### Railway (Backend)
```bash
1. Connect GitHub repo to Railway
2. Set all environment variables
3. Deploy
```

### Supabase (Database)
```bash
1. Create new Supabase project
2. Run schema.sql in SQL Editor
3. Add service key to Railway environment
```

---

## 📄 License

All rights reserved. GolfHero™ 2026

---

**Built with ❤️ for Golf Lovers**
3. Go to **SQL Editor** → Click **New Query**
4. Paste the entire contents of `schema.sql` → Click **Run**
5. Go to **Project Settings → API**:
   - Copy **Project URL** → this is `SUPABASE_URL`
   - Copy **service_role** key (under API Keys) → this is `SUPABASE_SERVICE_KEY`

---

## STEP 2 — Stripe Setup

1. Go to https://stripe.com → Create a **new account**
2. Go to **Developers → API Keys**:
   - Copy **Secret key** → `STRIPE_SECRET_KEY`
3. Go to **Products → Add Product**:
   - Create **"GolfHero Monthly"** → ₹499/month recurring → copy Price ID → `STRIPE_MONTHLY_PRICE_ID`
   - Create **"GolfHero Yearly"** → ₹4799/year recurring → copy Price ID → `STRIPE_YEARLY_PRICE_ID`
4. Webhook will be configured after backend is deployed (Step 4)

---

## STEP 3 — Backend Deploy (Railway)

1. Go to https://railway.app → Sign up / Login
2. Click **New Project → Deploy from GitHub repo**
   - Push your code to GitHub first (see Step 0 below)
   - Select the repo → set **Root Directory** to `/server`
3. Add **Environment Variables** in Railway dashboard:

```
PORT=3001
CLIENT_URL=https://your-vercel-app.vercel.app

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx...

JWT_SECRET=make-this-a-long-random-string-at-least-32-chars

STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_MONTHLY_PRICE_ID=price_xxx
STRIPE_YEARLY_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx   ← add after step 4
```

4. Click **Deploy** → wait for green status
5. Copy your Railway URL e.g. `https://golfhero-server.up.railway.app`

---

## STEP 4 — Stripe Webhook

1. Go to Stripe Dashboard → **Developers → Webhooks**
2. Click **Add Endpoint**:
   - URL: `https://your-railway-url.up.railway.app/api/webhooks/stripe`
   - Events to listen: select these 4:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`
3. Copy **Signing Secret** → add to Railway env as `STRIPE_WEBHOOK_SECRET`
4. Redeploy Railway (or it auto-deploys)

---

## STEP 5 — Frontend Deploy (Vercel)

1. Go to https://vercel.com → Sign up with a **new** account
2. Click **Add New Project → Import Git Repository**
   - Select your repo → set **Root Directory** to `/client`
3. Add **Environment Variable**:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```
4. Open `client/vercel.json` and replace `your-backend-url.railway.app` with your actual Railway URL
5. Click **Deploy**
6. Copy your Vercel URL e.g. `https://golfhero.vercel.app`

---

## STEP 6 — Update Backend CORS

Go to Railway → Update `CLIENT_URL` env variable to your actual Vercel URL:
```
CLIENT_URL=https://golfhero.vercel.app
```
Railway will auto-redeploy.

---

## STEP 0 — Push to GitHub (do this before Step 3)

```bash
# In the project root folder
git init
git add .
git commit -m "Initial commit — GolfHero"
git remote add origin https://github.com/YOUR_USERNAME/golfhero.git
git push -u origin main
```

---

## Local Development

### Backend
```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
# Runs on http://localhost:3001
```

### Frontend
```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Default Admin Login

After running schema.sql:
- **Email**: admin@golfhero.com
- **Password**: Admin@123456

⚠️ Change this password immediately after first login via the profile settings.

---

## Testing Checklist

- [ ] Homepage loads with charity section
- [ ] Register new user
- [ ] Select charity during registration
- [ ] Subscribe (use Stripe test card: `4242 4242 4242 4242`)
- [ ] Enter 5 golf scores on dashboard
- [ ] Try entering duplicate date (should fail)
- [ ] Enter 6th score (oldest should auto-delete)
- [ ] Login as admin (`admin@golfhero.com`)
- [ ] Admin: Simulate draw
- [ ] Admin: Run draw (saves as draft)
- [ ] Admin: Publish draw
- [ ] View draw results on /draws
- [ ] Admin: View winners list
- [ ] Admin: Approve winner
- [ ] Admin: Mark winner as paid
- [ ] Admin: Add new charity
- [ ] Check charity pages

---

## Project Structure

```
golfhero/
├── schema.sql              ← Run this in Supabase
├── client/                 ← React frontend (Vercel)
│   ├── src/
│   │   ├── pages/          ← All pages
│   │   ├── components/     ← Navbar, Footer, ScoreForm
│   │   ├── context/        ← AuthContext
│   │   └── lib/            ← API client
│   └── vercel.json
└── server/                 ← Node.js backend (Railway)
    ├── routes/             ← auth, scores, draws, charities, admin
    ├── services/           ← drawEngine.js
    ├── middleware/         ← auth.js
    └── lib/                ← supabase.js
```

---

## Stripe Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0025 0000 3155 | 3D Secure required |

Use any future expiry, any CVC, any ZIP.
