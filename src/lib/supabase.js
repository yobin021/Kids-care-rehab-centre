import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  ''

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  ''

// If Supabase credentials are missing, create a dummy proxy
// that always throws so every service's try/catch falls
// through to its local mock-data fallback.
let supabase

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  console.warn(
    '[supabase.js] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — running in offline/mock mode.'
  )

  // Proxy that mimics chained Supabase calls but always rejects
  const reject = () =>
    Promise.resolve({
      data: null,
      error: { message: 'Supabase not configured — using mock data' }
    })

  const chainable = () =>
    new Proxy(
      {},
      {
        get(_, prop) {
          // Terminal methods that return a promise
          if (prop === 'then' || prop === 'single' || prop === 'maybeSingle') {
            return reject()[prop].bind(reject())
          }
          // Everything else returns itself so chaining works
          return (..._args) => chainable()
        }
      }
    )

  supabase = {
    from: () => chainable(),
    rpc: () => reject(),
    auth: {
      signInWithPassword: reject,
      signOut: reject,
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  }
}

export { supabase }
