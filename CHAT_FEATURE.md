# Chat Feature - Pre-Booking Communication

Real-time chat system for customers to communicate with vendors before booking.

## Features

- Real-time messaging using Socket.IO
- 1-to-1 conversations between customers and vendors
- Typing indicators
- Unread message counts
- Message history
- Conversation list

## Backend

### Models
- `Conversation.js` - Stores conversation metadata
- `Message.js` - Stores individual messages

### Routes
- `GET /api/chat/conversations` - Get all conversations for logged-in user
- `GET /api/chat/conversations/:vendorId` - Get or create conversation with vendor
- `GET /api/chat/messages/:conversationId` - Get messages for a conversation
- `PUT /api/chat/messages/:conversationId/read` - Mark messages as read

### Socket Events
- `join_conversation` - Join a conversation room
- `send_message` - Send a new message
- `new_message` - Receive a new message
- `typing` - User is typing
- `stop_typing` - User stopped typing
- `conversation_update` - Conversation updated (new message)

## Frontend

### Pages
- `/chat` - List of all conversations
- `/chat/:vendorId` - Chat with specific vendor

### Usage
1. Customer visits vendor profile
2. Clicks "Chat with Vendor" button
3. Opens chat page with that vendor
4. Can discuss availability, pricing, requirements, etc.
5. Both parties receive real-time messages

## Setup

Backend is already configured. Frontend socket initializes on login.

## Testing

1. Login as customer
2. Go to any vendor profile
3. Click "Chat with Vendor"
4. Send messages
5. Login as vendor in another browser
6. Check `/chat` to see conversations
7. Reply to customer
