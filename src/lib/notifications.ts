/**
 * Notification service for auto-generation alerts
 * Configured to use Resend for email delivery (optional)
 */

// Simple Resend client stub (install resend package to enable email notifications)
type ResendClient = {
  emails: {
    send: (options: { from: string; to: string[]; subject: string; html: string }) => Promise<{ data?: { id: string }; error?: Error }>
  }
}

// Initialize Resend (optional - install 'resend' package and set RESEND_API_KEY)
// To enable email notifications, install: npm install resend
const getResend = (): ResendClient | null => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY environment variable is not set - email notifications will be disabled')
    return null
  }
  
  // Resend package is optional - if not installed, notifications will be skipped
  // Install with: npm install resend
  console.warn('Resend package not installed - email notifications will be disabled. Install with: npm install resend')
  return null
}

export interface NotificationData {
  userId: string
  type: 'auto_generation_success' | 'auto_generation_error' | 'auto_generation_retry'
  title: string
  message: string
  email?: string
}

/**
 * Send email notification using Resend
 */
export async function sendEmailNotification(data: NotificationData): Promise<boolean> {
  try {
    if (!data.email) {
      console.log('No email address provided for notification')
      return false
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured - skipping email notification')
      return false
    }

    const resend = getResend()
    if (!resend) {
      console.warn('Resend client not initialized - skipping email notification')
      return false
    }

    // Create email template based on notification type
    const emailTemplate = getEmailTemplate(data)

    const { data: emailData, error } = await resend.emails.send({
      from: 'ZacFX Trader <onboarding@resend.dev>', // Replace with your verified domain
      to: [data.email],
      subject: data.title,
      html: emailTemplate,
    })

    if (error) {
      console.error('Failed to send email via Resend:', error)
      return false
    }

    console.log('Email sent successfully:', emailData?.id)
    return true
  } catch (error) {
    console.error('Failed to send email notification:', error)
    return false
  }
}

/**
 * Generate HTML email template based on notification type
 */
function getEmailTemplate(data: NotificationData): string {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">ZacFX Trader</h1>
        <p style="color: #e0e0e0; margin: 10px 0 0 0;">AI-Powered FX Trading Assistant</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #2c3e50; margin-top: 0;">${data.title}</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">${data.message}</p>
        
        ${getNotificationSpecificContent(data)}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center;">
          <p style="color: #6c757d; font-size: 14px; margin: 0;">
            This is an automated notification from ZacFX Trader.<br>
            You can manage your notification preferences in your account settings.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return baseTemplate
}

/**
 * Get notification-specific content based on type
 */
function getNotificationSpecificContent(data: NotificationData): string {
  switch (data.type) {
    case 'auto_generation_success':
      return `
        <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #155724; font-weight: bold;">✅ New Trade Idea Generated Successfully!</p>
          <p style="margin: 10px 0 0 0; color: #155724;">A new AI-generated trade idea is now available in your dashboard.</p>
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            View Trade Ideas
          </a>
        </div>
      `
    
    case 'auto_generation_error':
      return `
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #721c24; font-weight: bold;">⚠️ Auto-Generation Failed</p>
          <p style="margin: 10px 0 0 0; color: #721c24;">We encountered an issue generating your trade idea. Our system will retry automatically.</p>
        </div>
      `
    
    case 'auto_generation_retry':
      return `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-weight: bold;">🔄 Retry in Progress</p>
          <p style="margin: 10px 0 0 0; color: #856404;">We're retrying the auto-generation process. You'll be notified once it's complete.</p>
        </div>
      `
    
    default:
      return ''
  }
}

/**
 * Send push notification (placeholder implementation)
 * In production, integrate with services like Firebase Cloud Messaging, OneSignal, or Pusher
 */
export async function sendPushNotification(data: NotificationData): Promise<boolean> {
  try {
    // This is a placeholder - in production you would:
    // 1. Use a proper push notification service
    // 2. Handle device tokens and user preferences
    // 3. Create proper notification payloads
    
    console.log('Push notification would be sent:', {
      userId: data.userId,
      title: data.title,
      body: data.message,
      type: data.type
    })
    
    // For now, just log the notification
    // In production, replace this with actual push notification logic
    return true
  } catch (error) {
    console.error('Failed to send push notification:', error)
    return false
  }
}

/**
 * Send notification via all enabled channels
 */
export async function sendNotification(data: NotificationData): Promise<{
  email: boolean
  push: boolean
}> {
  const results = await Promise.allSettled([
    sendEmailNotification(data),
    sendPushNotification(data)
  ])
  
  return {
    email: results[0].status === 'fulfilled' ? results[0].value : false,
    push: results[1].status === 'fulfilled' ? results[1].value : false
  }
}

/**
 * Get user's notification preferences
 */
export async function getUserNotificationPreferences(): Promise<{
  email: boolean
  push: boolean
  emailAddress?: string
}> {
  // In production, fetch from database
  // For now, return default preferences
  return {
    email: true,
    push: false,
    emailAddress: undefined // Would be fetched from user profile
  }
}
