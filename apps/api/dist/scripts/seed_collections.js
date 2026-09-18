"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../config/env");
const db_1 = require("../config/db");
const Product_1 = require("../models/Product");
const Tenant_1 = require("../models/Tenant");
const Store_1 = require("../models/Store");
const Collection_1 = require("../models/Collection");
async function seedCollections() {
    console.log('🌱 Starting collections seed...');
    await (0, db_1.connectDB)();
    const tenant = await Tenant_1.Tenant.findOne();
    const store = await Store_1.Store.findOne({ tenantId: tenant?._id });
    if (!tenant || !store) {
        console.error('❌ Base data not found. Please run npm run seed first.');
        await (0, db_1.disconnectDB)();
        return;
    }
    // Clear existing collections
    console.log('🗑️ Clearing existing collections...');
    await Collection_1.Collection.deleteMany({});
    // Get all products
    const products = await Product_1.Product.find({ tenantId: tenant._id, storeId: store._id });
    if (products.length === 0) {
        console.error('❌ No products found. Please seed products first.');
        await (0, db_1.disconnectDB)();
        return;
    }
    // Group by category
    const categories = {};
    for (const product of products) {
        const cat = product.category;
        if (cat) {
            if (!categories[cat])
                categories[cat] = [];
            categories[cat].push(product._id);
        }
    }
    const collectionData = [];
    const categoryImages = {
        'Dining Room': 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800&auto=format&fit=crop&q=80',
        'Office': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
        'Living Room': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
        'Bedroom': 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&auto=format&fit=crop&q=80',
        'Outdoor': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80'
    };
    for (const [catName, productIds] of Object.entries(categories)) {
        const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        collectionData.push({
            tenantId: tenant._id,
            storeId: store._id,
            title: catName,
            slug: slug,
            description: `Shop our exclusive ${catName} furniture collection.`,
            imageUrl: categoryImages[catName] || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&auto=format&fit=crop&q=80',
            type: 'manual',
            products: productIds,
            status: 'active'
        });
    }
    await Collection_1.Collection.insertMany(collectionData);
    console.log(`✅ ${collectionData.length} Collections seeded successfully (matching the furniture products).`);
    await (0, db_1.disconnectDB)();
}
seedCollections().catch((err) => {
    console.error('❌ Collections Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed_collections.js.map