# 🧪 Testing Guide for SlotSwapper

This guide will walk you through testing all the features of SlotSwapper to verify everything works correctly.

## 🚀 Prerequisites

Make sure the application is running:
- **Docker**: `docker-compose up --build`
- **Manual**: Backend on port 5000, Frontend on port 3000

## 📋 Test Scenarios

### Test 1: User Registration & Authentication

#### Steps:
1. Open http://localhost:3000
2. You should be redirected to `/login`
3. Click "Sign up" link
4. Fill in the signup form:
   - Name: `Alice Smith`
   - Email: `alice@example.com`
   - Password: `password123`
5. Click "Sign Up"

#### Expected Results:
- ✅ You are redirected to `/dashboard`
- ✅ You see "Welcome, Alice Smith" in the navbar
- ✅ Token is stored in localStorage
- ✅ Empty state message: "No events yet"

#### Test Logout:
1. Click "Logout" button
2. You should be redirected to `/login`
3. Try to access http://localhost:3000/dashboard directly
4. You should be redirected back to `/login` (protected route)

#### Test Login:
1. Enter Alice's credentials
2. Click "Log In"
3. You should be redirected to `/dashboard`

---

### Test 2: Create Events

#### Steps:
1. Login as Alice
2. Go to Dashboard
3. Click "+ Create Event" button
4. Fill in the form:
   - Title: `Team Meeting`
   - Start Time: Tomorrow at 10:00 AM
   - End Time: Tomorrow at 11:00 AM
5. Click "Create Event"

#### Expected Results:
- ✅ Modal closes
- ✅ New event appears in the events list
- ✅ Status badge shows "BUSY"
- ✅ Event displays correct date and time

#### Create More Events:
Create these additional events for Alice:
1. "Project Review" - Tomorrow 2:00 PM - 3:00 PM
2. "Client Call" - Day after tomorrow 1:00 PM - 2:00 PM

---

### Test 3: Mark Events as Swappable

#### Steps:
1. Find the "Team Meeting" event
2. Click "Make Swappable" button
3. The button should change to "Mark as Busy"
4. Status badge should change to "SWAPPABLE" (green)

#### Mark More as Swappable:
Make "Project Review" swappable as well.

---

### Test 4: Create Second User (Bob)

#### Steps:
1. Open a **new incognito/private browser window**
2. Go to http://localhost:3000
3. Sign up with:
   - Name: `Bob Johnson`
   - Email: `bob@example.com`
   - Password: `password123`

#### Create Events for Bob:
1. "Focus Block" - Tomorrow 10:00 AM - 11:00 AM (Make Swappable)
2. "Team Standup" - Tomorrow 3:00 PM - 3:30 PM (Make Swappable)
3. "Code Review" - Day after tomorrow 10:00 AM - 11:00 AM (Leave as Busy)

---

### Test 5: Browse Marketplace

#### As Alice:
1. Click "Marketplace" in navbar
2. You should see Bob's swappable slots:
   - "Focus Block"
   - "Team Standup"
3. You should NOT see:
   - Your own slots
   - Bob's "Code Review" (it's BUSY)

#### Verify Slot Details:
Each slot should show:
- ✅ Event title
- ✅ Owner name (Bob Johnson)
- ✅ Date and time
- ✅ "Request Swap" button

---

### Test 6: Request a Swap

#### As Alice:
1. In Marketplace, find Bob's "Focus Block" slot
2. Click "Request Swap"
3. A modal should appear showing:
   - "You are requesting: Focus Block"
   - List of YOUR swappable slots (Team Meeting, Project Review)

4. Click on "Team Meeting" to select it

#### Expected Results:
- ✅ Alert: "Swap request sent successfully!"
- ✅ Modal closes
- ✅ Bob's "Focus Block" is no longer in the marketplace (it's SWAP_PENDING)

---

### Test 7: View Swap Requests

#### As Alice (Initiator):
1. Click "Requests" in navbar
2. Under "Outgoing Requests", you should see:
   - Request to Bob Johnson
   - You offered: Team Meeting
   - For their slot: Focus Block
   - Status: PENDING
   - "Waiting for response..." message

#### As Bob (Receiver) - Switch to Bob's browser window:
1. Click "Requests" in navbar
2. Under "Incoming Requests", you should see:
   - Request from Alice Smith
   - They offer: Team Meeting
   - For your slot: Focus Block
   - "Accept" and "Reject" buttons

#### Verify Real-time Updates:
1. Wait 5 seconds (auto-refresh)
2. The request should still be there (it's PENDING)

---

### Test 8: Reject a Swap

#### Setup: Create Another Request First
1. As Alice, go to Marketplace
2. Request to swap "Project Review" for Bob's "Team Standup"

#### As Bob:
1. Go to Requests
2. Find the request for "Team Standup"
3. Click "Reject"

#### Expected Results:
- ✅ Alert: "Swap rejected successfully!"
- ✅ Request disappears from incoming list
- ✅ Go to Dashboard: "Team Standup" is back to SWAPPABLE
- ✅ As Alice: In Marketplace, Bob's "Team Standup" is visible again

---

### Test 9: Accept a Swap (The Critical Test!)

#### As Bob:
1. Go to Requests
2. Find the request from Alice for "Focus Block" ↔ "Team Meeting"
3. Click "Accept"

#### Expected Results:
- ✅ Alert: "Swap accepted successfully!"
- ✅ You are redirected to `/dashboard`
- ✅ **Key Test**: Check your events:
  - "Focus Block" should be GONE
  - **"Team Meeting" should now be in YOUR calendar!**
  - Status should be "BUSY" (not swappable anymore)

#### As Alice (Switch back to Alice's window):
1. Go to Dashboard
2. **Key Test**: Check your events:
  - "Team Meeting" should be GONE
  - **"Focus Block" should now be in YOUR calendar!**
  - Status should be "BUSY"

#### Verify Complete:
- ✅ Ownership was successfully exchanged
- ✅ Both slots are marked as BUSY
- ✅ Swap request is no longer in the Requests page
- ✅ UI updated automatically for both users

---

### Test 10: Edge Cases

#### Test: Can't Delete Swap Pending Event
1. Request a swap (any slots)
2. Try to delete the event that's in SWAP_PENDING
3. Delete button should be disabled
4. Or show error: "Cannot delete an event with pending swap"

#### Test: Can't Manually Set to SWAP_PENDING
1. Try to use the API directly (Postman/curl):
   ```bash
   curl -X PATCH http://localhost:5000/api/events/{eventId} \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"status": "SWAP_PENDING"}'
   ```
2. Should get error: "Cannot manually set status to SWAP_PENDING"

#### Test: Can't Swap Own Slots
Try using API to create swap with same user's two slots - should fail.

#### Test: Can't Swap Non-Swappable Slots
1. Mark an event as BUSY
2. Try to request swap for it
3. Should get error: "The requested slot is not available for swapping"

---

### Test 11: Multiple Users & Concurrent Requests

#### Setup:
1. Create a 3rd user "Charlie" in another browser
2. Have Charlie create swappable slots
3. Have both Alice and Bob try to request the same Charlie slot

#### Expected:
- ✅ First request succeeds (slot becomes SWAP_PENDING)
- ✅ Second request fails (slot is already SWAP_PENDING)

---

## 🎯 Success Criteria

If all the above tests pass, you have verified:

✅ **Authentication System**
- User registration
- Login/Logout
- Protected routes
- JWT tokens

✅ **Event Management**
- Create events
- View events
- Update event status
- Delete events

✅ **Swap Marketplace**
- View other users' swappable slots
- Filter out own slots
- Filter out non-swappable slots

✅ **Swap Request Flow**
- Create swap requests
- View incoming/outgoing requests
- Accept swaps with ownership exchange
- Reject swaps with status revert

✅ **Data Integrity**
- Database transactions work correctly
- No duplicate swaps
- Proper status management
- Cascade deletes work

✅ **UI/UX**
- Dynamic updates
- Error handling
- Loading states
- Responsive design

---

## 🐛 Common Issues & Solutions

### Issue: "Connection refused" on API calls
**Solution**: Make sure backend is running on port 5000

### Issue: Events don't appear
**Solution**: Check browser console for errors, verify JWT token is being sent

### Issue: Swap doesn't work
**Solution**: 
1. Check both events are SWAPPABLE
2. Check both belong to different users
3. Check no existing PENDING swap for those slots

### Issue: Docker containers crash
**Solution**: 
```bash
docker-compose down
docker-compose up --build
```

---

## 📊 What to Look For

### In Browser DevTools (F12):
- **Network Tab**: Check API calls return 200/201 status
- **Application Tab → localStorage**: Verify token is stored
- **Console**: Should be no errors (except expected validation errors)

### In Backend Logs:
- Check for any error messages
- Verify API requests are being received
- Check database connection is successful

### In Prisma Studio (optional):
```bash
cd backend
npx prisma studio
```
- View Users table
- View Events table (see ownership changes)
- View SwapRequests table (see status changes)

---

## ✅ Final Checklist

- [ ] Two users created successfully
- [ ] Events created for both users
- [ ] Events marked as swappable
- [ ] Marketplace shows correct slots
- [ ] Swap request created successfully
- [ ] Incoming/outgoing requests displayed correctly
- [ ] Swap rejection works (slots revert to SWAPPABLE)
- [ ] **Swap acceptance works (ownership exchanged)**
- [ ] UI updates dynamically
- [ ] No console errors
- [ ] Protected routes work correctly

---

## 🎉 Congratulations!

If you've completed all these tests successfully, SlotSwapper is fully functional and ready for use!

The most critical test is **Test 9 (Accept a Swap)** - this demonstrates the complex database transaction logic working correctly to exchange slot ownership between users.
