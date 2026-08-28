import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => async (req, res, next) => {
  try {
    const schemaKeys = schema.shape ? Object.keys(schema.shape) : [];
    const isWrapped = schemaKeys.length > 0 && schemaKeys.every(key => ['body', 'query', 'params'].includes(key));
    
    if (isWrapped) {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;
    } else {
      req.body = await schema.parseAsync(req.body);
    }
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const schemaKeys = schema.shape ? Object.keys(schema.shape) : [];
      const isWrapped = schemaKeys.length > 0 && schemaKeys.every(key => ['body', 'query', 'params'].includes(key));
      const messages = error.errors.map((err) => {
        const path = err.path.join(".");
        const displayPath = isWrapped ? path : (path ? `body.${path}` : "body");
        return `${displayPath}: ${err.message}`;
      }).join(", ");
      return next(ApiError.badRequest(`Validation failed: ${messages}`));
    }
    return next(error);
  }
};
