import * as authService from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const REFRESH_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const signup = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.signup(req.body);

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_OPTIONS);

  return res
    .status(201)
    .json(ApiResponse.created({ user, accessToken }, "Account created"));
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_OPTIONS);

  return res
    .status(200)
    .json(ApiResponse.ok({ user, accessToken }, "Logged in"));
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const { user, accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(refreshToken);

  res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_OPTIONS);

  return res
    .status(200)
    .json(ApiResponse.ok({ accessToken }, "Token refreshed"));
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);

  const { maxAge, ...clearCookieOptions } = REFRESH_TOKEN_OPTIONS;
  res.clearCookie("refreshToken", clearCookieOptions);

  return res.status(200).json(ApiResponse.ok(null, "Logged out"));
});

export const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(ApiResponse.ok(req.user));
});

export const oauthCallback = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.oauthLogin(
    req.body
  );

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_OPTIONS);

  return res
    .status(200)
    .json(ApiResponse.ok({ user, accessToken }, "OAuth authenticated"));
});
