import { User } from "./user.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { encrypt } from "../../utils/encryption.js";
import { ApiError } from "../../utils/ApiError.js";

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict("Email is already in use");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true }
  );

  return res.status(200).json(ApiResponse.ok(updatedUser, "Profile updated successfully"));
});

export const updateSmtpConfig = asyncHandler(async (req, res) => {
  const { host, port, user, pass } = req.body;

  if (!host || !port || !user || !pass) {
    throw ApiError.badRequest("All SMTP fields (host, port, user, pass) are required");
  }

  // Encrypt the SMTP password
  const encryptedPass = encrypt(pass);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      smtpConfig: {
        host,
        port: parseInt(port),
        user,
        pass: encryptedPass,
      },
    },
    { new: true, runValidators: true }
  );

  // Remove encrypted pass from response
  const responseData = updatedUser.toJSON();
  if (responseData.smtpConfig) {
    delete responseData.smtpConfig.pass;
  }

  return res.status(200).json(ApiResponse.ok(responseData, "SMTP configuration updated successfully"));
});

export const getSmtpConfig = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  const responseData = {
    host: user.smtpConfig?.host || "smtp.gmail.com",
    port: user.smtpConfig?.port || 587,
    user: user.smtpConfig?.user || "",
    isConfigured: !!user.smtpConfig?.user
  };

  return res.status(200).json(ApiResponse.ok(responseData));
});
