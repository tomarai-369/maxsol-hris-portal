# 🚀 MaxSol HRIS Portal - Quick Setup Guide

## Step 1: Create Kintone Apps (5 minutes)

1. **Open the setup tool**: Open `tools/setup-kintone.html` in your browser
2. **Enter your credentials**:
   - Domain: `ms-corp.cybozu.com`
   - Username: `Administrator`
   - Password: `Edamame!2345`
   - Space ID: `37`
3. **Click "Create All HRIS Apps"**
4. **Copy the App IDs** that appear after creation

## Step 2: Generate Kintone API Token (2 minutes)

1. Go to any of the HRIS apps in Kintone
2. Click **Settings** (gear icon) → **App Settings**
3. Click **API Token** on the left menu
4. Click **Generate** 
5. Check these permissions: ✅ View, ✅ Add, ✅ Edit
6. Click **Save** → **Update App**
7. **Copy the token** (you'll need this for Railway)

**Note**: You need to add this token to ALL 5 HRIS apps, or generate a single token and add it to each app's API Token settings.

## Step 3: Get GitHub Access (2 minutes)

### Option A: I deploy for you (recommended)
Give me a **Personal Access Token** with repo permissions:

1. Go to: https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Name: `MaxSol HRIS Deploy`
4. Expiration: 7 days
5. Scopes: Check ✅ **repo** (full control)
6. Click **Generate token**
7. **Copy and send me the token** (starts with `ghp_`)

### Option B: You deploy yourself
1. Create a new repo on GitHub
2. Upload the `hris-portal` folder contents
3. Continue to Railway setup

## Step 4: Get Railway Access (2 minutes)

### Option A: I deploy for you (recommended)
Give me a **Railway API Token**:

1. Go to: https://railway.app/account/tokens
2. Click **Create Token**
3. Name: `HRIS Deploy`
4. Click **Create**
5. **Copy and send me the token**

### Option B: You deploy yourself
1. Go to https://railway.app
2. Sign in with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your repo
5. Add environment variables (see below)

## Step 5: Environment Variables for Railway

Add these in Railway Dashboard → Variables:

```
KINTONE_DOMAIN=ms-corp.cybozu.com
KINTONE_API_TOKEN=<your-api-token>
KINTONE_APP_EMPLOYEES=<app-id>
KINTONE_APP_LEAVE_REQUESTS=<app-id>
KINTONE_APP_DOCUMENT_REQUESTS=<app-id>
KINTONE_APP_ANNOUNCEMENTS=<app-id>
KINTONE_APP_LEAVE_BALANCES=<app-id>
JWT_SECRET=<generate-with-openssl-rand-base64-32>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<your-app-password>
FROM_EMAIL=hr@maximumsolutions.com.ph
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
NODE_ENV=production
```

## Step 6: Bulk Import Employees

Once deployed:

1. Login as admin
2. Go to **Admin** → **Import Employees**
3. Download the CSV template
4. Fill in all employee data in Excel/Google Sheets
5. Export as CSV
6. Upload and import!

### CSV Template Columns:
| Column | Required | Example |
|--------|----------|---------|
| employee_id | Yes | EMP001 |
| email | Yes | juan@email.com |
| first_name | Yes | Juan |
| last_name | Yes | Dela Cruz |
| middle_name | No | Santos |
| department | Yes | Manpower |
| position | Yes | Field Worker |
| employment_status | Yes | Regular |
| date_hired | Yes | 2024-01-15 |
| birth_date | No | 1990-05-20 |
| contact_number | No | 09171234567 |
| address | No | 123 Main St, Manila |

### Department Options:
- Operations, Finance, HR, IT, Manpower, Sales, Admin

### Employment Status Options:
- Regular, Probationary, Contractual, Project-Based

---

## 📱 Offline Mode (Phase 2)

For offline capability with sync, we can add a PWA (Progressive Web App) layer. This includes:

- **Service Workers** - Cache app for offline use
- **IndexedDB** - Store submissions locally
- **Background Sync** - Auto-upload when back online
- **Duplicate Prevention** - Check existing records before submitting

Let me know when you want to add this feature!

---

## 🔐 What the Tokens Do

| Token | Purpose | Scope |
|-------|---------|-------|
| GitHub PAT | Push code to your repo | repo access |
| Railway Token | Deploy and configure hosting | project management |
| Kintone API Token | Read/write employee data | View, Add, Edit |

All tokens can be revoked after deployment for security.

---

## Need Help?

Send me:
1. ✅ GitHub token (from Step 3)
2. ✅ Railway token (from Step 4)
3. ✅ Kintone App IDs (from Step 1)
4. ✅ Kintone API Token (from Step 2)

And I'll have it deployed within minutes! 🚀
