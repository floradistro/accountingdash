import { createClient } from '@/lib/supabase/server'

export async function getUserStore() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return { error: 'Not authenticated', status: 401 }
  }

  // Try to find user entries by auth_user_id first
  let { data: users } = await supabase
    .from('users')
    .select('id, store_id, email, role')
    .eq('auth_user_id', authUser.id)

  // If not found, try by email
  if ((!users || users.length === 0) && authUser.email) {
    const { data: usersByEmail } = await supabase
      .from('users')
      .select('id, store_id, email, role')
      .eq('email', authUser.email)

    users = usersByEmail
  }

  if (!users || users.length === 0) {
    console.error('No user found for auth:', authUser.id, authUser.email)
    return { error: 'User not found', status: 404 }
  }

  // Get all store IDs for this user
  const storeIds = users
    .map(u => u.store_id)
    .filter((id): id is string => id !== null)

  if (storeIds.length === 0) {
    console.error('User has no store_id:', users[0].email)
    return { error: 'No store assigned', status: 403 }
  }

  // Return the first user entry and all their store IDs
  return { user: users[0], storeId: storeIds[0], storeIds }
}
