const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');
const { authenticate } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  const { email, password, name, charity_id, charity_percentage = 10 } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email and password required' });
  }
  if (charity_percentage < 10) {
    return res.status(400).json({ error: 'Minimum charity contribution is 10%' });
  }

  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        name,
        charity_id: charity_id || null,
        charity_percentage,
        role: 'user',
        subscription_status: 'inactive'
      })
      .select()
      .single();

    if (error) throw error;

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { password_hash, ...userSafe } = user;
    res.status(201).json({ token, user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { password_hash, ...userSafe } = user;
    res.json({ token, user: userSafe });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get profile
router.get('/me', authenticate, async (req, res) => {
  const { password_hash, ...userSafe } = req.user;
  res.json(userSafe);
});

// Update profile
router.put('/me', authenticate, async (req, res) => {
  const { name, charity_id, charity_percentage } = req.body;

  if (charity_percentage && charity_percentage < 10) {
    return res.status(400).json({ error: 'Minimum charity contribution is 10%' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ name, charity_id, charity_percentage })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    const { password_hash, ...userSafe } = data;
    res.json(userSafe);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
