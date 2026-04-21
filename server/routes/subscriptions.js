const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../lib/supabase');
const { authenticate } = require('../middleware/auth');
const demoPayment = require('../services/demoPayment');
const razorpayService = require('../services/razorpayService');

// Determine payment mode
const USE_RAZORPAY = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_dummy';
const DEMO_MODE = !USE_RAZORPAY && (process.env.DEMO_MODE === 'true' || process.env.STRIPE_SECRET_KEY.includes('sk_test'));

// Create checkout session - supports Razorpay, Stripe (Stripe), or Demo mode
router.post('/checkout', authenticate, async (req, res) => {
  const { plan } = req.body; // 'monthly' or 'yearly'

  try {
    if (USE_RAZORPAY) {
      // Razorpay integration
      const order = await razorpayService.createSubscriptionOrder(
        req.user.id,
        req.user.email,
        req.user.name,
        plan
      );
      res.json({
        type: 'razorpay',
        order: order,
        keyId: process.env.RAZORPAY_KEY_ID,
        userEmail: req.user.email,
        userName: req.user.name
      });
    } else if (DEMO_MODE) {
      // Demo mode - instant activation
      const result = await demoPayment.createCheckoutSession(
        req.user.id,
        null,
        req.user.id,
        plan
      );
      res.json(result);
    } else {
      // Stripe (international)
      const priceId = plan === 'yearly'
        ? process.env.STRIPE_YEARLY_PRICE_ID
        : process.env.STRIPE_MONTHLY_PRICE_ID;

      let customerId = req.user.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: req.user.email,
          name: req.user.name,
          metadata: { userId: req.user.id }
        });
        customerId = customer.id;
        await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', req.user.id);
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.CLIENT_URL}/dashboard?subscribed=true`,
        cancel_url: `${process.env.CLIENT_URL}/subscribe?cancelled=true`,
        metadata: { userId: req.user.id }
      });
      res.json({ url: session.url });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Razorpay callback - verify payment and activate subscription
router.post('/razorpay-callback', authenticate, async (req, res) => {
  try {
    const { orderId, paymentId, signature, plan } = req.body;

    // Verify signature for security
    const isValid = razorpayService.verifySignature(orderId, paymentId, signature);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Handle payment success
    const result = await razorpayService.handlePaymentSuccess(
      orderId,
      paymentId,
      req.user.id,
      plan
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Cancel subscription
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single();

    if (!sub) return res.status(404).json({ error: 'No active subscription' });

    // Cancel on payment gateway if applicable
    if (!DEMO_MODE && !USE_RAZORPAY && sub.stripe_subscription_id) {
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true
      });
    }

    // Update local database status to inactive (not cancelled - DB constraint)
    await supabase.from('subscriptions')
      .update({ status: 'inactive' })
      .eq('user_id', req.user.id);

    // Also update users table subscription_status
    await supabase.from('users')
      .update({ subscription_status: 'inactive' })
      .eq('id', req.user.id);

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Get subscription status
router.get('/status', authenticate, async (req, res) => {
  try {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    res.json(data || { status: 'inactive' });
  } catch {
    res.json({ status: 'inactive' });
  }
});

module.exports = router;
