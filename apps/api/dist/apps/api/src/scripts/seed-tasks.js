"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../config/env");
const db_1 = require("../config/db");
const Tenant_1 = require("../models/Tenant");
const Store_1 = require("../models/Store");
const User_1 = require("../models/User");
const Task_1 = require("../models/Task");
async function seedTasks() {
    console.log('🌱 Starting Tasks DB seeding...');
    await (0, db_1.connectDB)();
    const tenant = await Tenant_1.Tenant.findOne();
    const store = await Store_1.Store.findOne();
    let adminUser = await User_1.User.findOne();
    const tenantId = tenant?._id;
    const storeId = store?._id;
    const userId = adminUser?._id;
    if (!tenantId || !storeId || !userId) {
        console.error('Missing tenant, store or admin user');
        await (0, db_1.disconnectDB)();
        return;
    }
    // Find or create Kaveri Valve user
    let kaveriUser = await User_1.User.findOne({ name: /Kaveri Valve/i });
    if (!kaveriUser) {
        kaveriUser = await User_1.User.create({
            tenantId,
            name: 'Kaveri Valve',
            email: 'kaveri.valve@jodo.dev',
            passwordHash: 'dummyhash123',
            status: 'active',
        });
    }
    const existingCount = await Task_1.Task.countDocuments({ tenantId, storeId });
    if (existingCount < 5) {
        console.log('Seeding rich tasks matching design...');
        await Task_1.Task.create([
            {
                tenantId,
                storeId,
                title: 'Review and validate all implemented modules and features covered under JODO Scope 1 after deployment...',
                description: 'Study on .md files and cross-verify with test endpoints.',
                clientBrief: 'Verify all Scope 1 endpoints, UI workflows, and ensure no regressions.',
                category: 'Operations',
                taskType: 'Review',
                priority: 'Medium',
                status: 'Completed',
                assignedTo: kaveriUser._id,
                createdBy: userId,
                clientName: 'Arbor Decor',
                projectName: 'JODO Ecommerce Website Development',
                projectDeliverable: 'Scope 1 Module Validation Report',
                team: 'DEVELOPMENT',
                dueDate: new Date('2026-09-16'),
                loggedDuration: 79641, // 22h 07m 21s
                timerRunning: false,
                completedAt: new Date('2026-09-16T14:30:00Z'),
                completedBy: kaveriUser._id,
            },
            {
                tenantId,
                storeId,
                title: 'Review and validate all implemented modules and features covered under JODO Scope 1 after deployment.',
                description: 'Review and validate all implemented modules and features covered...',
                category: 'Operations',
                taskType: 'Documentation',
                priority: 'Medium',
                status: 'Completed',
                assignedTo: kaveriUser._id,
                createdBy: userId,
                clientName: 'Arbor Decor',
                projectName: 'JODO Ecommerce Website Development',
                team: 'DEVELOPMENT',
                dueDate: new Date('2026-09-11'),
                loggedDuration: 12179, // 3h 22m 59s
                timerRunning: false,
                completedAt: new Date('2026-09-11T16:00:00Z'),
                completedBy: kaveriUser._id,
            },
            {
                tenantId,
                storeId,
                title: 'AI Content Generation',
                description: 'Create draft product descriptions, catalogue content, listing copy and campaign briefs using OpenAI integration.',
                category: 'Content',
                taskType: 'Content Creation',
                priority: 'Medium',
                status: 'Completed',
                assignedTo: kaveriUser._id,
                createdBy: userId,
                clientName: 'Arbor Decor',
                projectName: 'JODO Ecommerce Website Development',
                team: 'DEVELOPMENT',
                dueDate: new Date('2026-09-10'),
                loggedDuration: 24379, // 6h 46m 19s
                timerRunning: false,
                completedAt: new Date('2026-09-10T18:15:00Z'),
                completedBy: kaveriUser._id,
            },
            {
                tenantId,
                storeId,
                title: 'Supply Chain Management',
                description: 'Track procurement, contract manufacturers, production orders, stock levels, and quality audit tolerance gates.',
                category: 'Operations',
                taskType: 'General',
                priority: 'Medium',
                status: 'Completed',
                assignedTo: kaveriUser._id,
                createdBy: userId,
                clientName: 'Arbor Decor',
                projectName: 'JODO Ecommerce Website Development',
                team: 'DEVELOPMENT',
                dueDate: new Date('2026-09-09'),
                loggedDuration: 26234, // 7h 17m 14s
                timerRunning: false,
                completedAt: new Date('2026-09-09T19:40:00Z'),
                completedBy: kaveriUser._id,
            },
            {
                tenantId,
                storeId,
                title: 'PUREBOT reel shoot',
                description: 'PUREBOT reel shoot in Mumbai studio. Lighting, sound and teleprompter setup.',
                category: 'Content',
                taskType: 'Content Creation',
                priority: 'Medium',
                status: 'Completed',
                assignedTo: kaveriUser._id,
                createdBy: userId,
                clientName: 'Pure Bot Solutions LLP',
                projectName: 'Social Media Campaign',
                team: 'SOCIAL MEDIA',
                dueDate: new Date('2026-09-08'),
                loggedDuration: 18751, // 5h 12m 31s
                timerRunning: false,
                completedAt: new Date('2026-09-08T15:20:00Z'),
                completedBy: kaveriUser._id,
            },
            {
                tenantId,
                storeId,
                title: 'Pure Bot shoot',
                description: 'Pure bot shooting session with product demonstration and b-roll footage.',
                category: 'Content',
                taskType: 'Content Creation',
                priority: 'Medium',
                status: 'Completed',
                assignedTo: kaveriUser._id,
                createdBy: userId,
                projectName: 'Video Production',
                team: 'DEVELOPMENT',
                dueDate: new Date('2026-09-07'),
                loggedDuration: 4, // 00:00:04
                timerRunning: false,
                completedAt: new Date('2026-09-07T12:00:00Z'),
                completedBy: kaveriUser._id,
            },
            {
                tenantId,
                storeId,
                title: 'conduct the meeting with Jodo team dissuss the scope 1 point',
                description: 'Conducted a meeting with the JODO team to discuss and understand Scope 1 deliverables and milestones.',
                category: 'Follow-up',
                taskType: 'Meeting',
                priority: 'Medium',
                status: 'Completed',
                assignedTo: kaveriUser._id,
                createdBy: userId,
                dueDate: new Date('2026-09-05'),
                loggedDuration: 3600, // 1h 00m 00s
                timerRunning: false,
                completedAt: new Date('2026-09-05T11:00:00Z'),
                completedBy: kaveriUser._id,
            },
            {
                tenantId,
                storeId,
                title: 'In-House Task Management',
                description: 'Allow the JODO team to create, assign, track and close tasks for sales, operations, content, and warehouse.',
                category: 'Operations',
                taskType: 'General',
                priority: 'Medium',
                status: 'In Progress',
                assignedTo: kaveriUser._id,
                createdBy: userId,
                dueDate: new Date('2026-09-04'),
                loggedDuration: 14400, // 4h 00m 00s
                timerRunning: true,
                timerStartedAt: new Date(),
            },
            {
                tenantId,
                storeId,
                title: 'vastuQRReviews',
                description: 'vastuQRReviews client approval and feedback analysis.',
                category: 'Support',
                taskType: 'Review',
                priority: 'Medium',
                status: 'Pending',
                assignedTo: kaveriUser._id,
                createdBy: userId,
                dueDate: new Date('2026-09-03'),
                loggedDuration: 0,
                timerRunning: false,
            },
        ]);
        console.log('✅ Tasks seeded successfully.');
    }
    console.log('🎉 Task seeding complete!');
    await (0, db_1.disconnectDB)();
}
seedTasks().catch((err) => {
    console.error('❌ Task seeding failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed-tasks.js.map