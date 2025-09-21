"use client"

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function AuthHandler({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      // Check if user has a profile
      checkAndCreateProfile()
    }
  }, [user, loading])

  const checkAndCreateProfile = async () => {
    if (!user) return

    try {
      // Check if profile exists
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const storedName = localStorage.getItem('growbase_signup_name')

        if (storedName) {
          await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              name: storedName
            })

          // Clean up localStorage
          localStorage.removeItem('growbase_signup_name')
        } else {
          // If no stored name, use user metadata or email
          const displayName = user.user_metadata?.full_name ||
                              user.user_metadata?.name ||
                              user.email?.split('@')[0] ||
                              'User'

          await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              name: displayName
            })
        }
      }
    } catch (error) {
      console.error('Error handling user profile:', error)
    }
  }

  return <>{children}</>
}