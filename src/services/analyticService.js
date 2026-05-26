import { supabase } from './supabaseClient'

const getUserAgent = () => {
  if (typeof navigator === 'undefined') return null
  return navigator.userAgent || null
}

const getPagePath = () => {
  if (typeof window === 'undefined') return null
  return window.location.pathname + window.location.search
}

export const trackShare = async ({
  pollId = null,
  platform = 'unknown',
  shareUrl = '',
  userId = null,
  userEmail = null,
} = {}) => {
  try {
    const { error } = await supabase.from('poll_shares').insert({
      poll_id: pollId,
      platform,
      share_url: shareUrl,
      page_path: getPagePath(),
      user_id: userId,
      user_email: userEmail,
      user_agent: getUserAgent(),
    })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('trackShare error:', error.message)
    return { success: false, error }
  }
}

export const trackTrafficSource = async ({
  pollId = null,
  source = null,
  medium = null,
  campaign = null,
  referrer = null,
  userId = null,
  userEmail = null,
} = {}) => {
  try {
    const { error } = await supabase.from('traffic_sources').insert({
      poll_id: pollId,
      source,
      medium,
      campaign,
      referrer,
      page_path: getPagePath(),
      user_id: userId,
      user_email: userEmail,
      user_agent: getUserAgent(),
    })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('trackTrafficSource error:', error.message)
    return { success: false, error }
  }
}

export const subscribeToNewsletter = async ({
  email,
  source = 'footer',
} = {}) => {
  try {
    if (!email || !email.includes('@')) {
      return {
        success: false,
        message: 'Please enter a valid email address.',
      }
    }

    const normalizedEmail = email.trim().toLowerCase()

    const { error } = await supabase.from('newsletter_subscribers').upsert(
      {
        email: normalizedEmail,
        source,
        status: 'active',
      },
      {
        onConflict: 'email',
      }
    )

    if (error) throw error

    return {
      success: true,
      message: 'You are subscribed.',
    }
  } catch (error) {
    console.error('subscribeToNewsletter error:', error.message)

    return {
      success: false,
      message: 'Subscription failed. Please try again.',
      error,
    }
  }
}

export const getBasicAnalytics = async () => {
  try {
    const [
      { data: shares, error: sharesError },
      { data: sources, error: sourcesError },
      { data: subscribers, error: subscribersError },
    ] = await Promise.all([
      supabase.from('poll_shares').select('*'),
      supabase.from('traffic_sources').select('*'),
      supabase.from('newsletter_subscribers').select('*'),
    ])

    if (sharesError) throw sharesError
    if (sourcesError) throw sourcesError
    if (subscribersError) throw subscribersError

    return {
      success: true,
      shares: shares || [],
      sources: sources || [],
      subscribers: subscribers || [],
    }
  } catch (error) {
    console.error('getBasicAnalytics error:', error.message)

    return {
      success: false,
      shares: [],
      sources: [],
      subscribers: [],
      error,
    }
  }
}