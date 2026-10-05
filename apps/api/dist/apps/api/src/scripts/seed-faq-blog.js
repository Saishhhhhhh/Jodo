"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../config/env");
const db_1 = require("../config/db");
const FAQ_1 = require("../models/FAQ");
const BlogPost_1 = require("../models/BlogPost");
const INITIAL_FAQS = [
    {
        "question": "What is tool-free flat-pack furniture? How is it different from the IKEA flat-pack I already know?",
        "answer": "Regular flat-pack needs screws, Allen key, some basic tools and 60 minutes of DIY, loose hardware you can lose. JODO panels slide into a connector system entirely by hand — nothing to screw in, nothing to misplace — and disassembly is just as easy unlike conventional flat-pack",
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
        "answer": "We currently sell JODO products only via our e-commerce website – www.jodoshop.com. We are in the process of getting ourselves into retail stores by 2027 first quarter",
        "category": "New to Tool-Free Furniture?",
        "order": 4,
        "status": "active"
    },
    {
        "question": "Is tool free joinery as safe as screwed-together furniture — could it loosen or come apart on its own?",
        "answer": "The connectors are engineered to slide and lock into place, not just hold by friction, so normal use and moderate load don't make them loose or cause them to come apart. Load-bearing, drop tests, multiple disassembly-assembly cycles, quality performances are tested to BIS structural safety standards",
        "category": "New to Tool-Free Furniture?",
        "order": 5,
        "status": "active"
    },
    {
        "question": "Does tool-free mean toy-like, shabby looking pieces compared to traditional screwed-on carpentry furniture?",
        "answer": "No — the connector sits within the panel instead of a visible add-on fitting, so finished pieces look like standard furniture. Once assembled, a JODO piece looks and functions like any other regular furniture",
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
        "question": "What if I assemble it and don't like it — can I return it?",
        "answer": "Return and trial period window is mentioned in our Returns and Warranty guidelines",
        "category": "New to Tool-Free Furniture?",
        "order": 8,
        "status": "active"
    },
    {
        "question": "Can I really ditch the tool box to assemble this?",
        "answer": "Yes. Every JODO piece uses our proprietary connector system — no screwdriver, no Allen key, no drilling into walls or floors. Most pieces slide together by hand in under 30 minutes approximately",
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
        "question": "I move apartments often — will this survive multiple moves?",
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
        "answer": "Yes. Materials are selected and climate-tested specifically for Indian conditions — humidity and heat cycles — not adapted from a foreign spec sheet. We use solid wood and plywood in premium laminate finish and high density foam for our upholstered SKUs",
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
        "answer": "Yes — JODO is designed and manufactured in India, built around Indian homes, climate, and usage rather than adapted from a foreign product line",
        "category": "Materials & Origin",
        "order": 21,
        "status": "active"
    },
    {
        "question": "How do I care for JODO furniture, especially in India's climate?",
        "answer": "Wipe with a soft, lightly damp cloth and dry after — avoid abrasive cleaners, harsh chemicals, and standing water. Keep pieces out of prolonged direct sunlight to prevent discolouration, and away from continuous high humidity or constant dampness where possible. Materials are chosen with Indian conditions in mind, normal care still extends the life of any furniture",
        "category": "Care & Maintenance",
        "order": 22,
        "status": "active"
    },
    {
        "question": "How is it delivered — do I need to arrange movers or a carpenter?",
        "answer": "It arrives flat-packed at your door, and you assemble it yourself, by hand — no carpenter or installer needed by default. If you'd rather have help anyway, optional Assisted Setup is available as a paid add-on.",
        "category": "Delivery & Logistics",
        "order": 23,
        "status": "active"
    },
    {
        "question": "I'd rather not assemble it myself — can I pay someone to do it for me?",
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
        "answer": "Because the connector system is modular, replacement connectors and panels can be ordered individually from JODO's website (share link) — you don't need to wait on a warranty claim or replace the whole piece",
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
    await (0, db_1.connectDB)();
    console.log('🌱 Seeding FAQs and Blog posts...');
    // 1. FAQs
    await FAQ_1.FAQ.deleteMany({});
    await FAQ_1.FAQ.insertMany(INITIAL_FAQS);
    console.log(`✅ Seeded ${INITIAL_FAQS.length} FAQs`);
    // 2. Blogs
    await BlogPost_1.BlogPost.deleteMany({});
    await BlogPost_1.BlogPost.insertMany(INITIAL_BLOGS);
    console.log(`✅ Seeded ${INITIAL_BLOGS.length} Blog posts`);
    await (0, db_1.disconnectDB)();
    console.log('🌱 Done seeding FAQ and Blog!');
}
seedFaqAndBlog().catch(console.error);
//# sourceMappingURL=seed-faq-blog.js.map