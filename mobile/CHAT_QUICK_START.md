# Chat Feature - Quick Start Guide

## Finding the Chat Feature

### In the Mobile App Navigation
The chat feature is accessible through the bottom tab bar:
- **Messages Tab** (💬 icon) - 4th tab from the left
- Visible for: Customers and Vendors
- Hidden for: Admins

### Tab Bar Order
1. Home (🏠)
2. Explore (🔍) - Customers only
3. Bookings (📅)
4. **Messages (💬)** ← Chat feature here
5. Account (👤)

## Setup (One-time)

1. **Update Server URL** in `mobile/config/api.ts`:
   ```typescript
   const SERVER_URL = 'http://YOUR_LOCAL_IP:5000';
   ```

2. **Install Dependencies** (if not already installed):
   ```bash
   npm install socket.io-client
   ```

3. **Start Backend Server**:
   ```bash
   cd backend
   npm start
   ```

4. **Start Mobile App**:
   ```bash
   cd mobile
   npm start
   ```

## How to Use

### For Customers

1. **Browse Vendors** → Tap on a vendor
2. **Vendor Details Page** → Tap the message icon (💬)
3. **Chat Screen Opens** → Type your message
4. **Send** → Tap send button

### For Vendors

1. **Messages Tab** → View all customer conversations
2. **Tap Conversation** → Open chat
3. **Reply** → Type and send messages

## Key Files

| File | Purpose |
|------|---------|
| `mobile/app/(tabs)/messages.tsx` | Conversation list |
| `mobile/app/(tabs)/chat/[id].tsx` | Chat screen |
| `mobile/utils/socket.ts` | Socket connection |
| `mobile/config/api.ts` | API configuration |
| `backend/utils/socket.js` | Server socket logic |

## Common Operations

### Check Connection Status
```typescript
if (socketRef.current?.connected) {
  console.log("Connected");
}
```

### Manual Reconnect
```typescript
socketRef.current?.connect();
```

### Leave Conversation
```typescript
socketRef.current?.disconnect();
```

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Can't connect | Check SERVER_URL matches your backend IP |
| Messages not sending | Verify socket is connected |
| Not receiving messages | Check if joined conversation room |
| App crashes | Check token is valid and not expired |

## Testing Tips

1. **Test with two devices/emulators**:
   - One as customer
   - One as vendor

2. **Check backend logs** for socket events:
   ```
   Socket Connected: [userId]
   ```

3. **Use React Native Debugger** to inspect socket events

4. **Test network scenarios**:
   - Turn off WiFi
   - Switch networks
   - Background app

## Quick Debug Commands

```typescript
// In chat screen, add temporary logging:
console.log("Socket connected:", socketRef.current?.connected);
console.log("My ID:", myId);
console.log("Conversation ID:", conversationId);
console.log("Messages count:", messages.length);
```

## Next Steps

- Read full documentation: `CHAT_IMPLEMENTATION.md`
- Review backend socket code: `backend/utils/socket.js`
- Check API endpoints: `backend/controllers/chatController.js`
