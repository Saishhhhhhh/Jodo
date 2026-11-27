import '../config/env';
import { connectDB, disconnectDB } from '../config/db';
import { FAQ } from '../models/FAQ';
import { BlogPost } from '../models/BlogPost';

const INITIAL_FAQS = [
  {
    "question": "What is tool-free flat-pack furniture? How is it different from the IKEA flat-pack I already know?",
    "answer": "Regular flat-pack needs screws, Allen key, some basic tools and 60 minutes of DIY, loose hardware you can lose. JODO panels slide into a connector system entirely by hand : nothing to screw in, nothing to misplace : and disassembly is just as easy unlike conventional flat-pack",
    "category": "New to Tool-Free Furniture?",
    "order": 1,
    "status": "active"
  },
  {
    "question": "Is anyone else doing this in India? How do I trust a brand new category?",
    "answer": "Tool-free, connector-based furniture is an established category internationally, conceptually it adapts and modernises centuries old traditional Indian and Japanese tool free joinery. JODO is made for Indian homes, climate, and moving patterns. Our own connector mechanism goes through structural load and repeated assembly-disassembly cycle testing before any SKU ships.",
    "category": "New to Tool-Free Furniture?",
    "order": 2,
    "status": "active"
  },
  {
    "question": "JODO is a new brand. How does the warranty work across the product life?",
    "answer": "Every order is registered against your account from day one, so warranty cover isn't dependent on a physical card you could lose. Spare connectors and panels are also sold independently of a warranty claim, so the furniture stays repairable regardless of when you bought it, even outside the warranty.",
    "category": "New to Tool-Free Furniture?",
    "order": 3,
    "status": "active"
  },
  {
    "question": "Can I see or try the product before I buy, since I can't quite picture how 'tool-free' works?",
    "answer": "We currently sell JODO products only via our e-commerce website - www.jodoshop.com. We are in the process of getting ourselves into retail stores by 2027 first quarter",
    "category": "New to Tool-Free Furniture?",
    "order": 4,
    "status": "active"
  },
  {
    "question": "Is tool free joinery as safe as screwed-together furniture ? Could it loosen or come apart on its own?",
    "answer": "The connectors are engineered to slide and lock into place, not just hold by friction, so normal use and moderate load don't make them loose or cause them to come apart. Load-bearing, drop tests, multiple disassembly-assembly cycles, quality performances are tested to BIS structural safety standards",
    "category": "New to Tool-Free Furniture?",
    "order": 5,
    "status": "active"
  },
  {
    "question": "Does tool-free mean toy-like, shabby looking pieces compared to traditional screwed-on carpentry furniture?",
    "answer": "No : the connector sits within the panel instead of a visible add-on fitting, so finished pieces look like standard furniture. Once assembled, a JODO piece looks and functions like any other regular furniture",
    "category": "New to Tool-Free Furniture?",
    "order": 6,
    "status": "active"
  },
  {
    "question": "Is this safe for homes with young kids or pets?",
    "answer": "Panels have no exposed connectors or sharp hardware edges. Joined panels aren’t something a child or pet can easily loosen. JODO pieces are safe around kids and pets",
    "category": "New to Tool-Free Furniture?",
    "order": 7,
    "status": "active"
  },
  {
    "question": "What if I assemble it and don't like it ? Can I return it?",
    "answer": "Return and trial period window is mentioned in our Returns and Warranty guidelines",
    "category": "New to Tool-Free Furniture?",
    "order": 8,
    "status": "active"
  },
  {
    "question": "Can I really ditch the tool box to assemble this?",
    "answer": "Yes. Every JODO piece uses our proprietary connector system : no screwdriver, no Allen key, no drilling into walls or floors. Most pieces slide together by hand in under 30 minutes approximately",
    "category": "Assembly & Ease of Use",
    "order": 9,
    "status": "active"
  },
  {
    "question": "I've never assembled furniture before. Will I mess it up?",
    "answer": "The connectors are designed to only fit one way, so there's no way to attach a panel incorrectly. Each product ships with a visual, step-by-step guide, plus a QR code linking to a short assembly video.",
    "category": "Assembly & Ease of Use",
    "order": 10,
    "status": "active"
  },
  {
    "question": "What if I lose a part or a connector breaks?",
    "answer": "Every SKU has spare connectors available to order separately on our website, so a lost or damaged part never means replacing the whole piece.",
    "category": "Assembly & Ease of Use",
    "order": 11,
    "status": "active"
  },
  {
    "question": "Can one person assemble this alone?",
    "answer": "Certainly, our furniture is built for a simple one person setup, you can grab a friend if you’d like some company",
    "category": "Assembly & Ease of Use",
    "order": 12,
    "status": "active"
  },
  {
    "question": "I move apartments often . Will this survive multiple moves?",
    "answer": "Our core design foundation is to make JODO for people on the go. Furniture disassembles back into flat-pack form just as easily as it assembles, so you can take it apart, move it, and reassemble it without damage and carpenter intervention.",
    "category": "Moving & Renting",
    "order": 13,
    "status": "active"
  },
  {
    "question": "Will assembling or disassembling this damage my rented walls or floors?",
    "answer": "No wall and floor drilling, everything is freestanding and connector-based, so it's landlord- and deposit-friendly.",
    "category": "Moving & Renting",
    "order": 14,
    "status": "active"
  },
  {
    "question": "Can this fit through narrow stairwells or small elevators?",
    "answer": "Yes this ships flat-packed, JODO furniture is built and packaged to fit narrow stairwells and compact lift shafts that assembled furniture often can't",
    "category": "Moving & Renting",
    "order": 15,
    "status": "active"
  },
  {
    "question": "Which Pincodes are serviceable by JODO?",
    "answer": "You can check our Pincode compatibility option to confirm if JODO delivers or if you need to wait a little longer",
    "category": "Moving & Renting",
    "order": 16,
    "status": "active"
  },
  {
    "question": "Is tool-free furniture as sturdy as regular furniture?",
    "answer": "Tool free doesn't mean flimsy. We use solid wood and plywood in premium laminate finish and high density foam for our upholstered SKUs. Our connector mechanism is tested for quality and built to BIS compliance standards for structural safety and daily use",
    "category": "Quality & Durability",
    "order": 17,
    "status": "active"
  },
  {
    "question": "Will it hold up in Indian weather and humidity?",
    "answer": "Yes. Materials are selected and climate-tested specifically for Indian conditions : humidity and heat cycles : not adapted from a foreign spec sheet. We use solid wood and plywood in premium laminate finish and high density foam for our upholstered SKUs",
    "category": "Quality & Durability",
    "order": 18,
    "status": "active"
  },
  {
    "question": "How many times can I actually take it apart and put it back together?",
    "answer": "Exact cycle count claim is pending, post manufacturing testings",
    "category": "Quality & Durability",
    "order": 19,
    "status": "active"
  },
  {
    "question": "What materials does JODO use?",
    "answer": "Solid wood and plywood boards are the primary materials used across the range, metal parts in powder coated finish for some SKUs, 40 density foam for our upholstered pieces and our connectors are fabricated in the highest grade of stainless steel 304. All materials are chosen for structural performance not just appearance",
    "category": "Materials & Origin",
    "order": 20,
    "status": "active"
  },
  {
    "question": "Is JODO furniture made in India?",
    "answer": "Yes : JODO is designed and manufactured in India, built around Indian homes, climate, and usage rather than adapted from a foreign product line",
    "category": "Materials & Origin",
    "order": 21,
    "status": "active"
  },
  {
    "question": "How do I care for JODO furniture, especially in India's climate?",
    "answer": "Wipe with a soft, lightly damp cloth and dry after : avoid abrasive cleaners, harsh chemicals, and standing water. Keep pieces out of prolonged direct sunlight to prevent discolouration, and away from continuous high humidity or constant dampness where possible. Materials are chosen with Indian conditions in mind, normal care still extends the life of any furniture",
    "category": "Care & Maintenance",
    "order": 22,
    "status": "active"
  },
  {
    "question": "How is it delivered ? Do I need to arrange movers or a carpenter?",
    "answer": "It arrives flat-packed at your door, and you assemble it yourself, by hand : no carpenter or installer needed by default. If you'd rather have help anyway, optional Assisted Setup is available as a paid add-on.",
    "category": "Delivery & Logistics",
    "order": 23,
    "status": "active"
  },
  {
    "question": "I'd rather not assemble it myself : can I pay someone to do it for me?",
    "answer": "All JODO pieces can be self assembled but if you’d rather have help, optional Assisted Setup is available as a paid add-on. Technicians are trained specifically to work with our connector systems so the piece is assembled the same way you would do it yourself",
    "category": "Delivery & Logistics",
    "order": 24,
    "status": "active"
  },
  {
    "question": "What's the delivery timeline for Mumbai and Bengaluru?",
    "answer": "We are trying to optimise this further and bring your JODO pieces to you faster. But as of now Mumbai delivery takes 2-7 days and Bengaluru delivery takes 8-10 days. Thank you for your patience",
    "category": "Delivery & Logistics",
    "order": 25,
    "status": "active"
  },
  {
    "question": "How can I track my JODO order?",
    "answer": "Your order can be tracked through our WhatsApp, SMS and email updates using your order number",
    "category": "Delivery & Logistics",
    "order": 26,
    "status": "active"
  },
  {
    "question": "Why should I pay this much for flat-pack furniture instead of a local carpenter or a mass-market flat-pack brand?",
    "answer": "JODO is the sweet spot between mass market flat packed furniture that is not built for Indian living and homes with limited durability and the custom carpentry market that is expensive, slow, tool and labour intense. Solid wood and plywood being our core material across SKUs, JODO promises value over years of living with our pieces",
    "category": "Pricing & Value",
    "order": 27,
    "status": "active"
  },
  {
    "question": "Do you offer EMI, UPI, or Cash on Delivery?",
    "answer": "Yes, we offer EMI, UPI and Cash on Delivery options for all items",
    "category": "Pricing & Value",
    "order": 28,
    "status": "active"
  },
  {
    "question": "Is there a warranty?",
    "answer": "Yes, JODO offers a tiered warranty policy for different SKUs where applicable. Full terms are in JODO's Returns and Warranty guidelines",
    "category": "Returns & Warranty",
    "order": 29,
    "status": "active"
  },
  {
    "question": "What should I do if my furniture arrives damaged?",
    "answer": "We’re sorry your furniture had a rough trip. Report it within 24 hours with 2-3 clear photos or a short video to our customer support team (share link) as soon as you receive the package along with your Order ID. We will raise a claim ticket instantly and a resolution timeline will be communicated to you via WhatsApp, SMS and email",
    "category": "Returns & Warranty",
    "order": 30,
    "status": "active"
  },
  {
    "question": "What if a part is missing, or a connector breaks later on?",
    "answer": "Because the connector system is modular, replacement connectors and panels can be ordered individually from JODO's website (share link) : you don't need to wait on a warranty claim or replace the whole piece",
    "category": "Returns & Warranty",
    "order": 31,
    "status": "active"
  },
  {
    "question": "What if a JODO piece gets damaged due to incorrect, forced installation using tools?",
    "answer": "Kindly refer to our Returns and Warranty guidelines for the same",
    "category": "Returns & Warranty",
    "order": 32,
    "status": "active"
  },
  {
    "question": "Can I return it after I've already assembled it even if there is no damage?",
    "answer": "You will need to reach out to our customer support team (share link) for us to understand the cause of return and to asses next steps. Kindly refer to our Returns and Warranty guidelines for the same",
    "category": "Returns & Warranty",
    "order": 33,
    "status": "active"
  }
];

const INITIAL_BLOGS = [
  {
    title: 'The Intelligence Behind a Joint: How Traditional Joinery Is Inspiring Modern Furniture Design',
    slug: 'the-intelligence-behind-a-joint',
    excerpt:
      'For centuries, craftspeople have engineered interlocking wooden joints that stand the test of time. Discover how traditional wood joinery is inspiring JODO’s modern, tool-free, screw-free furniture design.',
    content: `Furniture design today involves more than choosing the right wood, finish, or shape. The way individual pieces connect matters too. For centuries, craftspeople have engineered joints in wooden components that have stood the test of time, proving how the right joinery influences furniture function and appearance.

As lifestyles evolve, people are looking for practical, adaptable furniture that is easier to put together. Traditional joinery offers a useful starting point for JODO’s innovation in the tool-free assembly space.

## What Is Traditional Wood Joinery and How Does It Work?

Traditional wood joinery techniques are methods of connecting two or more pieces of wood to create a stable structure through carefully shaped edges, slots, grooves, and interlocking forms instead of using modern-day tools.

Common examples include mortise-and-tenon, dovetail, and tongue-and-groove joints. Each has a different design and purpose. It is known to be the oldest form of joinery technique with its roots primarily in India, Japan, and China.

The underlying idea is simple: the shape and fit of a connection matter. Good joinery depends on accuracy, the intended use of the furniture, and the properties of the material. It shows how furniture design intelligence can lie in details that are not immediately visible.

## How Traditional Joinery Techniques Hold Furniture Together Without Screws

The geometry of the pieces helps guide how they fit and how the connection behaves during use. Depending on the joint and application, the design may also use adhesive, wedges, or other supporting elements.

This is why furniture joinery techniques are more than simply joining two pieces. The dimensions, direction of the grain, fit, and intended load all influence how a joint performs. A connection designed for a drawer, for example, may have different requirements from one used in a table frame.

No single joint is right for every application; the choice depends on the design and the job the connection needs to do.

## From Traditional Wood Joinery to Modern Tool-Free Furniture Design

Traditional joinery demonstrates how considered connections can shape furniture. Modern designers continue to explore this principle, using contemporary materials, manufacturing methods, and product engineering to create furniture that fits today's needs.

People move, rearrange rooms, and adapt spaces for work, study, and everyday living. Furniture that is designed for convenience with clear, intuitive connectors can make assembly and reconfiguration feel more approachable.

For JODO, this wider shift towards screw-free, tool-free thinking is part of a more modern conversation about how the future of furniture should fit into everyday life.

## How Modern Tool-Free Furniture Is Redefining the Way We Assemble Furniture

Modern furniture design is increasingly looking at the entire ownership experience, not just the finished product. Assembly is one part of that experience: clear instructions, zero tools, and thoughtfully designed components and connections that handle daily wear and tear.

Beyond appearance and dimensions, homeowners can now consider how a product comes together, whether assembly suits their needs, and how it may fit into a changing home. These are useful questions to ask when exploring modern furniture options.

## Explore a Smarter Approach to Modern Furniture with JODO Furniture

Traditional craftspeople paid close attention to how pieces connected; JODO continues to explore that idea with new materials, engineering, and assembly approaches for people who want furniture that feels considered, functional, and tailored to their living.

JODO is part of this evolving conversation, with a focus on screw-free, tool-free, and easy-to-assemble furniture. If you are exploring furniture for a home that may change with your routines, space, or needs, look beyond the finish and ask how the design works around your lifestyle by discovering JODO's approach to building smarter homes.

## Frequently Asked Questions

### 1. What is traditional wood joinery in furniture making?

Traditional wood joinery is a woodworking technique used to connect two or more pieces of wood through carefully shaped joints, grooves, or interlocking sections. Common examples include mortise-and-tenon, dovetail, and tongue-and-groove joints.

### 2. How does traditional joinery hold furniture together without screws?

Traditional joinery uses precisely shaped wooden sections that fit together to create a connection which tightens under pressure over a period of time. Depending on the joint, the design may also use adhesives, wedges, or other supporting elements to achieve the required fit and stability.

### 3. What is tool-free furniture, and how does it work?

Tool-free furniture is designed to make assembly simpler by reducing or eliminating the need for separate tools. Its components connect through purpose-designed fittings or connector mechanisms.

### 4. Is screw-free furniture suitable for modern homes?

Yes. Screw-free furniture is the need of the hour for modern living where convenience, clean design, and flexible living spaces matter. The right choice depends on the furniture's intended use, materials, construction, and design.

### 5. How is traditional joinery influencing modern furniture design?

Traditional joinery inspires modern furniture designers to think carefully about how individual components connect. This thinking reflects in JODO’s design approach towards tool-free and screw-free furniture, where the furniture is built around the connector system and not as an afterthought.`,
    category: 'Craft & Material',
    author: 'Jodo Editorial',
    authorRole: 'Design & Craft Studio',
    coverImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    readTime: '5 min read',
    featured: true,
    status: 'published',
    publishedAt: new Date(),
    tags: [
      'Tool-free furniture',
      'Traditional wood joinery',
      'Furniture joinery techniques',
      'No-screw furniture',
      'Modern furniture design',
      'Tool-free flatpack furniture',
      'Furniture without tools',
      'Screw-free furniture India',
    ],
  },
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
