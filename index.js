require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const WEBHOOK_SECRET = process.env.SIGNUP_WEBHOOK_SECRET;

console.log('[API] Starting ClipHub Creator API...');
console.log('[API] Supabase URL:', supabaseUrl ? '✅ Configured' : '❌ Missing');
console.log('[API] Webhook Secret:', WEBHOOK_SECRET ? '✅ Configured' : '❌ Missing');

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({ 
    service: 'ClipHub Creator API',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      signup: 'POST /api/creator/signup'
    }
  });
});

// Creator signup endpoint
app.post('/api/creator/signup', async (req, res) => {
  try {
    const secret = req.headers['x-webhook-secret'];
    if (secret !== WEBHOOK_SECRET) {
      console.error('[AUTH] Invalid secret');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      discordId,
      discordUsername,
      discordGlobalName,
      avatarUrl,
      fullName,
      tiktok,
      youtube,
      instagram,
      email,
      wallet,
      bio,
      source,
      timestamp,
    } = req.body;

    if (!discordId || !fullName || !email || !tiktok || !youtube || !instagram || !wallet || !bio) {
      return res.status(400).json({ 
        error: 'Missing required fields'
      });
    }

    console.log(`[SIGNUP] Processing signup for: ${fullName}`);

    const { data, error } = await supabase
      .from('creator_signups')
      .insert([
        {
          discord_id: discordId,
          discord_username: discordUsername,
          discord_global_name: discordGlobalName,
          avatar_url: avatarUrl,
          full_name: fullName,
          tiktok,
          youtube,
          instagram,
          email,
          wallet,
          bio,
          source: source || 'discord',
          discord_submitted_at: timestamp,
        },
      ])
      .select();

    if (error) {
      console.error('[DB ERROR]:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Creator already signed up' });
      }
      
      return res.status(500).json({ error: 'Failed to save signup' });
    }

    console.log(`[SUCCESS] Signup saved for: ${fullName}`);

    res.status(200).json({ 
      success: true,
      message: 'Signup received',
      data: data[0]
    });
  } catch (err) {
    console.error('[ERROR]:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/creator/signups', async (req, res) => {
  try {
    const secret = req.headers['x-webhook-secret'];
    if (secret !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('creator_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch' });
    }

    res.status(200).json({ 
      success: true,
      count: data.length,
      data 
    });
  } catch (err) {
    console.error('[ERROR]:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ API running on port ${PORT}`);
});
