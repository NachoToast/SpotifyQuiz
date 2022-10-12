import { ErrorRequestHandler } from 'express';

/**
 * Standardized error format to return.
 *
 * ```ts
 *  {
 *    message: "error message",
 *    errors: (any)
 *  }
 * ```
 */
const customErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        message: err.message ?? 'Unknown error occurred',
        errors: err.errors,
    });
};

export default customErrorHandler;
