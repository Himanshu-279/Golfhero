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

## 📸 Screenshots & Feature Walkthrough

### **Section 1: Authentication Flow**

#### **Registration Page**
- **What's happening**: New user signing up with email, password, name
- **Features visible**:
  - Full Name input field
  - Email input field
  - Password input field (min 8 chars)
  - Charity selection dropdown
  - "Create account" button
- **Next step**: User redirected to dashboard after signup

---

#### **Login Page**
- **What's happening**: User authentication with JWT tokens
- **Features visible**:
  - Email field (demo@gmail.com)
  - Password field
  - "Sign in" button
  - "Create one" link for new users
- **Backend process**: 
  - Password verified with bcryptjs
  - JWT token generated (24h expiry)
  - Token stored in localStorage
  - Redirect to dashboard

---

### **Section 2: Dashboard (User Home)**

#### **Subscription Status Card**
- **What's happening**: Shows active subscription with renewal date
- **Displays**:
  - Status badge: "Active" (green) or "Inactive" (gray)
  - Plan type: "Monthly" or "Yearly"
  - Renewal date: e.g., "Renews 21 May 2026"
  - Cancel button: Red text link
- **Data from**: `subscriptions` table + `users` table
- **Update frequency**: Real-time

#### **Charity Selection**
- **What's happening**: Shows selected NGO and contribution percentage
- **Displays**:
  - Charity name (e.g., "Smile Foundation India")
  - Contribution: "30% of your subscription"
  - "View charity →" link
  - Option to change charity
- **Database**: `users.charity_id` + `charities` table

#### **Score Entry**
- **What's happening**: Golf score tracking and management
- **Features**:
  - "+ Add Score" button
  - Last 5 scores displayed
  - Auto-delete when 6th score added (keeps rolling 5)
  - Score date & value shown
- **Validation**: Scores between 1-45

#### **Draw Numbers**
- **What's happening**: Current month's draw results
- **Shows**:
  - Draw month-year (e.g., "2026-04")
  - 5 generated numbers (colored badges)
  - "View all draws →" link
- **Auto-updates**: Monthly at 00:00 UTC

#### **Winnings Section**
- **What's happening**: Prize history across all draws
- **Shows**:
  - Draw month
  - Prize amount (₹)
  - Match count (3/4/5)
  - Payment status

---

### **Section 3: Subscription Payment**

#### **Plan Selection**
- **What's happening**: User choosing subscription plan
- **Monthly Plan**:
  - Price: ₹499/month
  - 5 score entries/month
  - Monthly prize entry
  - 10%+ to charity
  - "Subscribe Monthly" button

- **Yearly Plan** (Recommended):
  - Price: ₹4,799/year (20% discount)
  - Everything in Monthly
  - 2 months free
  - Priority draw entry
  - "Subscribe Yearly" button
  - "Best Value" badge (gold)

#### **Razorpay Checkout Modal**
- **What's happening**: Secure payment processing via Razorpay
- **Prefilled fields**:
  - Customer name (from account)
  - Email (from account)
  - Amount: ₹499 or ₹4,799
- **User enters**:
  - Card number: 4111 1111 1111 1111
  - Expiry: Any future date
  - CVV: Any 3 digits
  - OTP/verification (if required)
- **Backend process**:
  1. Create Razorpay order
  2. Generate order ID
  3. Return to frontend
  4. Razorpay checkout opens
  5. User pays
  6. Signature verification
  7. Subscription activated
  8. Redirect to dashboard

---

### **Section 4: Admin Panel**

#### **Admin Login**
- **Credentials**:
  - Email: admin@golfhero.com
  - Password: Admin@123456
- **Role check**: `users.role = 'admin'`
- **Access**: Full admin dashboard

#### **Dashboard Statistics**
- **What's shown**:
  - Total active users
  - Monthly recurring revenue (MRR)
  - Subscription count
  - Subscriber retention rate
- **Data source**: Real-time queries from database
- **Auto-refreshes**: Every 5 minutes

#### **Users Management**
- **What's shown**:
  - User email & name
  - Subscription status (active/inactive/lapsed)
  - Charity selection & percentage
  - Join date
- **Admin actions**:
  - View user details
  - Edit charity assignment
  - Change charity percentage
  - Delete user (with confirmation)

#### **Draws Management**
- **Create Draw**:
  - Select draw type: Random or Algorithmic
  - Generate 5 numbers (1-45)
  - Simulate before saving

- **Simulate Draw**:
  - Preview numbers
  - See potential winners
  - Check prize distribution
  - NO database changes
  - "Run & Save (Draft)" to confirm

- **Publish Draw**:
  - Mark as published
  - Generates winners automatically
  - Calculates prize amounts
  - Sends notifications
  - Locks for editing

#### **Winners List**
- **What's shown**:
  - Draw month
  - User email
  - Match count (3/4/5 matched numbers)
  - Prize amount
  - Verification status: pending/approved/rejected
  - Payment status: pending/paid

- **Admin actions**:
  - Request proof upload
  - Approve winner
  - Reject with reason
  - Mark as paid

#### **Charities Management**
- **List view**:
  - Charity name
  - Logo
  - Featured status (yes/no)
  - Upcoming events count

- **Actions**:
  - Add new charity
  - Edit details
  - Upload/change logo
  - Delete charity (if no users)

#### **Analytics**
- **Charts shown**:
  - Revenue trend (30 days)
  - User growth (30 days)
  - Charity contributions (pie chart)
  - Draw participation rate

---

### **Section 5: Charity Pages**

#### **Featured Charities**
- **What's shown**:
  - 5 NGOs with logos
  - Charity name & description
  - Website link
  - "Featured" badge (if highlighted)
  - Upcoming events (if any)

#### **Charity Detail Page**
- **Click on any charity**:
  - Full description
  - Website link
  - Logo
  - Upcoming events/projects
  - "Select as my charity" button
  - Contribution percentage slider

---

### **Section 6: Draw Results**

#### **All Draws Page**
- **What's shown**:
  - Draw month-year (e.g., "2026-04")
  - 5 generated numbers (in colored badges)
  - Prize pools:
    - Jackpot (5 matches)
    - Match-4 (4 matches)
    - Match-3 (3 matches)
  - "View winners" link
  - Draw status (published/draft)

#### **Draw Winners**
- **For each draw**:
  - List of all winners
  - Match count
  - Prize amount
  - Verification status
  - User name & email

---

## 🔄 Data Flow Explanation

### **User Signup to Subscription**
```
1. User fills signup form
   ↓
2. Data sent to POST /api/auth/signup
   ↓
3. Backend:
   - Hash password with bcryptjs
   - Create user in database
   - Store: email, password_hash, name, charity_id
   ↓
4. JWT token generated
   ↓
5. Token stored in localStorage
   ↓
6. Redirect to /dashboard
```

### **Payment Processing**
```
1. User clicks "Subscribe"
   ↓
2. POST /api/subscriptions/checkout
   ↓
3. Backend creates Razorpay order
   ↓
4. Order ID returned to frontend
   ↓
5. Razorpay checkout modal opens
   ↓
6. User pays (4111 1111 1111 1111)
   ↓
7. Frontend receives payment response
   ↓
8. POST /api/subscriptions/razorpay-callback
   ↓
9. Backend verifies signature (HMAC-SHA256)
   ↓
10. If valid:
    - Create subscription record
    - Update user.subscription_status = 'active'
    - Set period_end (30 days later)
    ↓
11. Redirect to /dashboard
    ↓
12. Dashboard shows "Active" subscription
```

### **Monthly Draw Generation**
```
1. Admin clicks "Simulate Draw"
   ↓
2. Backend generates 5 random numbers (1-45)
   ↓
3. Shows preview with potential winners
   ↓
4. Admin clicks "Run & Save (Draft)"
   ↓
5. Draw saved but not published
   ↓
6. Admin reviews winners
   ↓
7. Admin clicks "Publish"
   ↓
8. Backend:
   - Matches user scores against numbers
   - Creates draw_winners entries
   - Calculates prize amounts
   - Sets status = 'published'
   ↓
9. Users notified of results
   ↓
10. Winners see prizes in dashboard
```

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

### **Backend (.env) - Complete Setup**
```
# Server Configuration
PORT=3001
CLIENT_URL=https://golfhero-eight.vercel.app

# Database (Supabase)
SUPABASE_URL=https://gpxsqfidkvnpsvyngbtz.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Authentication (JWT)
JWT_SECRET=himanshu-super-secret-key-32-chars-min-asdfjkl

# Payment Gateway - Razorpay (PRIMARY for India)
RAZORPAY_KEY_ID=rzp_test_SgEGnnmby30MEt
RAZORPAY_KEY_SECRET=z2MjAf0HYV0FGUlieRvb4xVF
DEMO_MODE=true

# Fallback Payment Gateway - Stripe (International)
STRIPE_SECRET_KEY=sk_test_4eC39HqLyjWDarhtT657L8xV_EXAMPLE
STRIPE_WEBHOOK_SECRET=whsec_test_secret_1234567890abcdefghij_EXAMPLE
STRIPE_MONTHLY_PRICE_ID=price_xxx
STRIPE_YEARLY_PRICE_ID=price_xxx
```

---

## 🔑 How to Get API Keys

### **Razorpay Setup (Recommended for India)**
1. Go to https://razorpay.com
2. Sign up with business details
3. Complete KYC (identity verification)
4. Go to Settings → API Keys
5. Copy Test Key ID & Secret
6. Update `.env` with your keys
7. Test with card: `4111 1111 1111 1111`

### **Supabase Setup (Database)**
1. Go to https://supabase.com
2. Create new project
3. Copy Project URL & Service Key
4. Run schema.sql in SQL Editor
5. Update `.env` with credentials

### **JWT Secret**
```
# Generate using:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
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
