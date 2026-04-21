// Demo Payment Service - Simulates Stripe for testing
// When DEMO_MODE=true in .env, this service creates mock payments

const supabase = require('../lib/supabase');

const demoPayment = {
  // Mock customer creation
  async createCustomer(email, name) {
    return {
      id: `demo_cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name
    };
  },

  // Mock checkout session creation
  async createCheckoutSession(customerId, priceId, userId, plan) {
    const sessionId = `demo_sess_${Date.now()}`;
    
    // Immediately create subscription in database (demo mode)
    const subscriptionId = `demo_sub_${Date.now()}`;
    
    const now = new Date();
    const currentPeriodStart = now;
    const currentPeriodEnd = new Date(now);
    
    if (plan === 'yearly') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // Save subscription to database
    await supabase.from('subscriptions').insert({
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      plan: plan,
      status: 'active',
      current_period_start: currentPeriodStart.toISOString(),
      current_period_end: currentPeriodEnd.toISOString()
    });

    // Update user subscription status
    await supabase.from('users')
      .update({ subscription_status: 'active' })
      .eq('id', userId);

    // Return demo success URL (redirect to dashboard)
    return {
      url: `${process.env.CLIENT_URL}/dashboard?subscribed=true&demo=true`,
      sessionId: sessionId,
      isDemo: true
    };
  },

  // Mock subscription cancellation
  async cancelSubscription(subscriptionId) {
    return { status: 'cancel_at_period_end' };
  },

  // Mock webhook processing (auto-confirm payment)
  async processWebhookEvent(event) {
    console.log('[DEMO] Webhook event:', event.type);
    // In demo mode, we just log it
    return true;
  }
};

module.exports = demoPayment;
