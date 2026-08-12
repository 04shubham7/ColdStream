import * as authService from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const REFRESH_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const signup = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.signup(req.body);

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_OPTIONS);

  return res
    .status(201)
    .json(ApiResponse.created({ user, accessToken }, "Account created"));
};

export const login = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_OPTIONS);

  return res
    .status(200)
    .json(ApiResponse.ok({ user, accessToken }, "Logged in"));
};

export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const { user, accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(refreshToken);

  res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_OPTIONS);

  return res
    .status(200)
    .json(ApiResponse.ok({ accessToken }, "Token refreshed"));
};

export const logout = async (req, res) => {
  await authService.logout(req.user._id);

  res.clearCookie("refreshToken", REFRESH_TOKEN_OPTIONS);

  return res.status(200).json(ApiResponse.ok(null, "Logged out"));
};

export const oauthCallback = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.oauthLogin(
    req.body
  );

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_OPTIONS);

  return res
    .status(200)
    .json(ApiResponse.ok({ user, accessToken }, "OAuth authenticated"));
};
