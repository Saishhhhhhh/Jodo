"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
const Store_1 = require("./models/Store");
const Banner_1 = require("./models/Banner");
const HERO_SLIDES = [
    {
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=2000&q=85",
        tagline: "The Joy of Together",
        heading: "Furniture That Brings You Closer",
        subtext: "No tools. No confusion. Just you, your people, and furniture that slides into place like a good moment."
    },
    {
        image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85",
        tagline: "A New Way to Experience Furniture",
        heading: "Put It Together. Make It Yours.",
        subtext: "JODO furniture assembles like a jigsaw puzzle: less fuss, more fun. Enjoy the quiet satisfaction of building with your hands."
    },
    {
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85",
        tagline: "Built Different. Felt Together.",
        heading: "Convenience Without Compromise",
        subtext: "Great design, serious quality. JODO builds pieces to deliver, endure and last without compromise"
    }
];
async function seed() {
    try {
        await (0, db_1.connectDB)();
        const store = await Store_1.Store.findOne();
        if (!store) {
            console.log('No store found, cannot seed banners.');
            process.exit(1);
        }
        const existingCount = await Banner_1.Banner.countDocuments();
        if (existingCount > 0) {
            console.log('Banners already exist.');
            process.exit(0);
        }
        for (let i = 0; i < HERO_SLIDES.length; i++) {
            const slide = HERO_SLIDES[i];
            await Banner_1.Banner.create({
                tenantId: store.tenantId,
                storeId: store._id,
                image: slide.image,
                tagline: slide.tagline,
                heading: slide.heading,
                subtext: slide.subtext,
                buttonText: 'Discover Now',
                buttonUrl: '/shop',
                order: i,
                status: 'active'
            });
        }
        console.log('Successfully seeded banners!');
        process.exit(0);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed-banners.js.map