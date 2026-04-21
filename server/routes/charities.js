const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Get all charities (public)
router.get('/', async (req, res) => {
  try {
    const { search, featured } = req.query;
    let query = supabase.from('charities').select('*').eq('active', true);

    if (search) query = query.ilike('name', `%${search}%`);
    if (featured === 'true') query = query.eq('featured', true);

    const { data, error } = await query.order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch charities' });
  }
});

// Get single charity
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: 'Charity not found' });
  }
});

// Get charity stats (total contributions)
router.get('/:id/stats', async (req, res) => {
  try {
    const { data } = await supabase
      .from('charity_contributions')
      .select('amount')
      .eq('charity_id', req.params.id);

    const total = (data || []).reduce((sum, c) => sum + c.amount, 0);
    const donors = data?.length || 0;
    res.json({ total, donors });
  } catch {
    res.json({ total: 0, donors: 0 });
  }
});

// Admin: Create charity
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, description, image_url, website, featured, upcoming_events } = req.body;
  try {
    const { data, error } = await supabase
      .from('charities')
      .insert({ name, description, image_url, website, featured: featured || false, upcoming_events, active: true })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create charity' });
  }
});

// Admin: Update charity
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('charities')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update charity' });
  }
});

// Admin: Delete charity
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await supabase.from('charities').update({ active: false }).eq('id', req.params.id);
    res.json({ message: 'Charity deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete charity' });
  }
});

module.exports = router;
