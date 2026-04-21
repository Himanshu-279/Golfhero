const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../lib/supabase');

router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const session = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed': {
      const userId = session.metadata?.userId;
      if (!userId) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const plan = subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly';

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: 'active',
        plan,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      }, { onConflict: 'user_id' });

      await supabase.from('users').update({ subscription_status: 'active' }).eq('id', userId);
      break;
    }

    case 'invoice.payment_succeeded': {
      const subId = session.subscription;
      if (!subId) break;

      const subscription = await stripe.subscriptions.retrieve(subId);
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subId)
        .single();

      if (sub) {
        await supabase.from('subscriptions').update({
          status: 'active',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        }).eq('stripe_subscription_id', subId);

        await supabase.from('users').update({ subscription_status: 'active' }).eq('id', sub.user_id);

        // Calculate and record charity contribution
        const { data: user } = await supabase
          .from('users')
          .select('charity_id, charity_percentage')
          .eq('id', sub.user_id)
          .single();

        if (user?.charity_id) {
          const amount = Math.round((session.amount_paid / 100) * (user.charity_percentage / 100));
          await supabase.from('charity_contributions').insert({
            user_id: sub.user_id,
            charity_id: user.charity_id,
            amount,
            subscription_invoice_id: session.id
          });
        }
      }
      break;
    }

    case 'customer.subscription.deleted':
    case 'invoice.payment_failed': {
      const subId = event.type === 'customer.subscription.deleted' ? session.id : session.subscription;
      if (!subId) break;

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subId)
        .single();

      if (sub) {
        await supabase.from('subscriptions').update({ status: 'inactive' }).eq('stripe_subscription_id', subId);
        await supabase.from('users').update({ subscription_status: 'inactive' }).eq('id', sub.user_id);
      }
      break;
    }
  }

  res.json({ received: true });
});

module.exports = router;
