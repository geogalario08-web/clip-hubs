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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ClipHub Creator API'
  });
});

// Creator signup endpoint
app.post('/api/creator/signup', async (req, res) => {
  try {
    // Verify webhook secret
    const secret = req.headers['x-webhook-secret'];
    if (secret !== WEBHOOK_SECRET) {
      console.error('[AUTH] Unauthorized signup attempt - invalid secret');
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

    // Validate required fields
    const missingFields = [];
    if (!discordId) missingFields.push('discordId');
    if (!fullName) missingFields.push('fullName');
    if (!email) missingFields.push('email');
    if (!tiktok) missingFields.push('tiktok');
    if (!youtube) missingFields.push('youtube');
    if (!instagram) missingFields.push('instagram');
    if (!wallet) missingFields.push('wallet');
    if (!bio) missingFields.push('bio');

    if (missingFields.length > 0) {
      console.error('[VALIDATION] Missing fields:', missingFields);
      return res.status(400).json({ 
        error: 'Missing required fields',
        missing: missingFields 
      });
    }

    console.log(`[SIGNUP] Processing signup for Discord user: ${discordId}`);

    // Insert into Supabase
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
      
      // Check if it's a duplicate user error
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Creator already signed up with this Discord ID' });
      }
      
      return res.status(500).json({ error: 'Failed to save signup to database' });
    }

    console.log(`[SUCCESS] Signup saved for: ${fullName} (${email})`);

    res.status(200).json({ 
      success: true,
      message: 'Creator signup received and saved',
      data: data[0]
    });
  } catch (err) {
    console.error('[API ERROR]:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all signups (admin endpoint)
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
      console.error('[DB ERROR]:', error);
      return res.status(500).json({ error: 'Failed to fetch signups' });
    }

    res.status(200).json({ 
      success: true,
      count: data.length,
      data 
    });
  } catch (err) {
    console.error('[API ERROR]:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single creator by Discord ID
app.get('/api/creator/signup/:discordId', async (req, res) => {
  try {
    const secret = req.headers['x-webhook-secret'];
    if (secret !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { discordId } = req.params;

    const { data, error } = await supabase
      .from('creator_signups')
      .select('*')
      .eq('discord_id', discordId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Creator not found' });
      }
      return res.status(500).json({ error: 'Failed to fetch creator' });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[API ERROR]:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handler for missing routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ ClipHub Creator API listening on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Signup endpoint: POST http://localhost:${PORT}/api/creator/signup`);
});
