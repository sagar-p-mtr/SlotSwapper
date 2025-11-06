# SlotSwapper

A peer-to-peer time-slot scheduling application where users can mark their busy calendar slots as "swappable" and exchange them with other users. This is a full-stack TypeScript application demonstrating secure authentication, complex database transactions, and modern React patterns.

**🔗 GitHub Repository**: [Your Repository URL Here - Make it Public]

> **Note**: This project was built as part of a technical assessment demonstrating full-stack development capabilities with a focus on data integrity, security, and user experience.

## 📖 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Design Choices](#-design-choices)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Assumptions & Challenges](#-assumptions--challenges)
- [Future Enhancements](#-future-enhancements)

## 🎯 Overview

SlotSwapper solves the common problem of scheduling conflicts by enabling users to exchange calendar slots with each other. The application provides a marketplace where users can discover available time slots from other users and propose mutually beneficial swaps.

**Key Design Choices:**
- **Atomic Transactions**: Used Prisma's transaction system to ensure swap operations are atomic - if any part fails, the entire swap is rolled back
- **Status-Based State Machine**: Events have three states (BUSY, SWAPPABLE, SWAP_PENDING) to prevent race conditions
- **JWT Authentication**: Stateless authentication allows horizontal scaling
- **Optimistic UI Updates**: Frontend updates immediately with automatic refresh for consistency
- **Database-First Design**: Prisma schema drives type generation for end-to-end type safety

## 🚀 Features

### Core Features
- **User Authentication**: Secure signup and login with JWT tokens
- **Calendar Management**: Create, view, update, and delete calendar events
- **Slot Swapping**: Mark events as swappable and exchange with other users
- **Swap Marketplace**: Browse all available swappable slots from other users
- **Request Management**: Send, receive, accept, and reject swap requests
- **Real-time Updates**: Automatic polling for new swap requests
- **State Management**: Dynamic UI updates after swap operations

### Technical Highlights
- **Full-stack TypeScript**: Type-safe frontend and backend
- **Transaction Safety**: Database transactions ensure swap integrity
- **Protected Routes**: Secure authentication on all protected endpoints
- **Responsive Design**: Mobile-friendly UI with modern CSS
- **Docker Support**: One-command setup with Docker Compose
- **Database Migrations**: Prisma ORM with type-safe queries
- **Comprehensive Testing**: Jest tests for critical swap logic

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Testing**: Jest

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Date Formatting**: date-fns
- **Styling**: Custom CSS with modern design

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15

## 📋 Prerequisites

Choose one of the following setup methods:

### Option 1: Docker (Recommended - Fastest Setup)
- Docker Desktop installed
- Docker Compose installed
- **Setup time**: ~3 minutes

### Option 2: Manual Setup
- Node.js 18+ installed
- PostgreSQL 15+ installed and running
- npm or yarn package manager
- **Setup time**: ~10 minutes

---

## 🚀 Getting Started

Choose your preferred setup method below. Docker is recommended for quickest setup.

### Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SlotSwapper
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

4. **Stop the services**
   ```bash
   docker-compose down
   ```

That's it! Docker will automatically:
- Set up PostgreSQL database
- Run database migrations
- Start the backend server
- Start the frontend development server

## 💻 Manual Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/slotswapper?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=5000
   NODE_ENV=development
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The backend API will be running at http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

The frontend will be running at http://localhost:3000

## 🧪 Running Tests

### Backend Tests

```bash
cd backend
npm test
```

To see test coverage:
```bash
npm test -- --coverage
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token"
  }
}
```

#### POST /api/auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Event Endpoints (Protected)

All event endpoints require Bearer token authentication.

#### GET /api/events
Get all events for the authenticated user.

#### POST /api/events
Create a new event.

**Request Body:**
```json
{
  "title": "Team Meeting",
  "startTime": "2025-11-10T10:00:00Z",
  "endTime": "2025-11-10T11:00:00Z"
}
```

#### PATCH /api/events/:id
Update an event (including status changes).

**Request Body:**
```json
{
  "status": "SWAPPABLE"
}
```

#### DELETE /api/events/:id
Delete an event.

### Swap Endpoints (Protected)

#### GET /api/swappable-slots
Get all SWAPPABLE slots from other users.

#### GET /api/swap-requests
Get all swap requests (incoming and outgoing).

**Response:**
```json
{
  "success": true,
  "data": {
    "incoming": [...],
    "outgoing": [...]
  }
}
```

#### POST /api/swap-request
Create a new swap request.

**Request Body:**
```json
{
  "mySlotId": "uuid-of-your-slot",
  "theirSlotId": "uuid-of-their-slot"
}
```

#### POST /api/swap-response/:requestId
Accept or reject a swap request.

**Request Body:**
```json
{
  "accept": true
}
```

## 🗃️ Database Schema

### User
- id (UUID, Primary Key)
- email (String, Unique)
- name (String)
- password (String, Hashed)
- createdAt (DateTime)
- updatedAt (DateTime)

### Event
- id (UUID, Primary Key)
- title (String)
- startTime (DateTime)
- endTime (DateTime)
- status (Enum: BUSY, SWAPPABLE, SWAP_PENDING)
- userId (UUID, Foreign Key)
- createdAt (DateTime)
- updatedAt (DateTime)

### SwapRequest
- id (UUID, Primary Key)
- initiatorId (UUID, Foreign Key)
- receiverId (UUID, Foreign Key)
- initiatorSlotId (UUID, Foreign Key)
- receiverSlotId (UUID, Foreign Key)
- status (Enum: PENDING, ACCEPTED, REJECTED)
- createdAt (DateTime)
- updatedAt (DateTime)

## 🔒 Swap Logic Flow

1. **Creating a Swap Request**
   - User A marks their slot as SWAPPABLE
   - User B marks their slot as SWAPPABLE
   - User A browses marketplace and finds User B's slot
   - User A selects their own slot to offer and creates swap request
   - Both slots are set to SWAP_PENDING
   - SwapRequest is created with PENDING status

2. **Accepting a Swap**
   - User B receives the swap request notification
   - User B clicks Accept
   - Database transaction:
     - SwapRequest status → ACCEPTED
     - Swap slot ownership (User A's slot → User B, User B's slot → User A)
     - Both slots status → BUSY
   - Both users see updated calendars

3. **Rejecting a Swap**
   - User B clicks Reject
   - Database transaction:
     - SwapRequest status → REJECTED
     - Both slots status → SWAPPABLE (available again)

## 🎨 User Interface

### Pages

1. **Login/Signup** (`/login`, `/signup`)
   - Clean authentication forms
   - Form validation
   - Error handling

2. **Dashboard** (`/dashboard`)
   - View all user's events
   - Create new events
   - Toggle event status (Busy ↔ Swappable)
   - Delete events
   - Visual status badges

3. **Marketplace** (`/marketplace`)
   - Browse all available swappable slots
   - Filter shows only other users' slots
   - Request swap with modal selection
   - Shows slot owner information

4. **Requests** (`/requests`)
   - Incoming requests with Accept/Reject buttons
   - Outgoing requests with status tracking
   - Auto-refresh every 5 seconds
   - Detailed swap information display

## 🔐 Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- Bearer token authentication on protected routes
- Input validation on all endpoints
- SQL injection protection via Prisma ORM
- CORS configuration
- Protected route components on frontend

## 🎯 Project Structure

```
SlotSwapper/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── events.ts
│   │   │   ├── swaps.ts
│   │   │   └── swaps.test.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Marketplace.tsx
│   │   │   └── Requests.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── styles/
│   │   │   ├── App.css
│   │   │   ├── Auth.css
│   │   │   └── Dashboard.css
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🚀 Deployment

### Backend Deployment (Render/Heroku)

1. Set environment variables on hosting platform
2. Connect PostgreSQL database
3. Run migration command: `npx prisma migrate deploy`
4. Build command: `npm run build`
5. Start command: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Update API base URL to point to deployed backend

## 🧩 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Email notifications for swap requests
- [ ] Calendar view (week/month grid)
- [ ] Recurring events support
- [ ] Advanced filtering and search
- [ ] User profiles and avatars
- [ ] Swap history and analytics
- [ ] Mobile apps (React Native)

## 🤔 Assumptions & Challenges

### Assumptions Made

1. **Time Zones**: All times are stored in UTC. Frontend displays in local time using date-fns
2. **Swap Fairness**: Any two SWAPPABLE slots can be swapped regardless of duration or timing
3. **One Active Swap**: A slot can only be involved in one pending swap request at a time
4. **Email Uniqueness**: Each user must have a unique email address
5. **Single User Sessions**: No concurrent session management needed
6. **Manual Refresh**: Users refresh marketplace/requests pages manually (5s auto-refresh on requests page)

### Challenges Faced

1. **Race Conditions in Swap Logic** 
   - **Challenge**: Two users requesting the same slot simultaneously could cause conflicts
   - **Solution**: Implemented database transactions with row locking and status checks
   - **Code**: Used Prisma's `$transaction` API to ensure atomicity

2. **State Synchronization**
   - **Challenge**: Keeping frontend and backend in sync after swap operations
   - **Solution**: Implemented fetch-after-mutation pattern and auto-refresh on critical pages
   - **Code**: Each mutation triggers a data refetch

3. **Complex Foreign Key Relationships**
   - **Challenge**: SwapRequest table has 4 foreign keys to different tables
   - **Solution**: Careful Prisma schema design with proper cascade rules
   - **Code**: Used `onDelete: Cascade` to maintain referential integrity

4. **Type Safety Across Stack**
   - **Challenge**: Ensuring consistent types between frontend and backend
   - **Solution**: Generated Prisma types on backend, mirrored on frontend
   - **Code**: Shared TypeScript interfaces for API contracts

5. **Docker Development Workflow**
   - **Challenge**: Hot reload in Docker containers with volume mounts
   - **Solution**: Configured nodemon for backend and Vite HMR for frontend
   - **Code**: Volume mounts in docker-compose.yml exclude node_modules

## 📊 API Endpoints Reference

### Quick Reference Table

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/signup` | ❌ | Create new user account |
| POST | `/api/auth/login` | ❌ | Login and receive JWT token |
| GET | `/api/events` | ✅ | Get all events for authenticated user |
| POST | `/api/events` | ✅ | Create a new event |
| PATCH | `/api/events/:id` | ✅ | Update event (title, times, or status) |
| DELETE | `/api/events/:id` | ✅ | Delete an event |
| GET | `/api/swappable-slots` | ✅ | Get all SWAPPABLE slots from other users |
| GET | `/api/swap-requests` | ✅ | Get incoming and outgoing swap requests |
| POST | `/api/swap-request` | ✅ | Create a new swap request |
| POST | `/api/swap-response/:requestId` | ✅ | Accept or reject a swap request |
| GET | `/health` | ❌ | Health check endpoint |

### Postman Collection

You can import the following curl commands into Postman or use them directly:

```bash
# 1. Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","name":"Alice","password":"password123"}'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'

# 3. Create Event (replace YOUR_TOKEN)
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Team Meeting","startTime":"2025-11-10T10:00:00Z","endTime":"2025-11-10T11:00:00Z"}'

# 4. Get All Events
curl -X GET http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Update Event Status to SWAPPABLE
curl -X PATCH http://localhost:5000/api/events/EVENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status":"SWAPPABLE"}'

# 6. Get Swappable Slots
curl -X GET http://localhost:5000/api/swappable-slots \
  -H "Authorization: Bearer YOUR_TOKEN"

# 7. Create Swap Request
curl -X POST http://localhost:5000/api/swap-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"mySlotId":"YOUR_SLOT_ID","theirSlotId":"THEIR_SLOT_ID"}'

# 8. Accept Swap
curl -X POST http://localhost:5000/api/swap-response/REQUEST_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"accept":true}'
```

See [API_TESTING.md](./API_TESTING.md) for detailed API documentation with request/response examples.

## 📝 License

MIT License

## 👨‍💻 Development

### Code Quality
- TypeScript strict mode enabled
- ESLint for code linting
- Prettier for code formatting (recommended)

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset
```

### Debugging
- Backend logs to console
- Frontend: React DevTools
- Database: Prisma Studio (http://localhost:5555)

## 🐛 Troubleshooting

**Issue**: Database connection error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists and is accessible

**Issue**: JWT token errors
- Check JWT_SECRET is set in .env
- Verify token is being sent in Authorization header
- Clear localStorage and login again

**Issue**: Port already in use
- Change PORT in backend .env
- Update proxy in frontend vite.config.ts
- Or stop the process using the port

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ using modern web technologies**
