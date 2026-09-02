import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { Review } from '../src/models/Review';
import { Product } from '../src/models/Product';
import { Store } from '../src/models/Store';

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to DB');

  const store = await Store.findOne();
  if (!store) throw new Error('Store not found');

  const products = await Product.find().limit(5);
  if (products.length === 0) throw new Error('No products found');

  const sampleReviews = [
    { authorName: 'Rahul Sharma', authorEmail: 'rahul@example.com', rating: 5, title: 'Absolutely Stunning', body: 'The Jodo furniture is absolutely stunning. It fits perfectly in my Mumbai apartment. The wood finish is premium and delivery was very prompt.', status: 'approved' },
    { authorName: 'Priya Desai', authorEmail: 'priya@example.com', rating: 5, title: 'Extremely Comfortable', body: 'I ordered from Jodo and the quality is extremely comfortable. The fabric is top-notch. It adds a lovely modern touch to my living room. Highly recommended!', status: 'approved' },
    { authorName: 'Amit Patel', authorEmail: 'amit@example.com', rating: 4, title: 'Good Value', body: 'Good product overall. The assembly took a bit longer than expected, but the final look is great. Very sturdy and excellent value for money.', status: 'approved' },
    { authorName: 'Sneha Iyer', authorEmail: 'sneha@example.com', rating: 5, title: 'Amazing AR Try-on', body: 'Jodo\'s customer service is excellent. The product is exactly as shown in the AR try-on. The comfort is amazing, perfect for our family.', status: 'approved' },
    { authorName: 'Vikram Singh', authorEmail: 'vikram@example.com', rating: 5, title: 'Elegant Design', body: 'Very elegant design. The minimalist aesthetic matches exactly what we were looking for. The material quality is genuine and feels very durable.', status: 'approved' },
    { authorName: 'Neha Gupta', authorEmail: 'neha@example.com', rating: 5, title: 'Perfect Addition', body: 'Absolutely in love with my new purchase from Jodo. It arrived in perfect condition to Bangalore within 3 days. A great addition to my home.', status: 'approved' },
  ];

  let count = 0;
  // Clear old reviews
  await Review.deleteMany({});

  for (const product of products) {
    for (const rev of sampleReviews) {
      await Review.create({
        tenantId: store.tenantId,
        storeId: store._id,
        productId: product._id,
        ...rev,
      });
      count++;
    }
  }

  console.log(`Seeded ${count} reviews!`);
  process.exit(0);
}

seed().catch(console.error);
