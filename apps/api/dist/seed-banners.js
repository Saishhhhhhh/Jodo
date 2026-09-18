"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
const Store_1 = require("./models/Store");
const Banner_1 = require("./models/Banner");
const HERO_SLIDES = [
    {
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=2000&q=85",
        tagline: "Crafting Comfort, Shaping Style",
        heading: "Elevating Everyday Living With Timeless Design",
        subtext: "From modern minimalist to timeless classics, our collection offers something for every taste, transforming any space into a place you'll love."
    },
    {
        image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85",
        tagline: "Minimalist Masterpieces",
        heading: "Discover the Beauty of Simple Living",
        subtext: "Embrace clean lines and uncluttered spaces. Our minimalist collection brings a sense of calm and clarity to your daily environment."
    },
    {
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85",
        tagline: "Bold & Contemporary",
        heading: "Statement Pieces For Modern Homes",
        subtext: "Make a lasting impression with our contemporary designs. Unique shapes and premium materials that define the modern aesthetic."
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