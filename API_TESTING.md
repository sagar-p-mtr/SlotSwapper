# SlotSwapper API Test Collection

This file contains example API requests for testing the backend directly.
Use with tools like Postman, Insomnia, or curl.

## Base URL
```
http://localhost:5000/api
```

---

## 1. Authentication

### Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "alice@example.com",
  "name": "Alice Smith",
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
      "email": "alice@example.com",
      "name": "Alice Smith"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "password123"
}
```

---

## 2. Events (Protected - Requires Bearer Token)

### Get All Events
```http
GET /events
Authorization: Bearer YOUR_JWT_TOKEN
```

### Create Event
```http
POST /events
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Team Meeting",
  "startTime": "2025-11-10T10:00:00Z",
  "endTime": "2025-11-10T11:00:00Z"
}
```

### Update Event Status (Make Swappable)
```http
PATCH /events/:eventId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "SWAPPABLE"
}
```

### Update Event Details
```http
PATCH /events/:eventId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated Title",
  "startTime": "2025-11-10T11:00:00Z",
  "endTime": "2025-11-10T12:00:00Z"
}
```

### Delete Event
```http
DELETE /events/:eventId
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 3. Swap Operations (Protected)

### Get Swappable Slots from Other Users
```http
GET /swappable-slots
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Focus Block",
      "startTime": "2025-11-10T10:00:00Z",
      "endTime": "2025-11-10T11:00:00Z",
      "status": "SWAPPABLE",
      "user": {
        "id": "uuid",
        "name": "Bob Johnson",
        "email": "bob@example.com"
      }
    }
  ]
}
```

### Get All Swap Requests
```http
GET /swap-requests
Authorization: Bearer YOUR_JWT_TOKEN
```

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

### Create Swap Request
```http
POST /swap-request
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "mySlotId": "uuid-of-my-slot",
  "theirSlotId": "uuid-of-their-slot"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "initiatorId": "uuid",
    "receiverId": "uuid",
    "initiatorSlotId": "uuid",
    "receiverSlotId": "uuid",
    "status": "PENDING",
    "initiator": {...},
    "receiver": {...},
    "initiatorSlot": {...},
    "receiverSlot": {...}
  }
}
```

### Accept Swap Request
```http
POST /swap-response/:requestId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "accept": true
}
```

### Reject Swap Request
```http
POST /swap-response/:requestId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "accept": false
}
```

---

## 4. PowerShell Examples (Windows)

### Signup
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method Post -ContentType "application/json" -Body (@{
  email = "alice@example.com"
  name = "Alice Smith"
  password = "password123"
} | ConvertTo-Json)

$token = $response.data.token
Write-Host "Token: $token"
```

### Create Event (Using Saved Token)
```powershell
$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

$body = @{
  title = "Team Meeting"
  startTime = "2025-11-10T10:00:00Z"
  endTime = "2025-11-10T11:00:00Z"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/events" -Method Post -Headers $headers -Body $body
```

### Get Events
```powershell
$headers = @{
  "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/events" -Method Get -Headers $headers
```

---

## 5. curl Examples (Linux/Mac/Git Bash)

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "name": "Alice Smith",
    "password": "password123"
  }'
```

### Login and Save Token
```bash
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }' | jq -r '.data.token')

echo "Token: $TOKEN"
```

### Create Event
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting",
    "startTime": "2025-11-10T10:00:00Z",
    "endTime": "2025-11-10T11:00:00Z"
  }'
```

### Get Swappable Slots
```bash
curl -X GET http://localhost:5000/api/swappable-slots \
  -H "Authorization: Bearer $TOKEN"
```

### Create Swap Request
```bash
curl -X POST http://localhost:5000/api/swap-request \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mySlotId": "your-slot-uuid",
    "theirSlotId": "their-slot-uuid"
  }'
```

### Accept Swap
```bash
curl -X POST http://localhost:5000/api/swap-response/{requestId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accept": true
  }'
```

---

## 6. Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "End time must be after start time"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Unauthorized access to this event"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Event not found"
}
```

---

## 7. Complete Test Flow

```bash
# 1. Create User 1
USER1=$(curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","name":"User One","password":"pass123"}' \
  | jq -r '.data.token')

# 2. Create User 2
USER2=$(curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@test.com","name":"User Two","password":"pass123"}' \
  | jq -r '.data.token')

# 3. User 1 creates event
EVENT1=$(curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer $USER1" \
  -H "Content-Type: application/json" \
  -d '{"title":"Meeting 1","startTime":"2025-11-10T10:00:00Z","endTime":"2025-11-10T11:00:00Z"}' \
  | jq -r '.data.id')

# 4. User 2 creates event
EVENT2=$(curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer $USER2" \
  -H "Content-Type: application/json" \
  -d '{"title":"Meeting 2","startTime":"2025-11-12T14:00:00Z","endTime":"2025-11-12T15:00:00Z"}' \
  | jq -r '.data.id')

# 5. Both make events swappable
curl -X PATCH http://localhost:5000/api/events/$EVENT1 \
  -H "Authorization: Bearer $USER1" \
  -H "Content-Type: application/json" \
  -d '{"status":"SWAPPABLE"}'

curl -X PATCH http://localhost:5000/api/events/$EVENT2 \
  -H "Authorization: Bearer $USER2" \
  -H "Content-Type: application/json" \
  -d '{"status":"SWAPPABLE"}'

# 6. User 1 requests swap
REQUEST=$(curl -X POST http://localhost:5000/api/swap-request \
  -H "Authorization: Bearer $USER1" \
  -H "Content-Type: application/json" \
  -d "{\"mySlotId\":\"$EVENT1\",\"theirSlotId\":\"$EVENT2\"}" \
  | jq -r '.data.id')

# 7. User 2 accepts swap
curl -X POST http://localhost:5000/api/swap-response/$REQUEST \
  -H "Authorization: Bearer $USER2" \
  -H "Content-Type: application/json" \
  -d '{"accept":true}'

# 8. Verify swap - User 1 should now have Event 2
curl -X GET http://localhost:5000/api/events \
  -H "Authorization: Bearer $USER1" | jq

# 9. Verify swap - User 2 should now have Event 1
curl -X GET http://localhost:5000/api/events \
  -H "Authorization: Bearer $USER2" | jq
```

---

## 8. Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "SlotSwapper API is running"
}
```

---

Save these commands and use them to test the API independently of the frontend!
