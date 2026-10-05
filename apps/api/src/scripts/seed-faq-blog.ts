import '../config/env';
import { connectDB, disconnectDB } from '../config/db';
import { FAQ } from '../models/FAQ';
import { BlogPost } from '../models/BlogPost';

const INITIAL_FAQS = [
  {
    question: 'How long does shipping and delivery take?',
    answer: 'Standard in-stock furniture items are typically delivered within 5–9 business days depending on your location. For custom-made or handcrafted pieces, delivery may take 2–3 weeks. Once your order is dispatched, you will receive a tracking link via email and SMS.',
    category: 'Orders & Delivery',
    order: 1,
    status: 'active'
  },
  {
    question: 'Do you offer free shipping across India?',
    answer: 'Yes! We offer complimentary white-glove shipping on all orders over ₹4,999 to over 15,000 pin codes nationwide. Our delivery partners handle transit with specialized furniture packaging to ensure zero damage.',
    category: 'Orders & Delivery',
    order: 2,
    status: 'active'
  },
  {
    question: 'Can I modify or cancel my order after placing it?',
    answer: 'Orders can be amended or cancelled with a full refund within 24 hours of placement. Once an item has entered production or dispatch, changes may be subject to restocking or handling fees. Please contact our support team immediately if you need adjustments.',
    category: 'Orders & Delivery',
    order: 3,
    status: 'active'
  },
  {
    question: 'What materials and timber does JODO use?',
    answer: 'We craft our collections with sustainably harvested solid hardwoods—principally Grade-A Teak, European White Oak, and seasoned Sheesham. We pair this with non-toxic water-based matte finishes and high-resilience OEKO-TEX certified fabrics.',
    category: 'Materials & Care',
    order: 4,
    status: 'active'
  },
  {
    question: 'How does the AR room preview work?',
    answer: 'On any product page, click "View in Your Room" or scan the QR code using your smartphone camera. You can instantly project life-size 3D models into your physical space with 100% scale accuracy to evaluate dimensions, finishes, and colors before ordering.',
    category: 'Materials & Care',
    order: 5,
    status: 'active'
  },
  {
    question: 'Can I order custom dimensions or fabric swatches?',
    answer: 'Yes, select collections offer bespoke sizing, stain finishes, and over 40+ curated fabric swatches. Reach out to our design concierge team via the Contact page or live chat to initiate a custom request.',
    category: 'Materials & Care',
    order: 6,
    status: 'active'
  },
  {
    question: 'What is JODO’s warranty coverage?',
    answer: 'Every JODO furniture piece comes with a comprehensive 5-year structural warranty covering timber integrity, frame joints, and manufacturing defects. Upholstery fabrics, foams, and hardware mechanisms are covered under a 2-year warranty.',
    category: 'Warranty & Returns',
    order: 7,
    status: 'active'
  },
  {
    question: 'What is your return and exchange policy?',
    answer: 'We provide an easy 7-day hassle-free return policy from the date of delivery. If the piece doesn’t suit your space or arrives damaged, we arrange a pickup and initiate an immediate replacement or full refund to your original payment method.',
    category: 'Warranty & Returns',
    order: 8,
    status: 'active'
  },
  {
    question: 'Is assembly included with delivery?',
    answer: 'Yes! All bulky furniture like beds, dining tables, and modular sofas include complimentary professional assembly by our certified technicians at the time of delivery.',
    category: 'Assembly & Service',
    order: 9,
    status: 'active'
  },
  {
    question: 'How should I care for my solid wood furniture?',
    answer: 'Dust regularly with a dry microfibre cloth. Keep the wood away from direct harsh sunlight and prolonged moisture. For periodic nourishment, apply natural beeswax or Danish wood oil every 6–12 months. Avoid harsh chemical cleaners or abrasive scouring pads.',
    category: 'Materials & Care',
    order: 10,
    status: 'active'
  }
];

const INITIAL_BLOGS = [
  {
    title: 'The Art of Slow Furniture: Why Intentional Craftsmanship Matters',
    slug: 'art-of-slow-furniture',
    excerpt: 'In an era of flat-pack disposable decor, we explore why sustainably harvested timber, traditional mortise joints, and thoughtful proportion create heirlooms that outlast fleeting trends.',
    content: `In an age dominated by disposable consumerism, the rhythm of home living often falls victim to speed. At Jodo, we believe the furniture you surround yourself with should be designed for decades, not seasons.

### The Problem with Disposable Furniture
Mass-produced furniture relies heavily on compressed particle boards, toxic adhesives, and plastic veneers that begin to degrade within months. Beyond the environmental strain of landfill-bound goods, such pieces lack the tactile warmth and emotional permanence that a well-crafted home deserves.

### The Philosophy of Slow Making
Slow furniture begins with intentional material selection. We source our European White Oak and Teak from responsibly managed forests, allowing the wood to properly kiln-dry and acclimate before shaping. Traditional joinery—like mortise-and-tenon and dovetail joints—allows timber to expand and contract naturally through changing climates without losing structural rigidity.

### Aging with Dignity
Unlike synthetic laminates that chip irreversibly, solid hardwoods develop a rich patina over the years. A ding or scratch isn't a flaw; it becomes part of the family narrative, easily refinished with a swipe of beeswax. Investing in slow furniture is an investment in peace of mind.`,
    category: 'Craft & Material',
    author: 'Aarav Mehta',
    authorRole: 'Head of Furniture Design',
    coverImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    readTime: '6 min read',
    featured: true,
    status: 'published',
    publishedAt: new Date('2026-10-01'),
    tags: ['Craftsmanship', 'Solid Wood', 'Slow Living']
  },
  {
    title: 'How to Master Warm Minimalism in Contemporary Indian Homes',
    slug: 'warm-minimalism-guide',
    excerpt: 'Combining organic textures, linen draping, earthy terracotta accents, and soft architectural curves to evoke peaceful spaces.',
    content: `Minimalism often gets mischaracterized as cold, sterile, and clinical. But when infused with tactile textures and warm earth tones, minimalism becomes deeply soothing and grounding.

### Grounding the Palette
Start with gentle neutral backdrops: warm off-whites, limestone taupe, and soft sand. Layer in accents of raw terracotta and brass hardware to mirror Indian architectural heritage while keeping the visual silhouette clean and uncluttered.

### Embracing Natural Imperfection
Incorporate furniture pieces that celebrate raw grain patterns and hand-loomed linens. Instead of cluttered shelving, curate single focal objects—a hand-turned wooden vase or a sculpted stoneware lamp—that allow negative space to breathe.`,
    category: 'Design & Interiors',
    author: 'Sunaina Rao',
    authorRole: 'Interior Stylist',
    coverImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read',
    featured: false,
    status: 'published',
    publishedAt: new Date('2026-09-25'),
    tags: ['Minimalism', 'Interior Styling', 'Color Palette']
  },
  {
    title: 'A Craftsman’s Guide to Caring for Teak & White Oak Furniture',
    slug: 'solid-wood-maintenance',
    excerpt: 'Seasonal humidity changes, natural oils, and preventative techniques to keep your wooden tables and credenzas glowing across decades.',
    content: `Solid timber is an organic material that breathes with its environment. Understanding its seasonal rhythm is the secret to lifetime longevity.

### Managing Humidity and Light
Direct, intense sunlight over prolonged periods can dry out natural wood oils. Position heavy solid wood tables slightly away from direct sunbeam paths or use sheer curtains. During monsoon months, ensure adequate airflow to prevent moisture buildup.

### Routine Cleaning & Nourishment
Avoid harsh ammoniated sprays or bleach wipes. A soft, barely damp microfiber cloth followed immediately by a dry towel is all you need for daily maintenance. Twice a year, massage a dollop of food-safe beeswax along the wood grain to restore deep nourishment.`,
    category: 'Care & Longevity',
    author: 'Vikram Joshi',
    authorRole: 'Master Carpenter',
    coverImage: 'https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read',
    featured: false,
    status: 'published',
    publishedAt: new Date('2026-09-18'),
    tags: ['Wood Care', 'Maintenance', 'Teak']
  },
  {
    title: 'Proportion, Light & Seating: Curating an Open Living Room',
    slug: 'curating-the-perfect-living-room',
    excerpt: 'How spatial flow, conversational seating layouts, and low-profile sofas make compact apartments feel grand yet deeply intimate.',
    content: `The living room is where hospitality meets quiet contemplation. Designing it requires striking harmony between clear walkways, conversational proximity, and visual sightlines.

### The Power of Low-Profile Silhouettes
High-backed sofas can visually truncate an open-plan room. Choosing low-slung, architectural seating keeps sightlines open, allowing natural daylight to bounce seamlessly from room to room.

### Floating Furniture Away from Walls
Resist the urge to push every seating piece flush against the wall. Floating a sofa by even 10 inches onto an expansive wool rug creates a cozy island that naturally defines the living sanctuary.`,
    category: 'Living Well',
    author: 'Aarav Mehta',
    authorRole: 'Head of Furniture Design',
    coverImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read',
    featured: false,
    status: 'published',
    publishedAt: new Date('2026-09-10'),
    tags: ['Living Room', 'Space Planning', 'Furniture Layout']
  },
  {
    title: 'Virtual Space Planning: Designing Your Room with Web AR',
    slug: 'augmented-reality-interior-design',
    excerpt: 'Eliminate guesswork before you invest. Step-by-step guidance on testing scale, clearances, and color harmony using our 3D AR tools.',
    content: `One of the most persistent anxieties when purchasing furniture online is spatial uncertainty: "Will this dining table overpower my nook?" or "Will this armchair block the balcony entrance?"

### 100% True-to-Scale Projection
Jodo's WebAR engine uses your mobile camera and lidar/depth sensors to measure real floor planes. The 3D model appears in true dimensions—accurate down to millimeters—so you can physically walk around it, check clearance around corners, and ensure natural light isn't obstructed.`,
    category: 'Design & Interiors',
    author: 'Sunaina Rao',
    authorRole: 'Interior Stylist',
    coverImage: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read',
    featured: false,
    status: 'published',
    publishedAt: new Date('2026-09-02'),
    tags: ['AR', 'Technology', 'Room Design']
  },
  {
    title: 'Tactile Comfort: The Science Behind Breathable OEKO-TEX Fabrics',
    slug: 'sustainable-textiles-upholstery',
    excerpt: 'Exploring natural fibres, spill-resistant weaves, and high-abrasion resilience that endure daily family living without compromising softness.',
    content: `A sofa is only as welcoming as its touch. When selecting upholstery fabrics, we look beyond aesthetic colors to examine breathability, Martindale rub counts, and chemical safety certifications.

### What OEKO-TEX Means for Your Home
OEKO-TEX Standard 100 certification verifies that every thread and dye is completely free of harmful volatile organic compounds (VOCs), formaldehyde, and heavy metals. This ensures safe, hypoallergenic living for infants and pets alike.`,
    category: 'Craft & Material',
    author: 'Vikram Joshi',
    authorRole: 'Master Carpenter',
    coverImage: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read',
    featured: false,
    status: 'published',
    publishedAt: new Date('2026-08-28'),
    tags: ['Fabrics', 'Sustainability', 'OEKO-TEX']
  }
];

async function seedFaqAndBlog() {
  await connectDB();
  console.log('🌱 Seeding FAQs and Blog posts...');

  // 1. FAQs
  await FAQ.deleteMany({});
  await FAQ.insertMany(INITIAL_FAQS);
  console.log(`✅ Seeded ${INITIAL_FAQS.length} FAQs`);

  // 2. Blogs
  await BlogPost.deleteMany({});
  await BlogPost.insertMany(INITIAL_BLOGS);
  console.log(`✅ Seeded ${INITIAL_BLOGS.length} Blog posts`);

  await disconnectDB();
  console.log('🌱 Done seeding FAQ and Blog!');
}

seedFaqAndBlog().catch(console.error);
