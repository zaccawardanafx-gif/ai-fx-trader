# In-App Notifications Feature

## Overview
The in-app notifications system provides real-time alerts to users when trade ideas are auto-generated. Notifications appear in a bell icon in the header and can be viewed, marked as read, and managed directly within the application.

## Components

### 1. NotificationBell Component (`src/components/NotificationBell.tsx`)

A fully-featured notification center that displays in the application header.

**Features:**
- 🔔 Bell icon with unread count badge
- Real-time polling (refreshes every 30 seconds)
- Dropdown panel with notifications list
- Mark individual notifications as read
- Mark all notifications as read
- Automatic time formatting ("Just now", "5m ago", "2h ago")
- Click-outside-to-close functionality
- Responsive design (mobile & desktop)
- Color-coded notification types:
  - ✅ Success (Green): Trade idea generated successfully
  - ⚠️ Error (Red): Auto-generation failed
  - 🔄 Retry (Yellow): Retrying generation

**Props:**
- `userId` (string): The current user's ID

**UI States:**
- **Loading**: Shows spinner while fetching notifications
- **Empty**: Shows friendly message when no notifications exist
- **With notifications**: Displays scrollable list of notifications

### 2. Updated Header Component (`src/components/Header.tsx`)

**Changes:**
- Added `userId` prop to Header component
- Integrated NotificationBell component
- Positioned bell icon between username and language switcher

## Backend Integration

### Database Table: `notifications`

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  push_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Server Actions

**From `src/app/actions/autoGeneration.ts`:**

1. **`createNotification(userId, notification)`** (Internal)
   - Creates a new notification in the database
   - Called automatically when trade ideas are generated

2. **`getUserNotifications(userId)`** (Exported)
   - Fetches user's notifications (latest 50)
   - Returns notifications sorted by creation date (newest first)
   - Maps database fields to UI-friendly format

3. **`markNotificationAsRead(notificationId, userId)`** (Exported)
   - Marks a single notification as read
   - Validates userId for security

## How It Works

### When Auto-Generation Triggers:

```
1. User's countdown timer reaches zero
   ↓
2. triggerAutoGeneration() is called
   ↓
3. Trade idea is generated successfully
   ↓
4. createNotification() creates in-app notification
   ↓
5. sendNotification() sends email notification
   ↓
6. User sees:
   - Red badge on bell icon (unread count)
   - Notification in dropdown panel
   - Email in inbox (if configured)
```

### Notification Types:

1. **`auto_generation_success`**
   - Triggered when trade idea is generated successfully
   - Green color theme
   - Shows success icon (✅)

2. **`auto_generation_error`**
   - Triggered when generation fails after max retries
   - Red color theme
   - Shows warning icon (⚠️)

3. **`auto_generation_retry`**
   - Triggered when generation fails but will retry
   - Yellow color theme
   - Shows retry icon (🔄)

## User Experience

### Desktop:
1. User sees bell icon in header
2. Badge shows unread count (e.g., "3")
3. Click bell to open notification panel
4. Panel appears as dropdown below bell
5. Notifications show with emoji icons and colors
6. Click checkmark to mark individual as read
7. Click "Mark all read" to clear all
8. Click outside panel to close

### Mobile:
1. Bell icon appears in header (responsive size)
2. Tap to open notification panel
3. Panel optimized for touch interactions
4. Scrollable list for many notifications
5. Tap outside to close

## Configuration

### Polling Interval
The notification bell polls for new notifications every **30 seconds**. You can adjust this in `NotificationBell.tsx`:

```typescript
// Poll every 30 seconds (30000ms)
const interval = setInterval(loadNotifications, 30000)
```

### Notification Limit
Currently fetches the **latest 50 notifications**. Adjust in `autoGeneration.ts`:

```typescript
.limit(50) // Change this number
```

## Styling

The NotificationBell component uses:
- **Tailwind CSS** for styling
- **Lucide React** icons
- Color themes:
  - Bell icon: Slate gray with hover effects
  - Badge: Red background with white text
  - Panel: White with shadow and border
  - Success notifications: Green accents
  - Error notifications: Red accents
  - Retry notifications: Yellow accents

## Pages Updated

All pages that use the Header component now support notifications:

1. **Dashboard** (`src/app/dashboard/page.tsx`)
   - Shows notifications while viewing trade ideas
   
2. **Settings** (`src/app/settings/page.tsx`)
   - Notifications visible while configuring auto-generation
   
3. **Prompts** (`src/app/prompts/page.tsx`)
   - Notifications visible while editing prompts

## Testing

### Manual Testing:
1. Enable auto-generation with 5-minute interval
2. Wait for countdown to reach zero
3. Check bell icon for notification badge
4. Click bell to view notification
5. Verify notification shows success message
6. Mark as read and verify badge updates
7. Check email for email notification (if configured)

### Test Different Scenarios:
- ✅ Successful generation
- ❌ Failed generation (simulate by breaking API)
- 🔄 Retry scenario

## Future Enhancements

### Possible Improvements:
1. **WebSocket Integration**: Real-time notifications without polling
2. **Sound Alerts**: Optional sound when new notification arrives
3. **Browser Notifications**: Native browser push notifications
4. **Notification Preferences**: User controls what notifications to receive
5. **Notification History Page**: Dedicated page to view all notifications
6. **Filter by Type**: Filter success/error/retry notifications
7. **Archive Feature**: Archive old notifications
8. **Export**: Download notification history

## Troubleshooting

### Bell icon not showing:
- Verify `userId` is passed to Header component
- Check browser console for errors

### Notifications not appearing:
- Verify auto-generation is triggering successfully
- Check database `notifications` table has records
- Verify `getUserNotifications()` is returning data

### Badge count incorrect:
- Clear browser cache
- Refresh the page
- Check `is_read` field in database

### Panel not closing:
- Check click-outside handler in useEffect
- Verify refs are properly attached

## Security

- ✅ User ID validation on all queries
- ✅ Notifications filtered by user (can't see other users' notifications)
- ✅ Server-side validation of user permissions
- ✅ SQL injection protection via Supabase parameterized queries

## Performance

- Polling interval: 30 seconds (configurable)
- Notification limit: 50 (configurable)
- Efficient re-renders with React state management
- Lightweight component (~3KB)

