"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchSchema = exports.PaginationSchema = void 0;
const zod_1 = require("zod");
// --- Common Pagination ---
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
// --- Common Search/Filter ---
exports.SearchSchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().optional(),
    dateTo: zod_1.z.string().optional(),
});
//# sourceMappingURL=common.js.map