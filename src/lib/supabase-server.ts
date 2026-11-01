import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Server component client
export const createServerClient = () =>
  createServerComponentClient({ cookies })
