const supabase = require('../lib/supabase');

// Generate 5 random numbers (1-45 Stableford range)
const generateRandomDraw = () => {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

// Algorithmic draw — weighted by score frequency across all users
const generateAlgorithmicDraw = async () => {
  const { data: scores } = await supabase
    .from('scores')
    .select('score');

  if (!scores || scores.length === 0) return generateRandomDraw();

  const freq = {};
  scores.forEach(({ score }) => {
    freq[score] = (freq[score] || 0) + 1;
  });

  // Build weighted pool
  const pool = [];
  for (let i = 1; i <= 45; i++) {
    const weight = freq[i] || 0;
    // Higher frequency = more likely to appear
    const times = Math.max(1, Math.round(weight * 3));
    for (let j = 0; j < times; j++) pool.push(i);
  }

  const chosen = new Set();
  while (chosen.size < 5) {
    const idx = Math.floor(Math.random() * pool.length);
    chosen.add(pool[idx]);
  }
  return Array.from(chosen).sort((a, b) => a - b);
};

// Check how many numbers a user matched
const checkMatch = (userScores, drawNumbers) => {
  const userSet = new Set(userScores.map(s => s.score));
  const drawSet = new Set(drawNumbers);
  let matches = 0;
  drawSet.forEach(n => { if (userSet.has(n)) matches++; });
  return matches;
};

// Run the full draw
const runDraw = async (drawType = 'random') => {
  // Calculate prize pool from active subscribers
  const { count: activeCount } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('subscription_status', 'active');

  // Assume ₹300/month average contribution to prize pool
  const totalPool = (activeCount || 0) * 300;

  // Check for jackpot rollover
  const { data: lastDraw } = await supabase
    .from('draws')
    .select('jackpot_rollover')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const rolloverAmount = lastDraw?.jackpot_rollover || 0;
  const jackpotPool = Math.round(totalPool * 0.4) + rolloverAmount;
  const match4Pool = Math.round(totalPool * 0.35);
  const match3Pool = Math.round(totalPool * 0.25);

  // Generate draw numbers
  const drawNumbers = drawType === 'algorithmic'
    ? await generateAlgorithmicDraw()
    : generateRandomDraw();

  // Get all active subscribers with their scores
  const { data: subscribers } = await supabase
    .from('users')
    .select('id, name')
    .eq('subscription_status', 'active');

  const results = { match5: [], match4: [], match3: [] };

  for (const user of (subscribers || [])) {
    const { data: scores } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', user.id);

    if (!scores || scores.length < 5) continue;

    const matched = checkMatch(scores, drawNumbers);
    if (matched === 5) results.match5.push(user.id);
    else if (matched === 4) results.match4.push(user.id);
    else if (matched === 3) results.match3.push(user.id);
  }

  // Calculate prize per winner in each tier
  const prizes = {
    match5_per_winner: results.match5.length > 0 ? Math.round(jackpotPool / results.match5.length) : 0,
    match4_per_winner: results.match4.length > 0 ? Math.round(match4Pool / results.match4.length) : 0,
    match3_per_winner: results.match3.length > 0 ? Math.round(match3Pool / results.match3.length) : 0,
  };

  const newRollover = results.match5.length === 0 ? jackpotPool : 0;

  return {
    drawNumbers,
    results,
    prizes,
    pools: { jackpot: jackpotPool, match4: match4Pool, match3: match3Pool, total: totalPool },
    jackpot_rollover: newRollover,
    subscriber_count: activeCount
  };
};

module.exports = { runDraw, generateRandomDraw, generateAlgorithmicDraw };
