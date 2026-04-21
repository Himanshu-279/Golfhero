const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { runDraw } = require('../services/drawEngine');

// Get all published draws (public)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch draws' });
  }
});

// Get latest draw result
router.get('/latest', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select('*, draw_winners(*)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error) return res.json(null);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch latest draw' });
  }
});

// Check if current user is a winner in a draw
router.get('/:id/my-result', authenticate, async (req, res) => {
  try {
    const { data } = await supabase
      .from('draw_winners')
      .select('*')
      .eq('draw_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
    res.json(data || null);
  } catch {
    res.json(null);
  }
});

// Admin: Simulate draw (preview, not saved)
router.post('/simulate', authenticate, requireAdmin, async (req, res) => {
  try {
    const { draw_type = 'random' } = req.body;
    const result = await runDraw(draw_type);
    res.json({ ...result, simulated: true });
  } catch (err) {
    res.status(500).json({ error: 'Simulation failed' });
  }
});

// Admin: Run and save draw (draft)
router.post('/run', authenticate, requireAdmin, async (req, res) => {
  try {
    const { draw_type = 'random', month_year } = req.body;
    const result = await runDraw(draw_type);

    const { data: draw, error } = await supabase
      .from('draws')
      .insert({
        month_year: month_year || new Date().toISOString().slice(0, 7),
        draw_type,
        draw_numbers: result.drawNumbers,
        total_pool: result.pools.total,
        jackpot_pool: result.pools.jackpot,
        match4_pool: result.pools.match4,
        match3_pool: result.pools.match3,
        jackpot_rollover: result.jackpot_rollover,
        status: 'draft',
        subscriber_count: result.subscriber_count
      })
      .select()
      .single();

    if (error) throw error;

    // Save winners
    const winnerInserts = [];
    const addWinners = (ids, match_count, prize) =>
      ids.forEach(user_id => winnerInserts.push({ draw_id: draw.id, user_id, match_count, prize_amount: prize, payment_status: 'pending' }));

    addWinners(result.results.match5, 5, result.prizes.match5_per_winner);
    addWinners(result.results.match4, 4, result.prizes.match4_per_winner);
    addWinners(result.results.match3, 3, result.prizes.match3_per_winner);

    if (winnerInserts.length > 0) {
      await supabase.from('draw_winners').insert(winnerInserts);
    }

    res.json({ draw, results: result.results, prizes: result.prizes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Draw failed' });
  }
});

// Admin: Publish draw
router.put('/:id/publish', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('draws')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish draw' });
  }
});

// Admin: Get all draws including drafts
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch draws' });
  }
});

module.exports = router;
