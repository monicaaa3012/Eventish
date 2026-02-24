# Chat UserId Fix

## Problem
The chat feature was showing `My userId: undefined` in console logs, causing issues with message alignment and conversation loading.

## Root Cause
The backend login endpoint returns user data in this format:
```json
{
  "token": "...",
  "role": "user",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "..."
  }
}
```

But the frontend Login component was looking for `data.userId` instead of `data.user.id`.

## Solution
Updated `frontend/src/pages/Auth/Login.jsx` to:
1. Extract userId from the correct path: `data.user?.id || data.userId`
2. Store both `id` and `_id` fields in the user object for compatibility
3. Include user name and email from the backend response
4. Add better debug logging to show the stored user object

## Changes Made
- Modified the localStorage storage logic to correctly extract and store the user ID
- Added fallback to handle both response formats (`data.user.id` and `data.userId`)
- Stored both `id` and `_id` in the user object since different parts of the code check different fields

## Testing
After this fix:
1. Log in as a user or vendor
2. Check browser console - should see `My userId: [actual-id]` instead of `undefined`
3. Messages should align correctly (your messages on right, others on left)
4. Conversations should load without 500 errors
