const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  console.log('Creating Stripe products and prices...\n');

  try {
    // Create Pro product
    const proProduct = await stripe.products.create({
      name: 'PhotoLeadAgent Pro',
      description: '200 leads/month, Priority AI scanning, Advanced lead scoring, Outreach templates, Email support',
    });
    console.log('✓ Created Pro product:', proProduct.id);

    // Create Pro price ($29/month)
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 2900, // $29.00 in cents
      currency: 'usd',
      recurring: { interval: 'month' },
    });
    console.log('✓ Created Pro price:', proPrice.id);

    // Create Premium product
    const premiumProduct = await stripe.products.create({
      name: 'PhotoLeadAgent Premium',
      description: 'Unlimited leads, Priority AI scanning, Multi-location support, Priority support',
    });
    console.log('✓ Created Premium product:', premiumProduct.id);

    // Create Premium price ($79/month)
    const premiumPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 7900, // $79.00 in cents
      currency: 'usd',
      recurring: { interval: 'month' },
    });
    console.log('✓ Created Premium price:', premiumPrice.id);

    console.log('\n========================================');
    console.log('Add these to your .env.local file:');
    console.log('========================================\n');
    console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`STRIPE_PREMIUM_PRICE_ID=${premiumPrice.id}`);
    console.log('');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setupStripeProducts();
