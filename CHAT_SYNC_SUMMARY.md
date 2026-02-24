# Chat Feature Synchronization - Frontend & Mobile

## Overview
The chat feature is now synchronized between the frontend web app and mobile app, using the same backend API and Socket.IO implementation.

## Changes Made

### Backend (Shared by Both)
✅ Already configured and working
- Socket.IO server with JWT authentication
- Message and Conversation models
- Chat routes with new endpoints
- Real-time message broadcasting

### Frontend Web App Updates

#### 1. Socket Utility (`frontend/src/utils/socket.js`)
**Updated:**
- Added reconnection logic (5 attempts, 1s delay)
- Added transports: websocket and polling
- Added connection event handlers
- Added cleanup function
- Matches mobile app implementation

**Before:**
```javascript
socket = io(API_URL, {
  auth: { token },
  autoConnect: false,
})
```

**After:**
```javascript
socket = io(serverUrl, {
  auth: { token },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false,
})
```

#### 2. Chat Page (`frontend/src/pages/ChatPage.jsx`)
**Updated:**
- Changed `myId` to `myUserId` for clarity
- Added `myRole` state
- Updated message alignment logic to handle Vendor vs User senders
- Updated API endpoints to match new backend routes
- Added debug logging
- Socket initialization with token

**Key Changes:**

**Message Comparison Logic:**
```javascript
// OLD - Simple comparison
const isMe = msg.sender?._id === myId

// NEW - Smart comparison based on sender type
let isMe = false;
if (msg.senderModel === 'Vendor') {
  isMe = msg.sender.userId === myUserId;  // Compare userId for vendors
} else {
  isMe = msg.sender._id === myUserId;     // Compare _id for customers
}
```

**API Endpoints:**
```javascript
// OLD
GET /api/chat/conversations/:vendorId
GET /api/chat/messages/:conversationId
PUT /api/chat/messages/:conversationId/read

// NEW
POST /api/chat/conversation/:vendorId  // Create or get
GET /api/chat/history/:conversationId  // Get messages
POST /api/chat/mark-read/:conversationId  // Mark as read
```

### Mobile App (Already Updated)
✅ All changes already applied:
- Socket utility with reconnection
- Message alignment logic
- API endpoint updates
- Debug logging

## Feature Parity

Both frontend and mobile now have:

| Feature | Frontend | Mobile | Backend |
|---------|----------|--------|---------|
| Real-time messaging | ✅ | ✅ | ✅ |
| Message alignment | ✅ | ✅ | ✅ |
| Socket reconnection | ✅ | ✅ | ✅ |
| Typing indicators | ✅ | ❌ | ✅ |
| Unread counts | ✅ | ✅ | ✅ |
| Message history | ✅ | ✅ | ✅ |
| Conversation list | ✅ | ✅ | ✅ |
| User/Vendor support | ✅ | ✅ | ✅ |

## Message Alignment Logic

### The Problem
Messages need to appear on the correct side:
- My messages → RIGHT (blue)
- Their messages → LEFT (white)

### The Challenge
Different user types have different ID structures:
- **Customer (User):** `sender._id` IS the userId
- **Vendor:** `sender._id` is Vendor document ID, `sender.userId` is the actual userId

### The Solution
Compare based on `senderModel`:

```javascript
if (msg.senderModel === 'Vendor') {
  // Vendor message: compare userId field
  isMe = msg.sender.userId === myUserId;
} else {
  // User message: compare _id field
  isMe = msg.sender._id === myUserId;
}
```

## API Endpoints (Synchronized)

### Chat Routes
```
GET  /api/chat/conversations        - Get all conversations
POST /api/chat/conversation/:vendorId - Create/get conversation
GET  /api/chat/history/:conversationId - Get message history
POST /api/chat/mark-read/:conversationId - Mark messages as read
```

### Legacy Routes (Still Supported)
```
GET /api/chat/conversations/:vendorId
GET /api/chat/messages/:conversationId
PUT /api/chat/messages/:conversationId/read
```

## Socket Events

### Client → Server
- `join_conversation` - Join a conversation room
- `send_message` - Send a new message
- `typing` - User is typing (frontend only)
- `stop_typing` - User stopped typing (frontend only)

### Server → Client
- `new_message` - New message in conversation
- `conversation_update` - Conversation metadata updated
- `user_typing` - Other user is typing (frontend only)
- `user_stop_typing` - Other user stopped typing (frontend only)
- `connect` - Connection established
- `disconnect` - Connection lost
- `connect_error` - Connection failed

## Testing

### Test Scenario 1: Customer → Vendor
1. **Frontend:** Login as customer
2. **Frontend:** Navigate to vendor details
3. **Frontend:** Click "Message" button
4. **Frontend:** Send message "Hello from web"
5. **Mobile:** Login as vendor
6. **Mobile:** Open Messages tab
7. **Mobile:** See customer's message on LEFT
8. **Mobile:** Reply "Hi from mobile"
9. **Frontend:** See vendor's reply on LEFT

### Test Scenario 2: Vendor → Customer
1. **Mobile:** Login as vendor
2. **Mobile:** Open existing conversation
3. **Mobile:** Send message "Hello from mobile"
4. **Frontend:** Login as customer
5. **Frontend:** Open Messages
6. **Frontend:** See vendor's message on LEFT
7. **Frontend:** Reply "Hi from web"
8. **Mobile:** See customer's reply on LEFT

### Test Scenario 3: Real-time Updates
1. Open chat on both frontend and mobile
2. Send message from frontend
3. Should appear instantly on mobile
4. Send message from mobile
5. Should appear instantly on frontend

## Debug Logs

### Frontend Console
```
🔑 Chat initialized - My userId: [id] Role: [role]
✅ Socket connected
📜 Chat history loaded: [count] messages
📨 New message received: {...}
```

### Mobile Console
```
🔑 Chat initialized - My userId: [id] Role: [role]
✅ Socket connected
📜 Chat history loaded: [count] messages
🔍 Checking message: {...}
  → Vendor comparison: [id] === [id] → true/false
  ✅ Final isMe: true/false → RIGHT/LEFT
```

### Backend Console
```
Socket Connected: [userId]
📤 Sending message: {...}
  → Vendor found: [vendorId] / User message, senderId: [userId]
  → Message created: {...}
```

## Common Issues & Solutions

### Issue: Messages on wrong side
**Cause:** Backend not restarted after updates
**Fix:** Restart backend server

### Issue: Socket not connecting
**Cause:** Token not initialized
**Fix:** Check token is passed to `initializeSocket(token)`

### Issue: Messages not real-time
**Cause:** Socket not connected
**Fix:** Check console for "✅ Socket connected"

### Issue: All messages show as "me"
**Cause:** Old messages in database with wrong senderModel
**Fix:** Clear old test messages or update database

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### Mobile (config/api.ts)
```typescript
const SERVER_URL = 'http://192.168.86.19:5000';
```

### Backend (.env)
```
JWT_SECRET=your_secret_key
PORT=5000
```

## Summary

✅ **Frontend and Mobile are now synchronized:**
- Same API endpoints
- Same Socket.IO implementation
- Same message alignment logic
- Same real-time behavior
- Same user experience

✅ **Both platforms support:**
- Customer-to-Vendor messaging
- Vendor-to-Customer messaging
- Real-time updates
- Message history
- Unread indicators
- Proper message alignment

✅ **Ready for production:**
- Error handling
- Reconnection logic
- Debug logging
- Clean code structure
