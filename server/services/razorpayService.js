// Razorpay Payment Service - Real payment integration for India
const Razorpay = require('razorpay');
const supabase = require('../lib/supabase');

// Debug: Log keys
console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID?.substring(0, 15) + '...');
console.log('Razorpay Key Secret length:', process.env.RAZORPAY_KEY_SECRET?.length);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret'
});

const razorpayService = {
  // Create order for subscription
  async createSubscriptionOrder(userId, email, name, plan) {
    try {
      const amount = plan === 'yearly' ? 479900 : 49900; // Amount in paise
      const notes = {
        userId,
        plan,
        email,
        name
      };

      const order = await razorpay.orders.create({
        amount: amount,
        currency: 'INR',
        receipt: `order_${userId.substring(0, 8)}_${Date.now().toString().slice(-6)}`,
        notes: notes
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status
      };
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      throw new Error('Failed to create payment order');
    }
  },

  // Verify payment signature (webhook security)
  verifySignature(orderId, paymentId, signature) {
    try {
      const crypto = require('crypto');
      const secret = process.env.RAZORPAY_KEY_SECRET;

      const data = `${orderId}|${paymentId}`;
      const hash = crypto
        .createHmac('sha256', secret)
        .update(data)
        .digest('hex');

      return hash === signature;
    } catch (error) {
      return false;
    }
  },

  // Handle successful payment
  async handlePaymentSuccess(orderId, paymentId, userId, plan) {
    try {
      // Get order details to verify amount
      const payment = await razorpay.payments.fetch(paymentId);

      if (payment.status !== 'captured') {
        throw new Error('Payment not captured');
      }

      // Create subscription in database
      const now = new Date();
      const endDate = new Date(now);
      if (plan === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          stripe_subscription_id: paymentId, // Use payment ID as subscription ID
          stripe_customer_id: payment.email,
          plan: plan,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: endDate.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update user subscription status
      await supabase
        .from('users')
        .update({ subscription_status: 'active' })
        .eq('id', userId);

      return {
        success: true,
        subscription: subscription,
        message: 'Payment successful and subscription activated'
      };
    } catch (error) {
      console.error('Payment success handling failed:', error);
      throw error;
    }
  },

  // Create refund if needed
  async createRefund(paymentId, amount = null) {
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount // amount in paise, omit for full refund
      });

      return {
        refundId: refund.id,
        status: refund.status
      };
    } catch (error) {
      console.error('Refund failed:', error);
      throw error;
    }
  }
};

module.exports = razorpayService;
