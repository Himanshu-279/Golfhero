const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { authenticate, requireSubscription } = require('../middleware/auth');

// Get all scores for current user
router.get('/', authenticate, requireSubscription, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('score_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// Add a new score
router.post('/', authenticate, requireSubscription, async (req, res) => {
  const { score, score_date } = req.body;

  if (!score || !score_date) return res.status(400).json({ error: 'Score and date required' });
  if (score < 1 || score > 45) return res.status(400).json({ error: 'Score must be between 1 and 45' });

  try {
    // Check for duplicate date
    const { data: existing } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('score_date', score_date)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'A score for this date already exists. Please edit or delete it.' });
    }

    // Get current scores ordered oldest first
    const { data: currentScores } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', req.user.id)
      .order('score_date', { ascending: true });

    // If 5 scores exist, delete the oldest
    if (currentScores && currentScores.length >= 5) {
      await supabase.from('scores').delete().eq('id', currentScores[0].id);
    }

    // Insert new score
    const { data, error } = await supabase
      .from('scores')
      .insert({ user_id: req.user.id, score, score_date })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add score' });
  }
});

// Update a score
router.put('/:id', authenticate, requireSubscription, async (req, res) => {
  const { score, score_date } = req.body;

  if (score && (score < 1 || score > 45)) {
    return res.status(400).json({ error: 'Score must be between 1 and 45' });
  }

  try {
    // Verify ownership
    const { data: existing } = await supabase
      .from('scores')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Score not found' });

    // Check date duplicate (excluding self)
    if (score_date && score_date !== existing.score_date) {
      const { data: dupDate } = await supabase
        .from('scores')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('score_date', score_date)
        .neq('id', req.params.id)
        .single();

      if (dupDate) return res.status(400).json({ error: 'A score for this date already exists' });
    }

    const { data, error } = await supabase
      .from('scores')
      .update({ score, score_date })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update score' });
  }
});

// Delete a score
router.delete('/:id', authenticate, requireSubscription, async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('scores')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Score not found' });

    await supabase.from('scores').delete().eq('id', req.params.id);
    res.json({ message: 'Score deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete score' });
  }
});

module.exports = router;
