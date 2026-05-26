import { supabase } from './supabaseClient'

/* =========================
   SPONSOR ADS
========================= */

export async function createSponsorAd(adData) {
  const { data, error } = await supabase
    .from('sponsor_ads')
    .insert([adData])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSponsorAds() {
  const { data, error } = await supabase
    .from('sponsor_ads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getActiveSponsorAds() {
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('sponsor_ads')
    .select('*')
    .eq('status', 'active')
    .or(`start_date.is.null,start_date.lte.${today}`)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function updateSponsorAd(adId, updates) {
  const { data, error } = await supabase
    .from('sponsor_ads')
    .update(updates)
    .eq('id', adId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSponsorAd(adId) {
  const { error } = await supabase
    .from('sponsor_ads')
    .delete()
    .eq('id', adId)

  if (error) throw error
  return true
}

/* =========================
   DAILY SNAPSHOTS
========================= */

export async function getDailySnapshots() {
  const { data, error } = await supabase
    .from('daily_snapshots')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createDailySnapshot(snapshotData) {
  const { data, error } = await supabase
    .from('daily_snapshots')
    .insert([snapshotData])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateDailySnapshot(snapshotId, updates) {
  const { data, error } = await supabase
    .from('daily_snapshots')
    .update(updates)
    .eq('id', snapshotId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteDailySnapshot(snapshotId) {
  const { error } = await supabase
    .from('daily_snapshots')
    .delete()
    .eq('id', snapshotId)

  if (error) throw error
  return true
}

export async function getTodaySnapshot() {
  const today = new Date()
  const date = today.toISOString().slice(0, 10)
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })

  const { data, error } = await supabase
    .from('daily_snapshots')
    .select('*')
    .eq('status', 'active')
    .or(`event_date.eq.${date},day_name.eq.${dayName},event_date.is.null`)
    .order('event_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error
  return data?.[0] || null
}

/* =========================
   NEWS ARTICLES
========================= */

export async function createNewsArticle(newsData) {
  const { data, error } = await supabase
    .from('news_articles')
    .insert([newsData])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getNewsArticles() {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getLatestNewsArticles(limit = 3) {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getPublishedNewsArticles() {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function updateNewsArticle(newsId, updates) {
  const { data, error } = await supabase
    .from('news_articles')
    .update(updates)
    .eq('id', newsId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteNewsArticle(newsId) {
  const { error } = await supabase
    .from('news_articles')
    .delete()
    .eq('id', newsId)

  if (error) throw error
  return true
}