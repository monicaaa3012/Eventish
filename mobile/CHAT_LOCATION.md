# Where to Find the Chat Feature

## Bottom Tab Navigation

The Messages tab is located in the bottom navigation bar of the mobile app:

```
┌─────────────────────────────────────────┐
│                                         │
│         App Content Area                │
│                                         │
│                                         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  🏠      🔍      📅      💬      👤     │
│ Home  Explore Bookings Messages Account │
└─────────────────────────────────────────┘
                            ↑
                    CHAT FEATURE HERE
```

## Access Points

### 1. Messages Tab (Main Entry)
- **Location**: Bottom tab bar, 4th icon (💬)
- **Shows**: List of all your conversations
- **Available to**: Customers and Vendors

### 2. Vendor Details Page (Start Chat)
- **Location**: Vendor details screen → Message button (💬 icon)
- **Action**: Creates new conversation or opens existing one
- **Available to**: Customers only

### 3. Navigation Path
```
Customer Flow:
Home → Explore → Vendor Details → Message Button → Chat Screen
                                        OR
Messages Tab → Select Conversation → Chat Screen

Vendor Flow:
Messages Tab → Select Conversation → Chat Screen
```

## File Locations

### Tab Configuration
- **File**: `mobile/app/(tabs)/_layout.tsx`
- **Lines**: Look for the "messages" tab screen configuration

### Messages List
- **File**: `mobile/app/(tabs)/messages.tsx`
- **Route**: `/messages`

### Chat Screen
- **File**: `mobile/app/(tabs)/chat/[id].tsx`
- **Route**: `/chat/[conversationId]`

## Visibility Rules

| User Role | Messages Tab | Start Chat | Receive Messages |
|-----------|--------------|------------|------------------|
| Customer  | ✅ Visible   | ✅ Yes     | ✅ Yes          |
| Vendor    | ✅ Visible   | ❌ No      | ✅ Yes          |
| Admin     | ❌ Hidden    | ❌ No      | ❌ No           |

## Testing the Feature

1. **Login as Customer**
   - Check bottom tab bar
   - You should see 5 tabs including Messages

2. **Login as Vendor**
   - Check bottom tab bar
   - You should see 4 tabs including Messages (no Explore)

3. **Login as Admin**
   - Check bottom tab bar
   - You should see 3 tabs (no Explore, no Bookings, no Messages)

## Troubleshooting

### "I don't see the Messages tab"

**Check your role:**
```typescript
// In any screen, add this to debug:
import { AuthUtils } from '../../utils/auth';

useEffect(() => {
  const checkRole = async () => {
    const role = await AuthUtils.getRole();
    console.log("Current role:", role);
  };
  checkRole();
}, []);
```

**Expected values:**
- Customer: `"user"` or `"customer"`
- Vendor: `"vendor"`
- Admin: `"admin"`

### "Tab shows but is empty"

1. Check if backend is running
2. Verify API endpoint: `GET /api/chat/conversations`
3. Check console for errors
4. Ensure you're logged in with valid token

### "Can't start conversation from vendor page"

1. Ensure you're logged in as a customer
2. Check vendor details page has the message button
3. Verify API endpoint: `POST /api/chat/conversation/:vendorId`
4. Check console logs for errors

## Quick Test

Run this in your terminal to verify the tab is configured:

```bash
# Search for messages tab configuration
grep -n "messages" mobile/app/(tabs)/_layout.tsx
```

You should see output showing the messages tab configuration around line 50-60.
