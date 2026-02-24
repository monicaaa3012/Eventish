# Mobile Chat Implementation Guide

## Overview
This document describes the real-time chat implementation for the mobile app using Socket.IO, allowing customers and vendors to communicate about event requirements, attendee details, and booking specifics.

## Architecture

### Components
1. **Messages List** (`mobile/app/(tabs)/messages.tsx`) - Displays all conversations
2. **Chat Screen** (`mobile/app/(tabs)/chat/[id].tsx`) - Individual conversation view
3. **Socket Utility** (`mobile/utils/socket.ts`) - Socket.IO connection management
4. **API Config** (`mobile/config/api.ts`) - API endpoints and configuration

### Backend Integration
- **Socket Server**: `backend/utils/socket.js`
- **Models**: `backend/models/Message.js`, `backend/models/Conversation.js`
- **Controller**: `backend/controllers/chatController.js`

## Features

### 1. Conversation List
- View all active conversations
- See last message and timestamp
- Unread message indicators
- Pull-to-refresh functionality
- Automatic role detection (customer/vendor)

### 2. Real-time Chat
- Send and receive messages instantly
- Message history from MongoDB
- Typing indicators support (can be added)
- Auto-scroll to latest message
- Connection status handling
- Reconnection logic

### 3. Starting Conversations
- Message button on vendor details page
- Automatic conversation creation
- Direct navigation to chat screen

## Socket.IO Implementation

### Connection Flow
```typescript
1. User opens chat screen
2. Fetch authentication token
3. Connect to Socket.IO server with token
4. Server validates JWT and extracts userId
5. Join conversation room
6. Listen for new messages
7. Send messages through socket
```

### Socket Events

#### Client → Server
- `join_conversation` - Join a conversation room
- `send_message` - Send a new message

#### Server → Client
- `new_message` - Receive new message in conversation
- `conversation_update` - Global notification for new messages
- `connect` - Connection established
- `disconnect` - Connection lost
- `connect_error` - Connection failed

### Message Payload Structure
```typescript
{
  conversationId: string,
  content: string,
  receiverId: string // For notifications
}
```

## API Endpoints

### Chat Endpoints
```typescript
GET  /api/chat/conversations        // Get all conversations
GET  /api/chat/history/:id          // Get message history
POST /api/chat/conversation/:vendorId // Create/get conversation
POST /api/chat/mark-read/:id        // Mark messages as read
```

## Usage Examples

### Starting a Conversation
```typescript
// From vendor details page
const handleMessageVendor = async () => {
  const conversation = await apiCall(`/chat/conversation/${vendorId}`, { 
    method: 'POST' 
  });
  
  router.push({
    pathname: '/chat/[id]',
    params: { 
      id: conversation._id,
      receiverId: vendor.userId
    }
  });
};
```

### Sending a Message
```typescript
const onSend = () => {
  if (!message.trim() || !socketRef.current?.connected) return;

  socketRef.current.emit("send_message", {
    conversationId,
    content: message.trim(),
    receiverId
  });
  
  setMessage('');
};
```

### Receiving Messages
```typescript
socketRef.current.on("new_message", (newMsg) => {
  setMessages(prev => [...prev, newMsg]);
});
```

## Configuration

### Server URL Setup
Update `mobile/config/api.ts` with your server IP:
```typescript
const SERVER_URL = 'http://YOUR_IP:5000';
```

### Socket Connection Options
```typescript
{
  auth: { token },                    // JWT authentication
  transports: ['websocket', 'polling'], // Connection methods
  reconnection: true,                 // Auto-reconnect
  reconnectionAttempts: 5,            // Max retry attempts
  reconnectionDelay: 1000,            // Delay between retries
}
```

## Security

### Authentication
- JWT token passed in socket handshake
- Server validates token before connection
- User ID extracted from token for message attribution

### Authorization
- Users can only access their own conversations
- Messages validated on server side
- Conversation participants verified

## Troubleshooting

### Common Issues

1. **Socket not connecting**
   - Check SERVER_URL in config
   - Verify backend server is running
   - Check firewall/network settings
   - Ensure JWT token is valid

2. **Messages not appearing**
   - Check socket connection status
   - Verify conversationId is correct
   - Check backend logs for errors
   - Ensure room was joined successfully

3. **Duplicate messages**
   - Check for multiple socket connections
   - Ensure proper cleanup on unmount
   - Verify socket event listeners

### Debug Logging
Enable console logs to track socket events:
```typescript
socketRef.current.on("connect", () => {
  console.log("Socket connected");
});

socketRef.current.on("new_message", (msg) => {
  console.log("Received:", msg);
});
```

## Future Enhancements

### Planned Features
- [ ] Typing indicators
- [ ] Message read receipts
- [ ] Image/file sharing
- [ ] Push notifications for new messages
- [ ] Message search
- [ ] Conversation archiving
- [ ] Block/report functionality
- [ ] Message reactions
- [ ] Voice messages

### Performance Optimizations
- [ ] Message pagination
- [ ] Virtual list for large conversations
- [ ] Message caching
- [ ] Optimistic UI updates
- [ ] Connection pooling

## Testing

### Manual Testing Checklist
- [ ] Create new conversation from vendor details
- [ ] Send message as customer
- [ ] Receive message as vendor
- [ ] Test reconnection after network loss
- [ ] Verify unread counts
- [ ] Test with multiple conversations
- [ ] Check message persistence after app restart

### Test Scenarios
1. Customer initiates chat with vendor
2. Vendor responds to customer inquiry
3. Multiple messages in quick succession
4. App backgrounded and resumed
5. Network disconnection and reconnection
6. Multiple devices for same user

## Best Practices

### Code Organization
- Keep socket logic in dedicated utility file
- Use refs for socket instances
- Clean up connections on unmount
- Handle all socket events

### Error Handling
- Always check socket connection status
- Provide user feedback for connection issues
- Implement retry logic
- Log errors for debugging

### Performance
- Limit message history fetch
- Implement pagination for old messages
- Debounce typing indicators
- Optimize re-renders with React.memo

## Support
For issues or questions, refer to:
- Backend socket implementation: `backend/utils/socket.js`
- Socket.IO documentation: https://socket.io/docs/v4/
- React Native Socket.IO guide: https://socket.io/how-to/use-with-react-native
