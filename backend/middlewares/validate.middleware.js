
export const validate = (schema, source = "body") => {
    return async (req, res, next) => {
        try {
            const validationResult = await schema.safeParseAsync(req[source]);

            if (!validationResult.success) {

                const firstIssue = validationResult.error.issues?.[0];
                const errorMsg =
                    firstIssue?.message || "Invalid request " + source;

                const error = new Error(errorMsg);
                error.status = 400;
                throw error;
            }

            req[source] = validationResult.data;
            next();
        } catch (error) {
            next(error);
        }
    };
};
