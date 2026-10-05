"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../config/env");
const db_1 = require("../config/db");
const Tenant_1 = require("../models/Tenant");
const Store_1 = require("../models/Store");
const User_1 = require("../models/User");
const Task_1 = require("../models/Task");
async function seedCustomTasks() {
    console.log('Seeding custom tasks for Sales, Operations, Content, Support and Follow-ups...');
    await (0, db_1.connectDB)();
    const tenant = await Tenant_1.Tenant.findOne();
    const store = await Store_1.Store.findOne();
    let adminUser = await User_1.User.findOne();
    const tenantId = tenant?._id;
    const storeId = store?._id;
    const userId = adminUser?._id;
    if (!tenantId || !storeId || !userId) {
        console.error('Missing tenant, store, or admin user');
        await (0, db_1.disconnectDB)();
        return;
    }
    // Find or create assigned user
    let assignedUser = await User_1.User.findOne({ name: /Kaveri Valve/i });
    if (!assignedUser) {
        assignedUser = adminUser;
    }
    const tasksToCreate = [
        {
            tenantId,
            storeId,
            title: 'Q4 Wholesale Buyer Follow-up & Contract Renegotiation',
            description: 'Follow up with regional retail distributors regarding bulk winter stock commitments and updated wholesale tier pricing.',
            clientBrief: 'Key account: Metro Apparel Group. Target 2,000 units minimum order quantity for denim and fleece jackets.',
            category: 'Sales',
            department: 'Sales',
            team: 'Sales',
            taskType: 'Follow-up',
            priority: 'High',
            status: 'In Progress',
            assignedTo: assignedUser._id,
            createdBy: userId,
            clientName: 'Metro Apparel Group',
            projectName: 'Wholesale Winter Expansion',
            projectDeliverable: 'Signed Distributor Purchase Agreement',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days left
            loggedDuration: 3720, // 1h 02m 00s
            timerRunning: false,
        },
        {
            tenantId,
            storeId,
            title: 'Warehouse Inwarding & Gate 4 Tolerance Audit Verification',
            description: 'Audit incoming shipment from Sterling Garments. Cross-check fabric GSM, stitching tolerances, and barcode scans.',
            clientBrief: 'Check 2,500 units of Organic Cotton T-Shirt (BATCH-26A-02). Log any stitching defects directly into QC bay.',
            category: 'Operations',
            department: 'Operations',
            team: 'Operations',
            taskType: 'Review',
            priority: 'Medium',
            status: 'Pending',
            assignedTo: assignedUser._id,
            createdBy: userId,
            clientName: 'Sterling Garments Ltd',
            projectName: 'Production Batch 26A Audit',
            projectDeliverable: 'Gate 4 Quality Inspection Certificate',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days left
            loggedDuration: 0,
            timerRunning: false,
        },
        {
            tenantId,
            storeId,
            title: 'Customer Escalation Review: Order Inward & Return Authorizations',
            description: 'Resolve 4 pending exchange requests for size deviations and review automated refund triggers.',
            clientBrief: 'Verify customer tracking receipts, approve replacement dispatches, and update CRM ticket notes.',
            category: 'Support',
            department: 'Support',
            team: 'Support',
            taskType: 'Customer Issue',
            priority: 'Medium',
            status: 'In Progress',
            assignedTo: assignedUser._id,
            createdBy: userId,
            clientName: 'Direct Shopper Care',
            projectName: 'Support Escalations',
            projectDeliverable: 'Resolution of 4 high-priority returns',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days left
            loggedDuration: 1860, // 31m 00s
            timerRunning: false,
        },
        {
            tenantId,
            storeId,
            title: 'Supplier Lead Time Follow-up for Raw Fabric Consignment',
            description: 'Call yarn mill to expedite courier dispatch of sample denim rolls before scheduled manufacturing run.',
            clientBrief: 'Vanguard Textiles dispatch is due. Confirm air cargo airway bill number and factory receipt date.',
            category: 'Follow-up',
            department: 'Follow-up',
            team: 'Follow-up',
            taskType: 'Follow-up',
            priority: 'Urgent',
            status: 'Pending',
            assignedTo: assignedUser._id,
            createdBy: userId,
            clientName: 'Vanguard Textiles Corp',
            projectName: 'Vendor Raw Materials Procurement',
            projectDeliverable: 'Airway Bill & Dispatch Tracking URL',
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day left
            loggedDuration: 900, // 15m 00s
            timerRunning: false,
        },
        {
            tenantId,
            storeId,
            title: 'Festive Catalogue Copy & SEO Product Descriptions',
            description: 'Generate optimised titles, bullet specifications, and meta descriptions for 15 newly onboarded apparel SKUs.',
            clientBrief: 'Focus on organic cotton certifications and winter seasonal keywords. Complete review before publishing live.',
            category: 'Content',
            department: 'Content',
            team: 'Content',
            taskType: 'Content Creation',
            priority: 'Low',
            status: 'Completed',
            assignedTo: assignedUser._id,
            createdBy: userId,
            clientName: 'Arbor Decor',
            projectName: 'Festive Season Catalogue',
            projectDeliverable: '15 Live SKU Product Pages',
            dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            loggedDuration: 7200, // 2h 00m 00s
            timerRunning: false,
            completedAt: new Date(),
            completedBy: assignedUser._id,
        }
    ];
    await Task_1.Task.create(tasksToCreate);
    console.log(`Successfully seeded ${tasksToCreate.length} custom tasks.`);
    await (0, db_1.disconnectDB)();
}
seedCustomTasks();
//# sourceMappingURL=seed-custom-tasks.js.map