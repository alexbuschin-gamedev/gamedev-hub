import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export const ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
}

export const ROLE_LABELS = {
  admin: 'Admin',
  member: 'Team',
  guest: 'Gast',
}

export const TAGS = ['code', 'design', 'story', 'art', 'audio', 'release', 'general']

export const EVENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
}
