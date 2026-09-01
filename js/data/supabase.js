/**
 * data/supabase.js
 * Konfigurasi koneksi ke Database & Storage Supabase
 */
// Kita menggunakan versi CDN karena ini Vanilla JS
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// TODO: Ganti URL dan KEY di bawah ini dengan milik Anda dari Dashboard Supabase
const SUPABASE_URL = 'https://qrubtxrbreudadgtrvwp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pAst22NNPbUh4hNsg5ZK_g_kCB8gVld';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);  