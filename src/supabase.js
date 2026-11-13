import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null

export function localAsset(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

export async function imageUrl(path) {
  if (!path) return ''
  if (path.startsWith('/images/')) return localAsset(path)
  if (!supabase) return ''
  const { data, error } = await supabase.storage.from('school-images').createSignedUrl(path, 3600)
  return error ? '' : data.signedUrl
}
