import { supabase } from './supabaseClient'

export async function castVote({ pollId, optionId }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError

  if (!user) {
    throw new Error('You must be logged in to vote.')
  }

  const { data, error } = await supabase
    .from('votes')
    .insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already voted on this poll.')
    }

    throw error
  }

  return data
}