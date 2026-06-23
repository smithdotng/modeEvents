# QR & Barcode App — Setup & Run Guide

## Prerequisites
- Node.js 18+ installed
- A MongoDB database (free tier at https://cloud.mongodb.com works)

---

## Step 1 — Install dependencies

```bash
cd qr-barcode-nextjs
npm install
```

---

## Step 2 — Create your environment file

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Then open `.env.local` and set:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/qr-barcode-app?retryWrites=true&w=majority
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

**Getting MONGODB_URI:**
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Click Connect → Drivers → copy the connection string
4. Replace `<password>` with your DB user's password

**Getting NEXTAUTH_SECRET:**
Run this in your terminal and paste the output:
```bash
openssl rand -base64 32
```

---

## Step 3 — Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Step 4 — Deploy (optional)

The easiest option is Vercel:

```bash
npm install -g vercel
vercel
```

Add your three environment variables in the Vercel dashboard under
Project → Settings → Environment Variables.
Change `NEXTAUTH_URL` to your Vercel domain (e.g. `https://your-app.vercel.app`).

---

## Project structure

```
app/
  page.jsx          ← Landing page
  login/page.jsx    ← Login
  register/page.jsx ← Registration
  dashboard/page.jsx← User dashboard (protected)
  generate/page.jsx ← Generator (protected)
  api/
    auth/           ← NextAuth + register endpoint
    codes/          ← CRUD for saved codes

components/
  Navbar.jsx
  Generator.jsx     ← QR + Barcode generator UI
  CodeCard.jsx      ← Dashboard code card

lib/
  mongodb.js        ← DB connection helper
  auth.js           ← NextAuth config

models/
  User.js
  Code.js

middleware.js       ← Route protection
```
