import { verifyAccessToken } from "../modules/auth/auth.jwt.js";
import { User } from "../modules/user/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Access token required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.isOperational) {
      return next(error);
    }
    return next(ApiError.unauthorized("Invalid access token"));
  }
};
