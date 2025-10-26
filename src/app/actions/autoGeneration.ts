'use server'

import { createClient } from '@/lib/supabase/server'
import { generateTradeIdea } from './generateTradeIdeas'
import { sendNotification, getUserNotificationPreferences } from '@/lib/notifications'

/**
 * Calculate next trigger time for auto-generation
 */
function calculateNextTriggerTime(
  interval: string,
  scheduledTime?: string,
  timezone: string = 'UTC'
): Date {
  const now = new Date()
  
  // Convert to user's timezone for calculations
  const userTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }))
  
  switch (interval) {
    case 'hourly':
      return new Date(userTime.getTime() + 60 * 60 * 1000)
    
    case '4hours':
      return new Date(userTime.getTime() + 4 * 60 * 60 * 1000)
    
    case '6hours':
      return new Date(userTime.getTime() + 6 * 60 * 60 * 1000)
    
    case '8hours':
      return new Date(userTime.getTime() + 8 * 60 * 60 * 1000)
    
    case '12hours':
      return new Date(userTime.getTime() + 12 * 60 * 60 * 1000)
    
    case 'daily':
      if (scheduledTime) {
        const [hours, minutes] = scheduledTime.split(':').map(Number)
        const nextRun = new Date(userTime)
        nextRun.setHours(hours, minutes, 0, 0)
        
        // If the time has passed today, schedule for tomorrow
        if (nextRun <= userTime) {
          nextRun.setDate(nextRun.getDate() + 1)
        }
        
        return nextRun
      }
      return new Date(userTime.getTime() + 24 * 60 * 60 * 1000)
    
    case 'weekly':
      if (scheduledTime) {
        const [hours, minutes] = scheduledTime.split(':').map(Number)
        const nextRun = new Date(userTime)
        nextRun.setHours(hours, minutes, 0, 0)
        
        // Find next occurrence of the same day of week
        const currentDay = nextRun.getDay()
        const targetDay = nextRun.getDay() // Same day of week
        
        // If it's the same day but time has passed, or if it's a different day
        if (nextRun <= userTime || nextRun.getDay() !== targetDay) {
          const daysUntilNext = (7 - (userTime.getDay() - targetDay)) % 7
          nextRun.setDate(nextRun.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext))
        }
        
        return nextRun
      }
      return new Date(userTime.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    default:
      // Default to weekly
      return new Date(userTime.getTime() + 7 * 24 * 60 * 60 * 1000)
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

    return {
      success: true,
      data: {
        enabled: profile.auto_generation_enabled || false,
        interval: profile.auto_generation_interval || 'weekly',
        time: profile.auto_generation_time || undefined,
        timezone: profile.auto_generation_timezone || 'UTC',
        paused: profile.auto_generation_paused || false,
        nextGeneration: profile.next_auto_generation || undefined,
        lastGeneration: profile.last_auto_generation || undefined,
        retryCount: profile.auto_generation_retry_count || 0,
        lastError: profile.auto_generation_last_error || undefined
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
        settings.timezone
      )

      // Create new schedule
      const { error: scheduleError } = await supabase
        .from('auto_generation_schedule')
        .insert({
          user_id: userId,
          interval_type: settings.interval,
          scheduled_time: settings.time || null,
          timezone: settings.timezone,
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
      auto_generation_timezone: settings.timezone,
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
      .select(`
        *,
        profiles!inner(
          id,
          username,
          email,
          auto_generation_retry_count,
          auto_generation_last_error
        )
      `)
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
          const userProfile = schedule.profiles
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
  
  // Calculate next trigger time
  const nextTrigger = calculateNextTriggerTime(
    profile.auto_generation_interval || 'daily',
    profile.auto_generation_time || undefined,
    profile.auto_generation_timezone || 'UTC'
  )
  
  // Update profile
  await supabase
    .from('profiles')
    .update({
      next_auto_generation: nextTrigger.toISOString(),
      last_auto_generation: new Date().toISOString(),
      auto_generation_retry_count: 0,
      auto_generation_last_error: null
    })
    .eq('id', userId)
  
  // Update schedule
  await supabase
    .from('auto_generation_schedule')
    .update({
      next_trigger: nextTrigger.toISOString(),
      last_triggered: new Date().toISOString(),
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
    const prefs = await getUserNotificationPreferences(userId)
    if (prefs.email) {
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
    const prefs = await getUserNotificationPreferences(userId)
    if (prefs.email) {
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
