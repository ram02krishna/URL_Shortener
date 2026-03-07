/**
 * Middleware to validate a request body, query, or params against a Zod schema.
 * Automatically throws a 400 Bad Request if validation fails.
 *
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against
 * @param {string} source - The source to validate ('body', 'query', 'params')
 * @returns {import('express').RequestHandler}
 */
export const validate = (schema, source = "body") => {
    return async (req, res, next) => {
        try {
            const validationResult = await schema.safeParseAsync(req[source]);

            if (!validationResult.success) {
                // Extract the first error message or format as string
                const firstIssue = validationResult.error.issues?.[0];
                const errorMsg =
                    firstIssue?.message || "Invalid request " + source;

                // Custom error format specifically for Zod validation failures
                const error = new Error(errorMsg);
                error.status = 400;
                throw error; // Let the global error handler handle it
            }

            // Reassign the validated data to strip out any unknown fields
            req[source] = validationResult.data;
            next();
        } catch (error) {
            next(error);
        }
    };
};
