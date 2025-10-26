import { NextResponse } from 'next/server'
import { generateTradeIdea } from '@/app/actions/generateTradeIdeas'
import { sendNotification } from '@/lib/notifications'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    // Get the user ID from the request (you'll need to pass this)
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'userId parameter is required' 
      }, { status: 400 })
    }

    // Get user's email from profile
    const supabase = await createClient()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, username')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ 
        error: 'User profile not found' 
      }, { status: 404 })
    }

    if (!profile.email) {
      return NextResponse.json({ 
        error: 'User email not found' 
      }, { status: 404 })
    }

    // Generate a test trade idea
    console.log('Generating test trade idea for user:', userId)
    const result = await generateTradeIdea(userId)
    
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to generate trade idea: ' + result.error 
      }, { status: 500 })
    }

    // Send test email notification
    console.log('Sending test email to:', profile.email)
    const emailResult = await sendNotification({
      userId: userId,
      type: 'auto_generation_success',
      title: '🧪 Test Email - New Trade Idea Generated',
      message: `Hello ${profile.username || 'Trader'}! This is a test email to verify that auto-generation notifications are working correctly.`,
      email: profile.email
    })

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      tradeIdeaGenerated: result.success,
      emailSent: emailResult.email,
      emailAddress: profile.email,
      username: profile.username
    })

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
