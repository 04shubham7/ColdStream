import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
      return next(ApiError.badRequest(`Validation failed: ${messages}`));
    }
    return next(error);
  }
};
