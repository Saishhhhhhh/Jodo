"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateQuery = validateQuery;
const response_1 = require("../utils/response");
/**
 * Zod validation middleware factory.
 * Validates req.body against a Zod schema.
 */
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = {};
            for (const issue of result.error.issues) {
                const path = issue.path.join('.');
                errors[path] = issue.message;
            }
            (0, response_1.sendError)(res, 'Validation failed', 422, errors);
            return;
        }
        req.body = result.data;
        next();
    };
}
/**
 * Zod validation middleware for query params.
 */
function validateQuery(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const errors = {};
            for (const issue of result.error.issues) {
                const path = issue.path.join('.');
                errors[path] = issue.message;
            }
            (0, response_1.sendError)(res, 'Invalid query parameters', 422, errors);
            return;
        }
        req.query = result.data;
        next();
    };
}
//# sourceMappingURL=validate.js.map