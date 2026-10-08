import { connectDB } from '../config/db';
import { Banner } from '../models/Banner';

const UPDATED_SLIDES = [
  {
    order: 0,
    tagline: "The Joy of Together",
    heading: "Furniture That Brings You Closer",
    subtext: "No tools. No waiting. No confusion. Just you, your people, and furniture that clicks into place — the way a good moment does."
  },
  {
    order: 1,
    tagline: "A New Way to Experience Furniture",
    heading: "Put It Together. Make It Yours.",
    subtext: "JODO furniture assembles like a jigsaw puzzle — no screws, no carpenter, no stress. Just the quiet satisfaction of building something together."
  },
  {
    order: 2,
    tagline: "Built Different. Felt Together.",
    heading: "Convenience Without Compromise",
    subtext: "Flat-packed. Tool-free. Made in-house with premium plywood. JODO delivers furniture that is ready when you are — and stays ready for life."
  }
];

async function run() {
  try {
    await connectDB();
    for (const slide of UPDATED_SLIDES) {
      await Banner.updateOne(
        { order: slide.order },
        { 
          $set: { 
            tagline: slide.tagline,
            heading: slide.heading,
            subtext: slide.subtext
          } 
        }
      );
    }
    console.log('Successfully updated banner texts to match original designs!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
