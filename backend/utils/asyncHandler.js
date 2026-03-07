/**
 * Wraps an asynchronous route handler to automatically catch any
 * unhandled exceptions and pass them to the next() middleware.
 *
 * @param {Function} requestHandler - The async route handler
 * @returns {Function} - A wrapped route handler
 */
export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};
