# Setup for GitHub Submission

This guide walks you through preparing your SlotSwapper project for submission.

## 📋 Prerequisites

- Git installed on your system
- GitHub account created
- Project fully tested and working

---

## 🚀 Step-by-Step Submission Guide

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the "+" icon (top right) → "New repository"
3. Fill in details:
   - **Repository name**: `SlotSwapper` (or your preferred name)
   - **Description**: "Full-stack peer-to-peer time-slot scheduling application with TypeScript, React, Node.js, PostgreSQL"
   - **Visibility**: ✅ **PUBLIC** (very important!)
   - **DO NOT** initialize with README (we already have one)
4. Click "Create repository"
5. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/SlotSwapper.git`)

---

### Step 2: Initialize Git and Push to GitHub

Open PowerShell in your project directory and run these commands:

```powershell
# Navigate to project directory
cd "C:\Assignments by companies\SlotSwapper"

# Initialize git repository (if not already done)
git init

# Check current status
git status

# Add all files to staging
git add .

# Verify what will be committed (should not include node_modules, .env files)
git status

# Commit with a meaningful message
git commit -m "Initial commit: SlotSwapper - Full-stack scheduling application with swap functionality"

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/SlotSwapper.git

# Verify remote is added
git remote -v

# Push to GitHub (set main as default branch and push)
git branch -M main
git push -u origin main
```

**Expected Output:**
```
Enumerating objects: 150, done.
Counting objects: 100% (150/150), done.
Delta compression using up to 8 threads
Compressing objects: 100% (130/130), done.
Writing objects: 100% (150/150), 250.00 KiB | 5.00 MiB/s, done.
Total 150 (delta 45), reused 0 (delta 0)
To https://github.com/YOUR_USERNAME/SlotSwapper.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

### Step 3: Verify Your Repository

1. **Open your repository in browser:**
   - Go to `https://github.com/YOUR_USERNAME/SlotSwapper`

2. **Check that files are visible:**
   - [ ] README.md is displayed on main page
   - [ ] Folder structure is correct (backend/, frontend/, docs files)
   - [ ] .gitignore is working (node_modules NOT uploaded)
   - [ ] .env files are NOT uploaded (only .env.example files visible)

3. **Verify README renders correctly:**
   - [ ] Markdown formatting looks good
   - [ ] Code blocks are formatted
   - [ ] Links work
   - [ ] Table of contents is functional

4. **Test repository is public:**
   - Open an incognito/private browser window
   - Go to your repository URL
   - Verify you can see it without logging in

---

### Step 4: Test Cloning and Setup (Optional but Recommended)

To ensure your setup instructions work, test them:

```powershell
# Create a temporary test directory
cd C:\
mkdir TestClone
cd TestClone

# Clone your repository
git clone https://github.com/YOUR_USERNAME/SlotSwapper.git
cd SlotSwapper

# Follow your own README instructions
docker-compose up --build

# OR manual setup:
# cd backend
# npm install
# cp .env.example .env
# (edit .env with your database credentials)
# npx prisma migrate dev
# npm run dev

# Test the application
# Open http://localhost:3000
# Create users, events, test swap functionality

# Clean up when done
cd C:\
Remove-Item -Recurse -Force TestClone
```

---

## 📝 What Should Be in Your Repository

### ✅ Files to Include

```
SlotSwapper/
├── .gitignore                    ✅ Include
├── docker-compose.yml           ✅ Include
├── README.md                    ✅ Include
├── QUICKSTART.md                ✅ Include
├── API_TESTING.md               ✅ Include
├── TESTING_GUIDE.md             ✅ Include
├── ARCHITECTURE.md              ✅ Include
├── PROJECT_OVERVIEW.md          ✅ Include
├── FILE_STRUCTURE.md            ✅ Include
├── SUBMISSION_CHECKLIST.md      ✅ Include
├── setup.sh                     ✅ Include
├── setup.ps1                    ✅ Include
├── backend/
│   ├── .env.example            ✅ Include
│   ├── .env                    ❌ Exclude (.gitignore)
│   ├── package.json            ✅ Include
│   ├── package-lock.json       ✅ Include
│   ├── tsconfig.json           ✅ Include
│   ├── Dockerfile              ✅ Include
│   ├── node_modules/           ❌ Exclude (.gitignore)
│   ├── prisma/
│   │   ├── schema.prisma       ✅ Include
│   │   └── migrations/         ✅ Include all
│   └── src/                    ✅ Include all
└── frontend/
    ├── .env.example            ✅ Include
    ├── package.json            ✅ Include
    ├── package-lock.json       ✅ Include
    ├── tsconfig.json           ✅ Include
    ├── vite.config.ts          ✅ Include
    ├── Dockerfile              ✅ Include
    ├── index.html              ✅ Include
    ├── node_modules/           ❌ Exclude (.gitignore)
    ├── dist/                   ❌ Exclude (.gitignore)
    └── src/                    ✅ Include all
```

### ❌ Files to Exclude (Should be in .gitignore)

- `node_modules/` directories
- `.env` files (only `.env.example` should be included)
- `dist/` and `build/` directories
- `coverage/` directories
- Log files (`*.log`)
- OS files (`.DS_Store`, `Thumbs.db`)
- IDE files (`.vscode/`, `.idea/`)

---

## 🔍 Pre-Submission Verification

Run this checklist before submitting:

```powershell
# 1. Check git status - should be clean
git status

# 2. Verify .env files are not tracked
git ls-files | Select-String "\.env$"
# Should return nothing (only .env.example files should exist)

# 3. Verify node_modules are not tracked
git ls-files | Select-String "node_modules"
# Should return nothing

# 4. View what files are tracked
git ls-files
# Review the list - should look clean

# 5. Check repository size (should be < 10 MB)
Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules|\.git" } | Measure-Object -Property Length -Sum
```

---

## 📤 Submission Information

### What to Submit

**1. GitHub Repository URL**
```
https://github.com/YOUR_USERNAME/SlotSwapper
```
Make sure it's:
- ✅ Public
- ✅ Accessible without login
- ✅ Contains all required files

**2. Confirm README.md Contains:**
- ✅ Project overview
- ✅ Design choices explanation
- ✅ Setup instructions (Docker + Manual)
- ✅ API endpoints documentation
- ✅ Assumptions and challenges

**3. Additional Documentation:**
- ✅ API_TESTING.md for API details
- ✅ TESTING_GUIDE.md for manual testing
- ✅ All other documentation files

---

## 🐛 Troubleshooting

### Issue: `fatal: not a git repository`

**Solution:**
```powershell
git init
```

### Issue: `remote origin already exists`

**Solution:**
```powershell
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/SlotSwapper.git
```

### Issue: `.env` files or `node_modules` accidentally committed

**Solution:**
```powershell
# Remove from git cache (but keep local files)
git rm -r --cached node_modules
git rm --cached backend/.env
git rm --cached frontend/.env

# Commit the removal
git commit -m "Remove ignored files from repository"

# Push changes
git push origin main
```

### Issue: Large repository size

**Check what's taking space:**
```powershell
Get-ChildItem -Recurse -File | Sort-Object Length -Descending | Select-Object -First 20 FullName, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}
```

**If node_modules were committed:**
```powershell
# Remove them and re-commit
git rm -rf backend/node_modules frontend/node_modules
git commit -m "Remove node_modules directories"
git push origin main --force
```

### Issue: Push rejected (non-fast-forward)

**Solution:**
```powershell
# Pull first, then push
git pull origin main --rebase
git push origin main
```

---

## ✅ Final Checklist

Before submitting, verify:

- [ ] Repository is created on GitHub
- [ ] Repository is **PUBLIC**
- [ ] All code is pushed (`git status` shows clean)
- [ ] README.md is complete and renders correctly
- [ ] `.env` files are NOT in repository (only `.env.example`)
- [ ] `node_modules/` are NOT in repository
- [ ] Repository is accessible without login (test in incognito)
- [ ] Clone and setup instructions work
- [ ] All documentation files are included

---

## 🎉 Ready to Submit!

Your submission should include:

**GitHub Repository URL:**
```
https://github.com/YOUR_USERNAME/SlotSwapper
```

**Confirmation Statement:**
```
The repository is public and contains:
✅ Comprehensive README.md with project overview, design choices, setup instructions, API documentation, assumptions, and challenges
✅ Complete source code (backend + frontend)
✅ Docker setup files
✅ Database schema and migrations
✅ Additional documentation files
✅ .env.example files (but no actual .env files)
```

---

**Good luck with your submission! 🚀**

If reviewers have any questions about setup, your README.md has comprehensive instructions for both Docker and manual setup.
