'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUserPrompts(userId: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_prompts')
      .select('*')
      .eq('user_id', userId)
      .order('version', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error getting user prompts:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }
  }
}

export async function getActivePrompt(userId: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_prompts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return { success: true, data: data || null }
  } catch (error) {
    console.error('Error getting active prompt:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }
  }
}

export async function createPrompt(userId: string, title: string, promptText: string) {
  try {
    const supabase = await createClient()
    
    // Get the highest version number for this user
    const { data: existingPrompts } = await supabase
      .from('user_prompts')
      .select('version')
      .eq('user_id', userId)
      .order('version', { ascending: false })
      .limit(1)

    const nextVersion = existingPrompts && existingPrompts.length > 0 
      ? (existingPrompts[0].version || 0) + 1 
      : 1

    // Deactivate all existing prompts
    await supabase
      .from('user_prompts')
      .update({ is_active: false })
      .eq('user_id', userId)

    // Insert new prompt
    const { data, error } = await supabase
      .from('user_prompts')
      .insert({
        user_id: userId,
        version: nextVersion,
        title,
        prompt_text: promptText,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error creating prompt:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function updatePrompt(promptId: string, title: string, promptText: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_prompts')
      .update({
        title,
        prompt_text: promptText,
      })
      .eq('id', promptId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error updating prompt:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function setActivePrompt(userId: string, promptId: string) {
  try {
    const supabase = await createClient()
    
    // Deactivate all prompts for this user
    await supabase
      .from('user_prompts')
      .update({ is_active: false })
      .eq('user_id', userId)

    // Activate the selected prompt
    const { data, error } = await supabase
      .from('user_prompts')
      .update({ is_active: true })
      .eq('id', promptId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error setting active prompt:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}






