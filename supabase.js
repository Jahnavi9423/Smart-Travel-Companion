import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://urxkafuakrdzkdfwihnb.supabase.co'
const supabaseAnonKey = 'sb_publishable_eRo7RUFhdWvP6EYyHhQn7w_WkN2TjgB'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)