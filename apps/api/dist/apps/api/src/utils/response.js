"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendCreated = sendCreated;
exports.sendError = sendError;
exports.sendUnauthorized = sendUnauthorized;
exports.sendForbidden = sendForbidden;
exports.sendNotFound = sendNotFound;
exports.sendPaginated = sendPaginated;
function sendSuccess(res, data, message, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        data,
        message,
    });
}
function sendCreated(res, data, message) {
    return sendSuccess(res, data, message, 201);
}
function sendError(res, message, statusCode = 400, errors) {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
}
function sendUnauthorized(res, message = 'Unauthorized') {
    return sendError(res, message, 401);
}
function sendForbidden(res, message = 'Forbidden') {
    return sendError(res, message, 403);
}
function sendNotFound(res, resource = 'Resource') {
    return sendError(res, `${resource} not found`, 404);
}
function sendPaginated(res, data, pagination) {
    const { page, limit, total } = pagination;
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore: page < totalPages,
        },
    });
}
//# sourceMappingURL=response.js.map