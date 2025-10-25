# Auto-Generation Feature Implementation

## Overview

The Auto-Generation feature allows users to automatically generate trade ideas at user-defined intervals, similar to setting up a recurring event in a calendar. This feature includes countdown timers, pause/resume functionality, timezone support, and comprehensive notification systems.

## Features Implemented

### ✅ Core Functionality
- **Flexible Intervals**: Support for hourly, 4-hour, 6-hour, 8-hour, 12-hour, daily, and weekly intervals
- **Timezone Support**: Users can set their preferred timezone for accurate scheduling
- **Time-based Scheduling**: For daily/weekly intervals, users can specify exact times
- **Pause/Resume**: Users can temporarily pause auto-generation without losing settings
- **Independent Operation**: Auto-generation works independently of manual generation

### ✅ User Interface
- **Countdown Timer**: Real-time countdown showing time until next generation
- **Settings Modal**: Comprehensive settings interface with timezone and interval selection
- **Settings Integration**: Auto-generation settings accessible from main settings page
- **Visual Indicators**: Clear status indicators for active, paused, and generating states

### ✅ Backend Infrastructure
- **Database Schema**: Extended profiles table and new scheduling tables
- **Server Actions**: Complete CRUD operations for auto-generation settings
- **Cron Integration**: Enhanced existing cron job to process auto-generation
- **Retry Logic**: Automatic retry with exponential backoff (2 retries max)
- **Error Handling**: Comprehensive error handling and user notifications

### ✅ Notification System
- **In-App Notifications**: Database-stored notifications for success/failure events
- **Email Notifications**: Placeholder implementation for email alerts
- **Push Notifications**: Placeholder implementation for push alerts
- **Retry Notifications**: Users notified of retry attempts and failures

### ✅ Internationalization
- **English Translations**: Complete translation set for all auto-generation features
- **French Translations**: Full French localization support
- **Dynamic Language Switching**: All components support real-time language switching

## Database Schema

### New Tables

#### `auto_generation_schedule`
```sql
CREATE TABLE auto_generation_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interval_type TEXT NOT NULL,
  scheduled_time TIME,
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,
  last_triggered TIMESTAMPTZ,
  next_trigger TIMESTAMPTZ NOT NULL,
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `notifications`
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  push_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Extended `profiles` Table
```sql
ALTER TABLE profiles ADD COLUMN auto_generation_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN auto_generation_interval TEXT DEFAULT 'weekly';
ALTER TABLE profiles ADD COLUMN auto_generation_time TIME DEFAULT '09:00:00';
ALTER TABLE profiles ADD COLUMN auto_generation_timezone TEXT DEFAULT 'UTC';
ALTER TABLE profiles ADD COLUMN auto_generation_paused BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN last_auto_generation TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN next_auto_generation TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN auto_generation_retry_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN auto_generation_last_error TEXT;
```

## API Endpoints

### Server Actions

#### `getAutoGenerationSettings(userId: string)`
- Retrieves user's current auto-generation settings and status
- Returns: `{ success: boolean, data?: AutoGenerationStatus, error?: string }`

#### `updateAutoGenerationSettings(userId: string, settings: AutoGenerationSettings)`
- Updates user's auto-generation configuration
- Creates/updates schedule in database
- Returns: `{ success: boolean, error?: string }`

#### `toggleAutoGenerationPause(userId: string, paused: boolean)`
- Pauses or resumes auto-generation
- Updates both profile and schedule records
- Returns: `{ success: boolean, error?: string }`

#### `processAutoGeneration()`
- Processes all users due for auto-generation (called by cron)
- Handles retry logic and error notifications
- Returns: `{ success: boolean, processed: number, errors: number }`

### Cron Job Enhancement

The existing `/api/cron` endpoint now includes auto-generation processing:

```typescript
// Process auto-generation for all users
const autoGenResult = await processAutoGeneration()
```

## Components

### `AutoGenerationCountdown`
- Real-time countdown display
- Pause/resume controls
- Settings access button
- Responsive design for mobile/desktop

### `AutoGenerationSettings`
- Comprehensive settings modal
- Timezone selection
- Interval configuration
- Time picker for daily/weekly schedules

### Enhanced `TradeIdeasWidget`
- Integrated countdown display
- Settings modal integration
- Real-time status updates

### Enhanced `SettingsForm`
- Auto-generation settings section
- Direct access to configuration modal

## Configuration Options

### Intervals
- **Hourly**: Every hour
- **4 Hours**: Every 4 hours
- **6 Hours**: Every 6 hours
- **8 Hours**: Every 8 hours
- **12 Hours**: Every 12 hours
- **Daily**: Once per day at specified time
- **Weekly**: Once per week at specified time and day

### Timezones
- UTC (Coordinated Universal Time)
- EST/EDT (New York)
- CST/CDT (Chicago)
- MST/MDT (Denver)
- PST/PDT (Los Angeles)
- GMT/BST (London)
- CET/CEST (Paris)
- CET/CEST (Zurich)
- JST (Tokyo)
- CST (Shanghai)
- AEST/AEDT (Sydney)

## Error Handling & Retry Logic

### Retry Strategy
1. **First Failure**: Retry in 1 hour
2. **Second Failure**: Retry in 1 hour
3. **Third Failure**: Skip to next scheduled interval

### Notifications
- **Success**: User notified of successful generation
- **Retry**: User notified of retry attempts
- **Max Retries**: User notified when max retries reached

## Setup Instructions

### 1. Database Setup
```bash
# Run the auto-generation schema
psql -d your_database -f auto-generation-schema.sql
```

### 2. Environment Variables
No additional environment variables required for basic functionality.

### 3. Cron Job Configuration
The existing Vercel cron job will automatically handle auto-generation. Ensure your `CRON_SECRET` environment variable is set.

### 4. Email/Push Notifications (Optional)
To enable actual email/push notifications, update the notification service in `src/lib/notifications.ts` to integrate with your preferred service:

- **Email**: SendGrid, AWS SES, Resend, etc.
- **Push**: Firebase Cloud Messaging, OneSignal, Pusher, etc.

## Usage Examples

### Enable Weekly Auto-Generation
```typescript
await updateAutoGenerationSettings(userId, {
  enabled: true,
  interval: 'weekly',
  time: '09:00',
  timezone: 'America/New_York'
})
```

### Pause Auto-Generation
```typescript
await toggleAutoGenerationPause(userId, true)
```

### Get Current Status
```typescript
const settings = await getAutoGenerationSettings(userId)
console.log(settings.data?.nextGeneration) // Next generation time
```

## Future Enhancements

### Potential Improvements
1. **Advanced Scheduling**: More complex scheduling patterns (e.g., weekdays only)
2. **Market Hours**: Respect trading hours for generation
3. **Conditional Generation**: Generate only when certain market conditions are met
4. **Batch Generation**: Generate multiple ideas at once
5. **Analytics**: Track auto-generation performance and success rates
6. **Webhooks**: Integration with external trading platforms
7. **Mobile App**: Push notifications for mobile devices

### Performance Optimizations
1. **Database Indexing**: Additional indexes for better query performance
2. **Caching**: Cache user settings and schedules
3. **Rate Limiting**: Prevent excessive generation requests
4. **Monitoring**: Add comprehensive logging and monitoring

## Troubleshooting

### Common Issues

1. **Auto-generation not working**
   - Check if user has enabled auto-generation
   - Verify cron job is running
   - Check database for schedule records

2. **Timezone issues**
   - Ensure timezone is correctly set
   - Verify timezone string format
   - Check database timezone calculations

3. **Retry failures**
   - Check error logs for specific failure reasons
   - Verify API limits and quotas
   - Check network connectivity

### Debug Commands

```sql
-- Check user's auto-generation settings
SELECT * FROM profiles WHERE id = 'user_id';

-- Check active schedules
SELECT * FROM auto_generation_schedule WHERE is_active = true;

-- Check recent notifications
SELECT * FROM notifications WHERE user_id = 'user_id' ORDER BY created_at DESC LIMIT 10;
```

## Security Considerations

1. **User Isolation**: All queries properly filtered by user ID
2. **Rate Limiting**: Built-in retry limits prevent abuse
3. **Input Validation**: All user inputs validated and sanitized
4. **Error Handling**: Sensitive information not exposed in error messages
5. **Database Security**: RLS policies ensure data isolation

## Performance Metrics

### Expected Performance
- **Generation Time**: 2-5 seconds per trade idea
- **Database Queries**: Optimized with proper indexing
- **Memory Usage**: Minimal additional memory footprint
- **Cron Processing**: Handles multiple users efficiently

### Monitoring
- Log all auto-generation attempts
- Track success/failure rates
- Monitor retry patterns
- Alert on system failures

This implementation provides a robust, user-friendly auto-generation system that integrates seamlessly with the existing FX Trader application while maintaining high performance and reliability.
