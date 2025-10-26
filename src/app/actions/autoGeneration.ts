'use server'

import { createClient } from '@/lib/supabase/server'
import { generateTradeIdea } from './generateTradeIdeas'
import { sendNotification, getUserNotificationPreferences } from '@/lib/notifications'

// Helper function to convert timezone-aware dates
// For production, install: npm install date-fns-tz
function fromZonedTime(date: Date): Date {
  // Simple fallback - assumes the date is already in the correct timezone
  // In production, use: import { fromZonedTime } from 'date-fns-tz'
  console.warn('Using simplified timezone conversion. Install date-fns-tz for accurate timezone handling.')
  return date
}

/**
 * Calculate next trigger time for auto-generation
 */
function calculateNextTriggerTime(
  interval: string,
  scheduledTime?: string,
  timezone: string = 'Europe/Zurich',
  baseTime?: Date
): Date {
  const now = baseTime || new Date()
  
  // Helper to convert a datetime string representing a time in a specific timezone to UTC
  const timeInTimezoneToUtc = (dateStr: string): Date => {
    // Parse the date string as if it's in the timezone
    const dateInTz = new Date(dateStr)
    // Convert from the timezone to UTC
    return fromZonedTime(dateInTz)
  }
  
  switch (interval) {
    case 'hourly':
      return new Date(now.getTime() + 60 * 60 * 1000)
    
    case '4hours':
      return new Date(now.getTime() + 4 * 60 * 60 * 1000)
    
    case '6hours':
      return new Date(now.getTime() + 6 * 60 * 60 * 1000)
    
    case '8hours':
      return new Date(now.getTime() + 8 * 60 * 60 * 1000)
    
    case '12hours':
      return new Date(now.getTime() + 12 * 60 * 60 * 1000)
    
    case 'daily':
      if (scheduledTime) {
        const [hours, minutes] = scheduledTime.split(':').map(Number)
        
        // Get today's date in the target timezone
        const formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
        const dateStr = formatter.format(now)
        
        // Get the current time components in the target timezone
        const timeFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now)
        const [currentHour, currentMinute] = timeFormatter.split(':').map(Number)
        
        // Create date string for today at scheduled time
        const dateTimeStr = `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
        
        // Convert timezone-aware date string to UTC
        let scheduledUTC = timeInTimezoneToUtc(dateTimeStr)
        
        // Check if the scheduled time has already passed today in target timezone
        const schedulePassed = (hours < currentHour) || (hours === currentHour && minutes < currentMinute)
        
        if (schedulePassed) {
          scheduledUTC = new Date(scheduledUTC.getTime() + 24 * 60 * 60 * 1000)
        }
        
        return scheduledUTC
      }
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    case 'weekly':
      if (scheduledTime) {
        const [hours, minutes] = scheduledTime.split(':').map(Number)
        
        // Get today's date in the target timezone
        const formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
        const dateStr = formatter.format(now)
        
        // Get the current time components in the target timezone
        const timeFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now)
        const [currentHour, currentMinute] = timeFormatter.split(':').map(Number)
        
        // Create date string for today at scheduled time
        const dateTimeStr = `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
        
        // Convert timezone-aware date string to UTC
        let scheduledUTC = timeInTimezoneToUtc(dateTimeStr)
        
        // Check if the scheduled time has already passed today in target timezone
        const schedulePassed = (hours < currentHour) || (hours === currentHour && minutes < currentMinute)
        
        if (schedulePassed) {
          scheduledUTC = new Date(scheduledUTC.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
        
        return scheduledUTC
      }
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  }
}

export interface AutoGenerationSettings {
  enabled: boolean
  interval: string
  time?: string
  timezone: string
  paused?: boolean
}

export interface AutoGenerationStatus {
  enabled: boolean
  interval: string
  time?: string
  timezone: string
  paused: boolean
  nextGeneration?: string
  lastGeneration?: string
  retryCount: number
  lastError?: string
}

/**
 * Get user's auto-generation settings and status
 */
export async function getAutoGenerationSettings(userId: string): Promise<{
  success: boolean
  data?: AutoGenerationStatus
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        auto_generation_enabled,
        auto_generation_interval,
        auto_generation_time,
        auto_generation_timezone,
        auto_generation_paused,
        last_auto_generation,
        next_auto_generation,
        auto_generation_retry_count,
        auto_generation_last_error
      `)
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching auto-generation settings:', error)
      return { success: false, error: error.message }
    }

    if (!profile) {
      return { success: false, error: 'User profile not found' }
    }

    // Type assertion to help TypeScript understand the profile structure
    const profileData = profile as {
      auto_generation_enabled: boolean | null
      auto_generation_interval: string | null
      auto_generation_time: string | null
      auto_generation_timezone: string | null
      auto_generation_paused: boolean | null
      last_auto_generation: string | null
      next_auto_generation: string | null
      auto_generation_retry_count: number | null
      auto_generation_last_error: string | null
    }

    return {
      success: true,
      data: {
        enabled: profileData.auto_generation_enabled || false,
        interval: profileData.auto_generation_interval || 'weekly',
        time: profileData.auto_generation_time || undefined,
        timezone: profileData.auto_generation_timezone || 'Europe/Zurich',
        paused: profileData.auto_generation_paused || false,
        nextGeneration: profileData.next_auto_generation || undefined,
        lastGeneration: profileData.last_auto_generation || undefined,
        retryCount: profileData.auto_generation_retry_count || 0,
        lastError: profileData.auto_generation_last_error || undefined
      }
    }
  } catch (error) {
    console.error('Error in getAutoGenerationSettings:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Update user's auto-generation settings
 */
export async function updateAutoGenerationSettings(
  userId: string, 
  settings: AutoGenerationSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    let nextTrigger: Date | null = null

    // If enabling auto-generation, create or update the schedule
    // Force timezone to Europe/Zurich
    const timezone = 'Europe/Zurich'
    
    if (settings.enabled) {
      // First, disable any existing schedules
      await supabase
        .from('auto_generation_schedule')
        .update({ is_active: false })
        .eq('user_id', userId)

      // Calculate next trigger time manually
      nextTrigger = calculateNextTriggerTime(
        settings.interval,
        settings.time,
        timezone
      )

      // Create new schedule
      const { error: scheduleError } = await supabase
        .from('auto_generation_schedule')
        .insert({
          user_id: userId,
          interval_type: settings.interval,
          scheduled_time: settings.time || null,
          timezone: timezone,
          is_active: true,
          is_paused: settings.paused || false,
          next_trigger: nextTrigger.toISOString()
        })

      if (scheduleError) {
        console.error('Error creating auto-generation schedule:', scheduleError)
        return { success: false, error: scheduleError.message }
      }
    } else {
      // Disable all schedules
      await supabase
        .from('auto_generation_schedule')
        .update({ is_active: false })
        .eq('user_id', userId)
    }

    // Update profile
    const updateData: {
      auto_generation_enabled: boolean
      auto_generation_interval: string
      auto_generation_time: string | null
      auto_generation_timezone: string
      auto_generation_paused: boolean
      next_auto_generation?: string
    } = {
      auto_generation_enabled: settings.enabled,
      auto_generation_interval: settings.interval,
      auto_generation_time: settings.time || null,
      auto_generation_timezone: timezone,
      auto_generation_paused: settings.paused || false
    }

    // If enabling, also set the next generation time
    if (settings.enabled && nextTrigger) {
      updateData.next_auto_generation = nextTrigger.toISOString()
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return { success: false, error: profileError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in updateAutoGenerationSettings:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Pause or resume auto-generation
 */
export async function toggleAutoGenerationPause(
  userId: string, 
  paused: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ auto_generation_paused: paused })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile pause status:', profileError)
      return { success: false, error: profileError.message }
    }

    // Update active schedule
    const { error: scheduleError } = await supabase
      .from('auto_generation_schedule')
      .update({ is_paused: paused })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (scheduleError) {
      console.error('Error updating schedule pause status:', scheduleError)
      return { success: false, error: scheduleError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in toggleAutoGenerationPause:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Process auto-generation for all users (called by cron job)
 */
export async function processAutoGeneration(): Promise<{
  success: boolean
  processed: number
  errors: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    // Get all users with active auto-generation that are due
    const { data: schedules, error: scheduleError } = await supabase
      .from('auto_generation_schedule')
      .select('*')
      .eq('is_active', true)
      .eq('is_paused', false)
      .lte('next_trigger', new Date().toISOString())

    if (scheduleError) {
      console.error('Error fetching auto-generation schedules:', scheduleError)
      return { success: false, processed: 0, errors: 0, error: scheduleError.message }
    }

    let processed = 0
    let errors = 0

    for (const schedule of schedules || []) {
      try {
        if (!schedule.user_id) {
          console.error('Schedule has no user_id, skipping')
          continue
        }
        
        console.log(`Processing auto-generation for user ${schedule.user_id}`)
        
        // Attempt to generate trade idea
        const result = await generateTradeIdea(schedule.user_id)
        
        if (result.success) {
          // Success - update next generation time
          await updateNextGenerationTime(schedule.user_id)
          
          // Extract trade idea details
          const tradeIdea = result.data
          const direction = tradeIdea?.direction || 'N/A'
          const confidence = tradeIdea?.confidence || 0
          const currencyPair = tradeIdea?.currency_pair || 'USD/CHF'
          
          // Create success notification with trade details
          await createNotification(schedule.user_id, {
            type: 'auto_generation_success',
            title: 'New Trade Idea Generated',
            message: `${direction} ${currencyPair} with ${Math.round(confidence)}% confidence`,
            metadata: {
              direction,
              confidence,
              currencyPair,
              tradeIdeaId: tradeIdea?.id
            }
          })
          
          // Send external notifications
          // Get user profile for email
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', schedule.user_id)
            .single()
          
          if (userProfile?.email) {
            await sendNotification({
              userId: schedule.user_id,
              type: 'auto_generation_success',
              title: 'New Trade Idea Generated',
              message: `${direction} ${currencyPair} with ${Math.round(confidence)}% confidence`,
              email: userProfile.email
            })
          }
          
          processed++
          console.log(`Successfully generated trade idea for user ${schedule.user_id}`)
        } else {
          // Handle failure with retry logic
          if (schedule.user_id) {
            await handleGenerationFailure(schedule.user_id, result.error || 'Unknown error')
          }
          errors++
        }
      } catch (error) {
        console.error(`Error processing auto-generation for user ${schedule.user_id}:`, error)
        if (schedule.user_id) {
          await handleGenerationFailure(schedule.user_id, error instanceof Error ? error.message : 'Unknown error')
        }
        errors++
      }
    }

    return { success: true, processed, errors }
  } catch (error) {
    console.error('Error in processAutoGeneration:', error)
    return { 
      success: false, 
      processed: 0, 
      errors: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Trigger auto-generation for a specific user (called from UI)
 */
export async function triggerAutoGeneration(userId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    console.log(`Triggering auto-generation for user ${userId}`)
    
    // Get user's auto-generation settings
    const settingsResult = await getAutoGenerationSettings(userId)
    if (!settingsResult.success || !settingsResult.data) {
      return { success: false, error: 'Failed to get auto-generation settings' }
    }
    
    const settings = settingsResult.data
    
    // Check if auto-generation is enabled and not paused
    if (!settings.enabled) {
      return { success: false, error: 'Auto-generation is not enabled' }
    }
    
    if (settings.paused) {
      return { success: false, error: 'Auto-generation is paused' }
    }
    
    // Generate trade idea
    const result = await generateTradeIdea(userId)
    
    if (result.success) {
      // Update next generation time
      await updateNextGenerationTime(userId)
      
      // Get user profile for notification
      const supabase = await createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, username')
        .eq('id', userId)
        .single()
      
      // Extract trade idea details
      const tradeIdea = result.data
      const direction = tradeIdea?.direction || 'N/A'
      const confidence = tradeIdea?.confidence || 0
      const currencyPair = tradeIdea?.currency_pair || 'USD/CHF'
      
      // Create success notification with trade details
      await createNotification(userId, {
        type: 'auto_generation_success',
        title: 'New Trade Idea Generated',
        message: `${direction} ${currencyPair} with ${Math.round(confidence)}% confidence`,
        metadata: {
          direction,
          confidence,
          currencyPair,
          tradeIdeaId: tradeIdea?.id
        }
      })
      
      // Send email notification if user has email
      if (profile?.email) {
        await sendNotification({
          userId,
          type: 'auto_generation_success',
          title: 'New Trade Idea Generated',
          message: `${direction} ${currencyPair} with ${Math.round(confidence)}% confidence`,
          email: profile.email
        })
      }
      
      console.log(`Successfully triggered auto-generation for user ${userId}`)
      return { success: true }
    } else {
      // Handle failure
      await handleGenerationFailure(userId, result.error || 'Unknown error')
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('Error in triggerAutoGeneration:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await handleGenerationFailure(userId, errorMessage)
    return { 
      success: false, 
      error: errorMessage
    }
  }
}

/**
 * Update next generation time after successful generation
 */
async function updateNextGenerationTime(userId: string): Promise<void> {
  const supabase = await createClient()
  
  // Get current settings
  const { data: profile } = await supabase
    .from('profiles')
    .select('auto_generation_interval, auto_generation_time, auto_generation_timezone')
    .eq('id', userId)
    .single()
  
  if (!profile) {
    console.error('Profile not found for user:', userId)
    return
  }
  
  // Current time is when this generation just completed
  const now = new Date()
  
  // Calculate next trigger time based on the current generation time + interval
  // This ensures intervals are correctly spaced (e.g., weekly = 7 days from now, not from last generation)
  const nextTrigger = calculateNextTriggerTime(
    profile.auto_generation_interval || 'daily',
    profile.auto_generation_time || undefined,
    profile.auto_generation_timezone || 'Europe/Zurich',
    now // Use current time as base for next generation
  )
  
  // Update profile
  await supabase
    .from('profiles')
    .update({
      next_auto_generation: nextTrigger.toISOString(),
      last_auto_generation: now.toISOString(),
      auto_generation_retry_count: 0,
      auto_generation_last_error: null
    })
    .eq('id', userId)
  
  // Update schedule
  await supabase
    .from('auto_generation_schedule')
    .update({
      next_trigger: nextTrigger.toISOString(),
      last_triggered: now.toISOString(),
      retry_count: 0,
      last_error: null
    })
    .eq('user_id', userId)
    .eq('is_active', true)
}

/**
 * Handle generation failure with retry logic
 */
async function handleGenerationFailure(userId: string, errorMessage: string): Promise<void> {
  const supabase = await createClient()
  
  // Get current retry count
  const { data: profile } = await supabase
    .from('profiles')
    .select('auto_generation_retry_count')
    .eq('id', userId)
    .single()
  
  const currentRetryCount = profile?.auto_generation_retry_count || 0
  const maxRetries = 2
  
  if (currentRetryCount < maxRetries) {
    // Retry in 1 hour
    const retryTime = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    
    await supabase
      .from('profiles')
      .update({
        auto_generation_retry_count: currentRetryCount + 1,
        auto_generation_last_error: errorMessage,
        next_auto_generation: retryTime.toISOString()
      })
      .eq('id', userId)
    
    await supabase
      .from('auto_generation_schedule')
      .update({
        retry_count: currentRetryCount + 1,
        last_error: errorMessage,
        next_trigger: retryTime.toISOString()
      })
      .eq('user_id', userId)
      .eq('is_active', true)
    
    // Create retry notification
    await createNotification(userId, {
      type: 'auto_generation_error',
      title: 'Auto-Generation Failed',
      message: `Auto-generation failed but will retry in 1 hour. (Attempt ${currentRetryCount + 1}/${maxRetries})`
    })
    
    // Send external retry notification
    const prefs = await getUserNotificationPreferences()
    if (prefs.email && prefs.emailAddress) {
      await sendNotification({
        userId,
        type: 'auto_generation_retry',
        title: 'Auto-Generation Retry',
        message: `Auto-generation failed but will retry in 1 hour. (Attempt ${currentRetryCount + 1}/${maxRetries})`,
        email: prefs.emailAddress
      })
    }
  } else {
    // Max retries reached - schedule for next normal interval
    await updateNextGenerationTime(userId)
    
    // Create max retries notification
    await createNotification(userId, {
      type: 'auto_generation_error',
      title: 'Auto-Generation Failed',
      message: 'Auto-generation failed after 2 retries. Next attempt scheduled for the next interval.'
    })
    
    // Send external max retries notification
    const prefs = await getUserNotificationPreferences()
    if (prefs.email && prefs.emailAddress) {
      await sendNotification({
        userId,
        type: 'auto_generation_error',
        title: 'Auto-Generation Failed',
        message: 'Auto-generation failed after 2 retries. Next attempt scheduled for the next interval.',
        email: prefs.emailAddress
      })
    }
  }
}

/**
 * Create a notification for the user
 */
async function createNotification(
  userId: string, 
  notification: {
    type: string
    title: string
    message: string
    metadata?: Record<string, unknown>
  }
): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      metadata: notification.metadata || null
    })
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string): Promise<{
  success: boolean
  data?: Array<{
    id: string
    type: string
    title: string
    message: string
    isRead: boolean
    createdAt: string
    metadata?: Record<string, unknown>
  }>
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('id, type, title, message, is_read, created_at, metadata')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching notifications:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: notifications?.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.is_read ?? false,
        createdAt: n.created_at ?? new Date().toISOString(),
        metadata: n.metadata as Record<string, unknown> | undefined
      })) || []
    }
  } catch (error) {
    console.error('Error in getUserNotifications:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string, 
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Delete a single notification
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting notification:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteNotification:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Clear all notifications for a user
 */
export async function clearAllNotifications(
  userId: string
): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    const supabase = await createClient()
    
    // First get count of notifications to be deleted
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    // Delete all notifications for this user
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error clearing all notifications:', error)
      return { success: false, error: error.message }
    }

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error('Error in clearAllNotifications:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
