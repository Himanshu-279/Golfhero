const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [users, subs, charityTotal, draws] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      supabase.from('charity_contributions').select('amount'),
      supabase.from('draws').select('total_pool').eq('status', 'published')
    ]);

    const totalCharity = (charityTotal.data || []).reduce((s, c) => s + c.amount, 0);
    const totalPrizePool = (draws.data || []).reduce((s, d) => s + d.total_pool, 0);

    res.json({
      total_users: users.count || 0,
      active_subscribers: subs.count || 0,
      total_charity_contributed: totalCharity,
      total_prize_pool: totalPrizePool
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, subscription_status, charity_percentage, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  const { name, role, subscription_status } = req.body;
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ name, role, subscription_status })
      .eq('id', req.params.id)
      .select('id, name, email, role, subscription_status')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Edit user scores
router.put('/users/:id/scores/:scoreId', async (req, res) => {
  const { score, score_date } = req.body;
  try {
    const { data, error } = await supabase
      .from('scores')
      .update({ score, score_date })
      .eq('id', req.params.scoreId)
      .eq('user_id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update score' });
  }
});

// Get all winners
router.get('/winners', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('draw_winners')
      .select('*, users(name, email), draws(month_year, draw_numbers)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch winners' });
  }
});

// Verify winner (approve/reject proof)
router.put('/winners/:id/verify', async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'
  try {
    const { data, error } = await supabase
      .from('draw_winners')
      .update({ verification_status: status, verified_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

// Mark winner as paid
router.put('/winners/:id/pay', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('draw_winners')
      .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as paid' });
  }
});

// Analytics
router.get('/analytics', async (req, res) => {
  try {
    const { data: monthlyGrowth } = await supabase
      .from('users')
      .select('created_at')
      .order('created_at');

    const { data: charityBreakdown } = await supabase
      .from('charity_contributions')
      .select('charity_id, amount, charities(name)');

    res.json({ monthlyGrowth, charityBreakdown });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
