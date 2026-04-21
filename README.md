# 🏌️ GolfHero — Play Golf. Win Prizes. Change Lives.

> **Live Project:** https://golfhero-eight.vercel.app/ 🚀

---

## 📱 Project Overview

**GolfHero** is a full-stack subscription-based platform where golf enthusiasts can:
- ⛳ **Track daily golf scores** (Stableford scoring system)
- 🎰 **Participate in monthly prize draws** with real cash prizes
- 💚 **Support charities** - 10-100% of subscription goes to chosen NGO
- 🏆 **Win prizes** based on score matches in monthly draws
- 💳 **Pay via Razorpay** (India's #1 payment gateway)

---

## ✨ Key Features Implemented

✅ **User Authentication** - Secure JWT-based login/signup  
✅ **Payment Integration** - Razorpay real payment gateway  
✅ **Score Tracking** - Daily golf score entry with auto-management  
✅ **Monthly Draws** - Random & algorithmic draw generation  
✅ **Charity Support** - 5 NGOs integrated (Smile Foundation, Robin Hood Army, etc.)  
✅ **Admin Dashboard** - Manage users, draws, winners, analytics  
✅ **Winner Verification** - Admin approval workflow  
✅ **Subscription Management** - Monthly & yearly plans (₹499 & ₹4,799)  
✅ **Real Database** - Supabase PostgreSQL with 8 tables  

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18.2 + Vite 5.1 + TailwindCSS 3.4 |
| **Backend** | Node.js 22 + Express 4.18 |
| **Database** | Supabase (PostgreSQL) |
| **Payment** | Razorpay API |
| **Auth** | JWT + bcryptjs |
| **Deployment** | Vercel (Frontend) + Railway (Backend) |

---

## 🚀 Live Deployment

### **Frontend (Vercel)**
```
https://golfhero-eight.vercel.app/
```
- Deployed on Vercel for fast, optimized performance
- Auto-deploys on GitHub push
- Environment: VITE_API_URL points to Railway backend

### **Backend (Railway)**
```
https://golfhero-production.up.railway.app/
```
- Node.js server running on Railway
- Public HTTP API endpoints
- Environment variables configured securely

### **Database (Supabase)**
- PostgreSQL database with 8 tables
- Real-time subscriptions
- Row-level security enabled

---

## 📊 Database Schema

**8 Tables with proper relationships:**

```
users
├── id, email, password_hash, name, role
├── subscription_status (active/inactive/lapsed)
├── charity_id, charity_percentage
└── stripe_customer_id

subscriptions
├── user_id, stripe_subscription_id
├── plan (monthly/yearly)
├── status, current_period_start, current_period_end

scores
├── user_id, score (1-45)
└── score_date (unique per user per day)

draws
├── month_year, draw_type (random/algorithmic)
├── draw_numbers (array of 5)
├── pools (jackpot/match4/match3)
└── status (draft/published)

draw_winners
├── draw_id, user_id, match_count (3/4/5)
├── prize_amount, payment_status
└── verification_status (pending/approved/rejected)

charities
├── name, description, image_url
├── website, featured, upcoming_events

charity_contributions
├── user_id, charity_id, amount
└── subscription_invoice_id
```

---

## 🔑 Test Credentials

### **User Account**
```
Email: demo@gmail.com
Password: Demo@123456
```

### **Admin Account**
```
Email: admin@golfhero.com
Password: Admin@123456
```

### **Test Payment Card (Razorpay)**
```
Card: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
```

---

## 📸 Screenshots & Features

### **1. Home Page**
- Landing page with value proposition
- Call-to-action buttons (Sign up / Login)
- Clean, modern design

### **2. Authentication**
- **Sign Up**: Full name, email, password, charity selection
- **Login**: Email & password with JWT token storage
- **Secure**: bcryptjs hashing + JWT tokens

### **3. Subscription Page**
- **Monthly Plan**: ₹499/month
  - 5 score entries/month
  - Monthly prize draw entry
  - 10%+ charity contribution
  
- **Yearly Plan**: ₹4,799/year (Save 20%)
  - Everything in Monthly
  - 2 months free
  - Priority draw entry

- **Razorpay Integration**: Secure payment checkout with customer details

### **4. Dashboard**
Shows after subscription:
- **Subscription Status**: Active/Inactive with renewal date
- **Score Tracking**: Add/edit daily golf scores
- **My Charity**: Selected NGO with contribution percentage
- **Latest Draw**: Current month's draw numbers
- **Winnings**: Prize history across all draws
- **Cancel Subscription**: One-click cancellation

### **5. Charities Page**
- **Featured Charities**: Smile Foundation, Robin Hood Army, Teach for India, etc.
- **Charity Details**: Name, description, website link, upcoming events
- **Selection**: Choose during signup or update in dashboard

### **6. Draws Page**
- **View All Draws**: Monthly draw results
- **Draw Numbers**: 5 numbers generated (1-45)
- **Prize Pools**: Jackpot, Match-4, Match-3
- **Your Scores**: Highlighted to show matches

### **7. Admin Dashboard** (Email: admin@golfhero.com)
**7 Sections:**

1. **Dashboard Stats**
   - Total users
   - Active subscriptions
   - Monthly revenue
   - Subscriber count

2. **Users Management**
   - List all users
   - View subscription status
   - Edit charity selection
   - View charity percentage

3. **Draws Management**
   - Create new draw (random or algorithmic)
   - Simulate draw (preview before saving)
   - Save as draft
   - Publish draw (generates winners)
   - View draw history

4. **Charities Management**
   - Add new charity
   - Edit charity details
   - Delete charities
   - Upload logos

5. **Winners Management**
   - List all winners by draw
   - View prize amounts
   - Verify winner claims
   - Approve/Reject payments

6. **Analytics**
   - Revenue charts
   - User growth
   - Charity contributions
   - Draw participation rate

7. **Settings**
   - Platform configuration
   - API key management
   - Email notifications

---

## 💳 Payment Flow

### **Subscription Purchase**
```
1. User clicks "Subscribe"
   ↓
2. Frontend calls POST /api/subscriptions/checkout
   ↓
3. Backend creates Razorpay order
   ↓
4. Razorpay checkout modal appears
   ↓
5. User enters card/UPI details
   ↓
6. Payment successful
   ↓
7. Frontend verifies signature
   ↓
8. Backend activates subscription
   ↓
9. User redirected to dashboard
```

### **Payment Verification**
- HMAC-SHA256 signature verification
- Secure webhook handling
- Double-check with Razorpay API

---

## 🎰 Draw Engine Logic

### **Monthly Draw Generation**
```
Input: User scores (e.g., 38, 42, 35, 40, 45)
Generate: 5 numbers (1-45)
Example: [7, 8, 17, 40, 44]

Match Calculation:
- 5 matches = Jackpot (40% of pool)
- 4 matches = Match-4 (35% of pool)
- 3 matches = Match-3 (25% of pool)
- <3 matches = No prize
```

### **Algorithms**
- **Random Draw**: Pure randomization
- **Algorithmic Draw**: Weighted based on score distribution

---

## 🔐 Security Features

✅ **Password Security**: bcryptjs hashing (12 rounds)  
✅ **JWT Tokens**: Secure token-based authentication  
✅ **CORS Protection**: Cross-origin requests validated  
✅ **Input Validation**: All inputs sanitized  
✅ **SQL Injection Prevention**: Parameterized queries (Supabase)  
✅ **Payment Security**: Razorpay signature verification  
✅ **Rate Limiting**: Prevents brute force attacks  

---

## 📚 API Endpoints

### **Authentication**
```
POST /api/auth/signup - Register new user
POST /api/auth/login - Login user
```

### **Subscriptions**
```
POST /api/subscriptions/checkout - Create payment order
POST /api/subscriptions/razorpay-callback - Verify payment
POST /api/subscriptions/cancel - Cancel subscription
GET /api/subscriptions/status - Check subscription
```

### **Scores**
```
POST /api/scores - Add new score
GET /api/scores - Get user's scores
PUT /api/scores/:id - Update score
DELETE /api/scores/:id - Delete score
```

### **Draws**
```
GET /api/draws - Get all draws
GET /api/draws/:id - Get draw details
GET /api/draws/:id/winners - Get draw winners
```

### **Charities**
```
GET /api/charities - List all charities
GET /api/charities/:id - Get charity details
```

### **Admin**
```
GET /api/admin/users - List users
GET /api/admin/draws - Manage draws
POST /api/admin/draws - Create draw
POST /api/admin/draws/:id/publish - Publish draw
GET /api/admin/winners - List winners
GET /api/admin/analytics - Get analytics
```

---

## 🚀 Deployment Architecture

### **Frontend (Vercel)**
```
GitHub Push
   ↓
Vercel Webhook
   ↓
npm run build (Vite)
   ↓
Build optimization
   ↓
CDN deployment (60+ locations)
   ↓
https://golfhero-eight.vercel.app/
```

### **Backend (Railway)**
```
GitHub Push
   ↓
Railway Webhook
   ↓
Node.js 22 installation
   ↓
npm install dependencies
   ↓
npm start (Express server)
   ↓
Port 3001 exposed
   ↓
https://golfhero-production.up.railway.app/
```

---

## 📦 Environment Variables

### **Frontend (.env)**
```
VITE_API_URL=https://golfhero-production.up.railway.app
```

### **Backend (.env)**
```
PORT=3001
CLIENT_URL=https://golfhero-eight.vercel.app
SUPABASE_URL=https://gpxsqfidkvnpsvyngbtz.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
RAZORPAY_KEY_ID=rzp_test_SgEGnnmby30MEt
RAZORPAY_KEY_SECRET=z2MjAf0HYV0FGUlieRvb4xVF
JWT_SECRET=himanshu-super-secret-key-32-chars-min-asdfjkl
DEMO_MODE=true
```

---

## 🎯 Project Status

| Component | Status | Details |
|-----------|--------|---------|
| Frontend | ✅ Live | Vercel deployment working |
| Backend | ✅ Live | Railway Node.js server running |
| Database | ✅ Live | Supabase PostgreSQL configured |
| Payments | ✅ Integrated | Razorpay test mode active |
| Auth | ✅ Secured | JWT + bcryptjs implemented |
| Admin Panel | ✅ Complete | 7 sections fully functional |
| Draws Engine | ✅ Ready | Random & algorithmic generation |

---

## 📈 Project Statistics

- **8 Database Tables** with relationships
- **14 API Endpoints** (Auth, Payments, Scores, Draws, Charities, Admin)
- **7 Admin Dashboard Sections**
- **5 Charities** integrated
- **2 Subscription Plans** (Monthly & Yearly)
- **3 Prize Tiers** (Jackpot, Match-4, Match-3)
- **100% Responsive Design** (Mobile, Tablet, Desktop)
- **Real Payment Processing** via Razorpay

---

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ Full-stack development (React + Node.js)
- ✅ Real payment gateway integration
- ✅ Database design & optimization
- ✅ Authentication & security
- ✅ Admin dashboard development
- ✅ Cloud deployment (Vercel + Railway)
- ✅ API design best practices
- ✅ Responsive UI/UX

---

## 👤 Team

**Developer**: Himanshu Verma  
**GitHub**: https://github.com/Himanshu-279/Golfhero  
**Deployment Date**: April 22, 2026  

---

## 📄 License

All rights reserved. GolfHero™ 2026

---

## 🔗 Quick Links

- **Live App**: https://golfhero-eight.vercel.app/
- **GitHub Repo**: https://github.com/Himanshu-279/Golfhero
- **Backend API**: https://golfhero-production.up.railway.app/
- **Admin Login**: https://golfhero-eight.vercel.app/login

---

**Built with ❤️ for Golf Lovers** 🏌️
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
