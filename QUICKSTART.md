# SlotSwapper - Quick Start Guide

## Option 1: Docker (Easiest - Recommended)

### Prerequisites
- Docker Desktop installed and running

### Steps
1. Open PowerShell in the SlotSwapper directory
2. Run:
   ```powershell
   docker-compose up --build
   ```
3. Wait for all services to start (may take a few minutes first time)
4. Open http://localhost:3000 in your browser
5. Create an account and start using SlotSwapper!

To stop: Press Ctrl+C, then run:
```powershell
docker-compose down
```

---

## Option 2: Manual Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 15+ installed and running
- PowerShell

### Backend Setup

1. **Open PowerShell and navigate to backend:**
   ```powershell
   cd backend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Ensure .env file exists with correct database connection**
   The .env file should contain:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/slotswapper?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=5000
   NODE_ENV=development
   ```

4. **Run database migrations:**
   ```powershell
   npx prisma migrate dev
   ```

5. **Start the backend:**
   ```powershell
   npm run dev
   ```

   Keep this PowerShell window open!

### Frontend Setup

1. **Open a NEW PowerShell window and navigate to frontend:**
   ```powershell
   cd frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start the frontend:**
   ```powershell
   npm run dev
   ```

4. **Open browser:**
   Navigate to http://localhost:3000

---

## Testing the Application

1. **Create two user accounts** (use different emails)
2. **User 1**: Create an event and mark it as "Swappable"
3. **User 2**: Create an event and mark it as "Swappable"
4. **User 1**: Go to Marketplace, find User 2's slot, request a swap
5. **User 2**: Go to Requests, accept the swap
6. **Both users**: Check Dashboard to see swapped events!

---

## Troubleshooting

### Issue: "Port already in use"
**Solution**: Either:
- Stop the process using the port
- Or change the port in .env (backend) or vite.config.ts (frontend)

### Issue: Database connection failed
**Solution**: 
- Ensure PostgreSQL is running
- Check the DATABASE_URL in backend/.env
- Create the database if it doesn't exist:
  ```sql
  CREATE DATABASE slotswapper;
  ```

### Issue: npm install fails
**Solution**:
- Delete node_modules folder and package-lock.json
- Run `npm install` again
- Or try: `npm install --legacy-peer-deps`

### Issue: TypeScript errors in VS Code
**Note**: These are expected until you run `npm install`. The errors will disappear after dependencies are installed and Prisma generates the client.

---

## Running Tests

```powershell
cd backend
npm test
```

---

## Viewing Database

```powershell
cd backend
npx prisma studio
```

This opens a web UI at http://localhost:5555 to view and edit database records.

---

## Stopping the Application

**Docker:**
Press Ctrl+C in the terminal, then:
```powershell
docker-compose down
```

**Manual:**
Press Ctrl+C in both PowerShell windows (backend and frontend)

---

Happy swapping! 🔄
