import { ref } from 'vue'
import { supabase } from '../utils/supabase'
import { Session, User } from '@supabase/supabase-js'
import type { UserProfile } from '../types/training'
import { getOrCreateProfile, refreshProfile as fetchProfile } from '../services/userProfileRepo'

const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const profile = ref<UserProfile | null>(null)
const loading = ref(true)

const ensureProfile = async (currentUser: User | null) => {
  if (!currentUser) {
    profile.value = null
    return
  }
  try {
    const { data } = await getOrCreateProfile(currentUser.id, {
      display_name:
        (currentUser.user_metadata?.full_name as string | undefined) ?? null
    })
    profile.value = data ?? null
  } catch {
    profile.value = null
  }
}

const refreshProfile = async () => {
  if (!user.value) {
    profile.value = null
    return { data: null, error: null }
  }
  const result = await fetchProfile(user.value.id)
  if (!result.error) {
    profile.value = result.data ?? null
  }
  return result
}

// Initialize
supabase.auth.getSession().then(async ({ data }) => {
  session.value = data.session
  user.value = data.session?.user ?? null
  await ensureProfile(user.value)
  loading.value = false
})

supabase.auth.onAuthStateChange((_event, _session) => {
  session.value = _session
  user.value = _session?.user ?? null
  void ensureProfile(user.value)
  loading.value = false
})

export function useAuth() {
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (data.user) {
      await ensureProfile(data.user)
    }
    return { data, error }
  }

  const signUp = async (email: string, password: string, metaData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metaData
      }
    })
    if (data.user) {
      await ensureProfile(data.user)
    }
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
        user.value = null
        session.value = null
        profile.value = null
    }
    return { error }
  }

  const resetPasswordForEmail = async (email: string, redirectTo?: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    })
    return { data, error }
  }

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  }

  return {
    user,
    session,
    loading,
    profile,
    refreshProfile,
    signIn,
    signUp,
    signOut,
    resetPasswordForEmail,
    updatePassword
  }
}
