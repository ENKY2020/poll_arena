import { supabase } from './supabaseClient'

const pollSelect = `
  id,
  question,
  category,
  status,
  created_at,
  poll_options (
    id,
    option_text,
    image_url,
    position,
    votes (
      id
    )
  )
`

export async function createPoll({ question, category, status, options }) {
  const cleanOptions = options
    .map((option) => ({
      text: option.text?.trim() || '',
      image_url: option.image_url || '',
    }))
    .filter((option) => option.text)

  if (!question.trim()) throw new Error('Poll question is required.')
  if (cleanOptions.length < 2) throw new Error('A poll needs at least 2 options.')

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({
      question: question.trim(),
      category,
      status,
    })
    .select()
    .single()

  if (pollError) throw pollError

  const optionRows = cleanOptions.map((option, index) => ({
    poll_id: poll.id,
    option_text: option.text,
    image_url: option.image_url,
    position: index + 1,
  }))

  const { error: optionsError } = await supabase
    .from('poll_options')
    .insert(optionRows)

  if (optionsError) throw optionsError

  return poll
}

export async function getPolls() {
  const { data, error } = await supabase
    .from('polls')
    .select(pollSelect)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data || []
}

export async function getActivePolls() {
  const { data, error } = await supabase
    .from('polls')
    .select(pollSelect)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data || []
}

export async function updatePollStatus(pollId, status) {
  const { data, error } = await supabase
    .from('polls')
    .update({ status })
    .eq('id', pollId)
    .select()

  if (error) throw error

  if (!data || data.length === 0) {
    throw new Error('Poll status was not updated. Check RLS update policy.')
  }

  return data[0]
}