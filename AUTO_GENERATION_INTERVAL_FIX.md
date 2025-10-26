# Auto-Generation Interval Fix

## Issue
When auto-generation creates a new trade idea, the screen stays stuck showing "Generating..." and the next trigger time is not properly calculated. The next trigger should be based on the **last generation time + interval** (e.g., 7 days from when it was last generated for weekly intervals), not from the current time.

## Root Cause
Two issues were identified:
1. **Weekly calculation bug**: The weekly interval calculation with scheduled_time had incorrect logic that could produce incorrect next trigger times
2. **Duplicate triggers**: The countdown component was triggering generation multiple times instead of once per countdown cycle
3. **State not resetting**: After generation completed, the countdown component didn't properly reset the "Generating..." state

## Solution

### 1. Fixed interval calculations with scheduled_time
- **Daily**: If scheduled time has passed today, schedule for tomorrow; otherwise keep today
  - Example: Current time 3pm, scheduled 9am → Tomorrow 9am ✓
  - Example: Current time 3am, scheduled 9am → Today 9am ✓
- **Weekly**: If scheduled time has passed this week, schedule for next week; otherwise keep this week
  - Example: Monday 3pm, scheduled Monday 9am → Next Monday 9am ✓
  - Example: Monday 3am, scheduled Monday 9am → This Monday 9am ✓
- Fixed the buggy modulo arithmetic that was producing incorrect dates
- Added proper handling for timezone conversions ensuring scheduled times are always in the future

### 2. Updated `calculateNextTriggerTime` function
- Added `baseTime` parameter to allow specifying a different base time (not just current time)
- If `baseTime` is provided, it uses that for calculations
- If not provided, it defaults to current time (for initial setup)

### 3. Updated `updateNextGenerationTime` function
- Now uses the CURRENT generation time (right now) as the base for calculating next trigger
- Ensures intervals are correctly spaced from the moment of generation
- Example: If weekly interval and just generated now, next trigger is 7 days from now

### 4. Improved `AutoGenerationCountdown` component
- Replaced state-based `hasTriggered` with ref-based tracking to prevent duplicate triggers
- Uses `useRef` to track which nextGeneration value has already been processed
- Prevents calling `onGenerate()` multiple times for the same countdown cycle
- Added detection for when next generation time updates to reset the UI state

### 5. Added duplicate call prevention in `TradeIdeasWidget`
- Added `isAutoGenerating` state to prevent concurrent auto-generation calls
- Prevents the same generation from being triggered multiple times

## How It Works Now

1. **Initial Setup**: When user enables auto-generation, next trigger is calculated from current time + interval
2. **After Generation**: 
   - Trade idea is generated
   - `last_auto_generation` is updated to current time
   - Next trigger is calculated as: `last_auto_generation + interval`
   - For weekly: If generated on Monday, next trigger is 7 days later (next Monday)
3. **Countdown Display**:
   - Shows countdown to next trigger
   - When timer expires, triggers generation
   - After generation completes and settings reload, automatically switches to new countdown
   - No more stuck "Generating..." state

## Example Scenario

**Before (Buggy)**:
- Generation just completed on: Friday 2:00 PM  
- Next trigger calculated as: Friday 2:00 PM + 7 days = Next Friday
- ✅ Calculation is correct BUT screen stays stuck on "Generating..."
- ❌ Countdown doesn't update to show the new timer

**After (Fixed)**:
- Generation just completed on: Friday 2:00 PM  
- Next trigger calculated as: Friday 2:00 PM + 7 days = Next Friday
- ✅ Calculation is correct
- ✅ Screen immediately updates to show countdown
- ✅ Countdown properly displays "6d 23h 59m" (or similar)

## Testing
1. Enable auto-generation with weekly interval
2. Wait for or manually trigger generation
3. Verify next trigger is exactly 7 days from the generation time
4. Countdown should properly reset and show remaining time
5. Screen should not get stuck in "Generating..." state

