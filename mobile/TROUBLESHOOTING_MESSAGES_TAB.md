# Troubleshooting: Messages Tab Not Showing

## Quick Fixes

### 1. Restart the Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd mobile
npm start
# Press 'r' to reload the app
```

### 2. Clear Metro Bundler Cache
```bash
cd mobile
npm start -- --reset-cache
```

### 3. Clear App Data (iOS Simulator)
- Device → Erase All Content and Settings
- Restart the app

### 4. Clear App Data (Android Emulator)
- Settings → Apps → Your App → Storage → Clear Data
- Restart the app

## Debug Steps

### Step 1: Check Your Role
1. Open the app
2. Look for the **Debug** tab (🐛 icon) in the bottom navigation
3. Check what role is displayed
4. Verify "Should show: YES ✓" appears

**Expected roles for Messages tab:**
- `user` ✓
- `customer` ✓
- `vendor` ✓
- `admin` ✗ (Messages hidden for admins)

### Step 2: Check Console Logs
Look for these logs in your terminal:
```
🔍 Tab Layout - Detected Role: user
💬 Messages tab rendering, role: user
```

If you see `null` or `admin`, the Messages tab won't show.

### Step 3: Verify Login
```bash
# In the Debug tab, check:
- Has Token: Yes
- Role: user/customer/vendor (not null or admin)
```

### Step 4: Re-login
If role is wrong or null:
1. Tap "Clear Storage (Logout)" in Debug tab
2. Restart the app
3. Login again
4. Check if Messages tab appears

## Common Issues

### Issue 1: Role is `null`
**Cause**: Not logged in or token expired

**Fix**:
1. Go to login screen
2. Login with valid credentials
3. Check Debug tab again

### Issue 2: Role is `admin`
**Cause**: Logged in as admin (Messages tab is hidden for admins)

**Fix**:
1. Logout
2. Login as customer or vendor
3. Messages tab should appear

### Issue 3: Role is correct but tab still not showing
**Cause**: App cache issue

**Fix**:
```bash
# Full reset:
cd mobile
rm -rf node_modules
npm install
npm start -- --reset-cache
```

### Issue 4: Tab shows briefly then disappears
**Cause**: Role changes after initial render

**Fix**: Check if there's any code that modifies the role after login

## Verification Checklist

- [ ] Development server is running
- [ ] App is reloaded (press 'r' in terminal)
- [ ] Logged in as customer or vendor (not admin)
- [ ] Debug tab shows correct role
- [ ] Console shows role detection logs
- [ ] No errors in terminal

## Manual Test

Add this to any screen to test role detection:

```typescript
import { AuthUtils } from '../../utils/auth';
import { useEffect } from 'react';

useEffect(() => {
  const testRole = async () => {
    const role = await AuthUtils.getRole();
    console.log("TEST - Current role:", role);
    console.log("TEST - Should show messages:", 
      role === 'user' || role === 'customer' || role === 'vendor'
    );
  };
  testRole();
}, []);
```

## Still Not Working?

### Check File Structure
Verify these files exist:
```
mobile/app/(tabs)/
├── _layout.tsx          ← Tab configuration
├── messages.tsx         ← Messages list screen
└── chat/
    └── [id].tsx         ← Chat screen
```

### Check Tab Configuration
Open `mobile/app/(tabs)/_layout.tsx` and verify:

```typescript
<Tabs.Screen
  name="messages"
  options={{
    title: 'Messages',
    href: (role === 'user' || role === 'customer' || role === 'vendor') ? '/messages' : null,
    tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
  }}
/>
```

### Check for TypeScript Errors
```bash
cd mobile
npx tsc --noEmit
```

## Contact Support

If none of these work, provide:
1. Screenshot of Debug tab
2. Console logs from terminal
3. Your role (customer/vendor/admin)
4. Platform (iOS/Android)
5. Expo version

## Remove Debug Tab

Once Messages tab is working, remove the debug tab:

In `mobile/app/(tabs)/_layout.tsx`, delete:
```typescript
<Tabs.Screen
  name="debug-role"
  options={{
    title: 'Debug',
    tabBarIcon: ({ color }) => <Ionicons name="bug" size={24} color={color} />,
  }}
/>
```

And delete the file:
```bash
rm mobile/app/(tabs)/debug-role.tsx
```
