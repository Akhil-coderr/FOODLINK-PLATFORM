const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const DonorProfile = require("../models/DonorProfile");
const NGOProfile = require("../models/NGOProfile");
const VolunteerProfile = require("../models/VolunteerProfile");
const { generateTokens, hashToken } = require("../utils/token");
const { sendPasswordResetEmail } = require("../services/emailService");
const {
  generateOAuthState,
  verifyOAuthState,
  getGoogleAuthUrl,
  exchangeGoogleCode,
} = require("../services/oauthService");

const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://foodlink-platform.onrender.com";
const JWT_SECRET =
  process.env.JWT_ACCESS_SECRET || "foodlink_jwt_access_secret_dev_2026";

/**
 * Dynamically resolves callback and frontend URLs based on the incoming request.
 * Automatically adapts between local development (localhost) and production (Render/custom domain).
 */
const getOAuthUrls = (req) => {
  const host = req.get("host") || "";
  const isRenderHost = host.includes("onrender.com");
  const isProduction = process.env.NODE_ENV === "production" || isRenderHost;

  let callbackUrl;
  let frontendUrl;

  if (isProduction || isRenderHost) {
    const proto =
      req.headers["x-forwarded-proto"] || (req.secure ? "https" : "https");
    const base = `${proto}://${host}`;
    callbackUrl = `${base}/api/auth/google/callback`;
    frontendUrl = base;
  } else {
    // Local development
    callbackUrl =
      process.env.GOOGLE_CALLBACK_URL ||
      `http://${host || "localhost:5000"}/api/auth/google/callback`;
    frontendUrl =
      process.env.FRONTEND_URL || "https://foodlink-platform.onrender.com";
  }

  return { callbackUrl, frontendUrl };
};

const isDbUnavailable = (error) =>
  Boolean(
    error &&
    (error.name === "MongoServerSelectionError" ||
      error.name === "MongoNetworkError" ||
      /MongoServerSelectionError|MongoNetworkError|Client network socket disconnected|secure TLS connection/i.test(
        error.message || "",
      )),
  );

// Helper to set cookie
const attachCookie = (res, token) => {
  res.cookie("foodlink_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

exports.registerDonor = async (req, res, next) => {
  let createdUser = null;
  try {
    const {
      name,
      email,
      phone,
      password,
      organizationName,
      organizationType,
      address,
      city,
      state,
      postalCode,
      location,
      profileImage,
    } = req.body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Valid email address is required" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "An account with this email already exists. Please sign in instead.",
        });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    createdUser = await User.create({
      name: (name || "").trim(),
      email: normalizedEmail,
      phone: (phone || "").trim(),
      passwordHash,
      role: "donor",
      address: address || "",
      city: city || "Coimbatore",
      state: state || "Tamil Nadu",
      postalCode: postalCode || "",
      location: location || { type: "Point", coordinates: [76.9558, 11.0168] },
      profileImage: profileImage || "",
    });

    const donorProfile = await DonorProfile.create({
      userId: createdUser._id,
      organizationName: organizationName || name,
      organizationType: organizationType || "restaurant",
      totalDonations: 0,
    });

    const { accessToken } = generateTokens(createdUser);
    attachCookie(res, accessToken);

    const userObj = createdUser.toObject();
    delete userObj.passwordHash;
    userObj.donorProfile = donorProfile;

    res.status(201).json({
      success: true,
      message: "Donor account created successfully",
      data: { user: userObj, token: accessToken },
    });
  } catch (error) {
    if (createdUser && createdUser._id) {
      await User.findByIdAndDelete(createdUser._id).catch(() => {});
    }
    next(error);
  }
};

exports.registerNGO = async (req, res, next) => {
  let createdUser = null;
  try {
    const {
      name,
      email,
      phone,
      password,
      organizationName,
      registrationNumber,
      documents,
      address,
      city,
      state,
      postalCode,
      location,
      receivingCapacityKg,
      acceptedFoodCategories,
      operatingHours,
      description,
    } = req.body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Valid email address is required" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "An account with this email already exists. Please sign in instead.",
        });
    }

    const regNum = (registrationNumber || "").trim();
    if (!regNum) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Legal registration number is required",
        });
    }

    const existingReg = await NGOProfile.findOne({
      registrationNumber: regNum,
    });
    if (existingReg) {
      return res.status(400).json({
        success: false,
        message: "An NGO with this registration number already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    createdUser = await User.create({
      name: (name || "").trim(),
      email: normalizedEmail,
      phone: (phone || "").trim(),
      passwordHash,
      role: "ngo",
      address: address || "",
      city: city || "Coimbatore",
      state: state || "Tamil Nadu",
      postalCode: postalCode || "",
      location: location || { type: "Point", coordinates: [76.9616, 11.0045] },
    });

    const ngoProfile = await NGOProfile.create({
      userId: createdUser._id,
      organizationName: organizationName || name,
      registrationNumber: regNum,
      documents: documents || [],
      verificationStatus: "pending", // Pending admin verification
      receivingCapacityKg: Number(receivingCapacityKg) || 100,
      acceptedFoodCategories: acceptedFoodCategories || [],
      operatingHours: operatingHours || { hours: "08:00 AM - 09:00 PM" },
      description: description || "",
    });

    const { accessToken } = generateTokens(createdUser);
    attachCookie(res, accessToken);

    const userObj = createdUser.toObject();
    delete userObj.passwordHash;
    userObj.ngoProfile = ngoProfile;

    res.status(201).json({
      success: true,
      message:
        "NGO registered successfully. Account is pending administrative verification.",
      data: { user: userObj, token: accessToken },
    });
  } catch (error) {
    if (createdUser && createdUser._id) {
      await User.findByIdAndDelete(createdUser._id).catch(() => {});
    }
    next(error);
  }
};

exports.registerVolunteer = async (req, res, next) => {
  let createdUser = null;
  try {
    const {
      name,
      email,
      phone,
      password,
      address,
      city,
      state,
      postalCode,
      location,
      transportType,
      maximumCapacityKg,
      serviceRadiusKm,
      availability,
    } = req.body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Valid email address is required" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "An account with this email already exists. Please sign in instead.",
        });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    createdUser = await User.create({
      name: (name || "").trim(),
      email: normalizedEmail,
      phone: (phone || "").trim(),
      passwordHash,
      role: "volunteer",
      address: address || "",
      city: city || "Coimbatore",
      state: state || "Tamil Nadu",
      postalCode: postalCode || "",
      location: location || { type: "Point", coordinates: [76.9558, 11.0168] },
    });

    const volunteerProfile = await VolunteerProfile.create({
      userId: createdUser._id,
      transportType: transportType || "bike",
      maximumCapacityKg: Number(maximumCapacityKg) || 25,
      serviceRadiusKm: Number(serviceRadiusKm) || 15,
      availability: availability !== undefined ? availability : true,
      totalPoints: 0,
      completedTasks: 0,
      achievements: ["Community Newcomer"],
    });

    const { accessToken } = generateTokens(createdUser);
    attachCookie(res, accessToken);

    const userObj = createdUser.toObject();
    delete userObj.passwordHash;
    userObj.volunteerProfile = volunteerProfile;

    res.status(201).json({
      success: true,
      message: "Volunteer registered successfully",
      data: { user: userObj, token: accessToken },
    });
  } catch (error) {
    if (createdUser && createdUser._id) {
      await User.findByIdAndDelete(createdUser._id).catch(() => {});
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash",
    );
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (!user.passwordHash) {
      const providers =
        (user.authProviders || []).map((p) => p.provider).join(", ") ||
        "social login";
      return res.status(400).json({
        success: false,
        message: `This account was registered using ${providers}. Please sign in using your social account or use Forgot Password to set a password.`,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (user.accountStatus === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Account suspended. Please contact platform administrators.",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken } = generateTokens(user);
    attachCookie(res, accessToken);

    const userObj = user.toObject();
    delete userObj.passwordHash;

    // Attach role-specific profile
    if (user.role === "donor") {
      userObj.donorProfile = await DonorProfile.findOne({ userId: user._id });
    } else if (user.role === "ngo") {
      userObj.ngoProfile = await NGOProfile.findOne({ userId: user._id });
    } else if (user.role === "volunteer") {
      userObj.volunteerProfile = await VolunteerProfile.findOne({
        userId: user._id,
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      data: { user: userObj, token: accessToken },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userObj = user.toObject();

    if (user.role === "donor") {
      userObj.donorProfile = await DonorProfile.findOne({ userId: user._id });
    } else if (user.role === "ngo") {
      userObj.ngoProfile = await NGOProfile.findOne({ userId: user._id });
    } else if (user.role === "volunteer") {
      userObj.volunteerProfile = await VolunteerProfile.findOne({
        userId: user._id,
      });
    }

    res.json({
      success: true,
      data: userObj,
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.clearCookie("foodlink_token");
  res.json({ success: true, message: "Logged out successfully" });
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    // Constant generic message prevents account enumeration
    const genericResponse = {
      success: true,
      message:
        "If that email address is registered with FoodLink, a password reset link has been dispatched. Please check your inbox and spam folder.",
    };

    if (!normalizedEmail) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide a valid email address.",
        });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.json(genericResponse);
    }

    // Generate 32-byte cryptographically secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store SHA-256 hash in database with 15-minute expiration
    user.resetPasswordTokenHash = hashToken(rawToken);
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    try {
      await sendPasswordResetEmail(user, rawToken);
    } catch (emailErr) {
      console.error(
        "[EMAIL ERROR] Failed to send password reset email:",
        emailErr.message,
      );
      // Return generic success to avoid leaking server state or email existence
    }

    return res.json(genericResponse);
  } catch (error) {
    next(error);
  }
};

exports.verifyResetToken = async (req, res, next) => {
  try {
    const token = req.params.token || req.query.token;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Password reset token is missing." });
    }

    const tokenHash = hashToken(token);

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Password reset link is invalid or has expired. Please request a new one.",
      });
    }

    res.json({
      success: true,
      message: "Reset token is valid.",
      data: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token || req.body.token;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Password reset token is missing." });
    }

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "New password is required." });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match." });
    }

    // Strong password validation: min 8 chars, uppercase, lowercase, number, special char
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const tokenHash = hashToken(token);

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Password reset link is invalid or has expired. Please request a new one.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    // Invalidate the token immediately upon single use
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message:
        "Your password has been successfully reset. You can now log in with your new credentials.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dedicated Admin Login
 * Strictly checks that the account role is 'admin'
 */
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Administrator email and password required",
        });
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash",
    );
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid administrator credentials" });
    }

    if (!user.passwordHash) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid administrator credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid administrator credentials" });
    }

    // Role verification: strictly require 'admin'
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. This portal is restricted to authorized administrators.",
      });
    }

    if (user.accountStatus === "suspended") {
      return res.status(403).json({
        success: false,
        message:
          "Administrator account suspended. Contact root security personnel.",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken } = generateTokens(user);
    attachCookie(res, accessToken);

    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json({
      success: true,
      message: "Administrator authentication successful",
      data: { user: userObj, token: accessToken },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate Google OAuth Flow
 */
exports.googleAuth = async (req, res, next) => {
  try {
    const { callbackUrl, frontendUrl } = getOAuthUrls(req);
    // Cryptographically embed callbackUrl and frontendUrl in the signed OAuth state
    const state = generateOAuthState("google", { callbackUrl, frontendUrl });
    const authUrl = getGoogleAuthUrl(state, callbackUrl);

    if (!authUrl) {
      return res.redirect(
        `${frontendUrl}/login?oauthError=${encodeURIComponent(
          "Google OAuth is not configured on this server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
        )}`,
      );
    }

    res.redirect(authUrl);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Google OAuth Callback
 */
exports.googleCallback = async (req, res, next) => {
  // Determine fallback URLs based on current request
  const defaultUrls = getOAuthUrls(req);
  let effectiveFrontendUrl = defaultUrls.frontendUrl;
  let effectiveCallbackUrl = defaultUrls.callbackUrl;

  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `${effectiveFrontendUrl}/login?oauthError=${encodeURIComponent(error)}`,
      );
    }

    if (!code || !state) {
      return res.redirect(
        `${effectiveFrontendUrl}/login?oauthError=${encodeURIComponent("Missing authorization code or state parameter")}`,
      );
    }

    let decodedState;
    try {
      decodedState = verifyOAuthState(state, "google");
      if (decodedState?.frontendUrl) {
        effectiveFrontendUrl = decodedState.frontendUrl;
      }
      if (decodedState?.callbackUrl) {
        effectiveCallbackUrl = decodedState.callbackUrl;
      }
    } catch (err) {
      return res.redirect(
        `${effectiveFrontendUrl}/login?oauthError=${encodeURIComponent(err.message)}`,
      );
    }

    const profile = await exchangeGoogleCode(code, effectiveCallbackUrl);
    const normalizedGoogleEmail = (profile.email || "").trim().toLowerCase();

    // 1. Check if user already linked with Google provider ID
    let user = await User.findOne({
      "authProviders.provider": "google",
      "authProviders.providerId": profile.providerId,
    });

    if (user) {
      if (user.accountStatus === "suspended") {
        return res.redirect(
          `${effectiveFrontendUrl}/login?oauthError=${encodeURIComponent("Account is suspended. Please contact support.")}`,
        );
      }

      user.lastLogin = new Date();
      await user.save();

      const { accessToken } = generateTokens(user);
      attachCookie(res, accessToken);

      return res.redirect(
        `${effectiveFrontendUrl}/auth/callback?token=${accessToken}&role=${user.role}`,
      );
    }

    // 2. Check if user exists by verified email for secure account linking
    if (normalizedGoogleEmail) {
      if (!profile.isEmailVerified) {
        return res.redirect(
          `${effectiveFrontendUrl}/login?oauthError=${encodeURIComponent("Google email is not verified. Please verify your Google account before signing in.")}`,
        );
      }

      user = await User.findOne({ email: normalizedGoogleEmail });
      if (user) {
        if (user.accountStatus === "suspended") {
          return res.redirect(
            `${effectiveFrontendUrl}/login?oauthError=${encodeURIComponent("Account is suspended. Please contact support.")}`,
          );
        }

        // Link Google provider only if not already present
        const alreadyLinked = (user.authProviders || []).some(
          (p) => p.provider === "google" && p.providerId === profile.providerId,
        );

        if (!alreadyLinked) {
          user.authProviders.push({
            provider: "google",
            providerId: profile.providerId,
            email: normalizedGoogleEmail,
            linkedAt: new Date(),
          });
        }

        user.isEmailVerified = true;
        user.lastLogin = new Date();
        await user.save();

        const { accessToken } = generateTokens(user);
        attachCookie(res, accessToken);

        return res.redirect(
          `${effectiveFrontendUrl}/auth/callback?token=${accessToken}&role=${user.role}`,
        );
      }
    }

    // 3. New user - redirect to controlled role onboarding
    const onboardingToken = jwt.sign(
      {
        oauthProfile: {
          provider: "google",
          providerId: profile.providerId,
          email: normalizedGoogleEmail,
          name: profile.name,
          profileImage: profile.profileImage,
        },
      },
      JWT_SECRET,
      { expiresIn: "30m" },
    );

    return res.redirect(
      `${effectiveFrontendUrl}/auth/oauth-onboarding?oauthToken=${onboardingToken}&provider=google&email=${encodeURIComponent(
        normalizedGoogleEmail,
      )}&name=${encodeURIComponent(profile.name || "")}`,
    );
  } catch (error) {
    if (isDbUnavailable(error)) {
      console.error(
        `⚠️  Google OAuth callback: database unavailable (${error.message})`,
      );
      return res.redirect(
        `${effectiveFrontendUrl}/login?oauthError=${encodeURIComponent(
          "Database temporarily unavailable. Please try again in a moment.",
        )}`,
      );
    }

    console.error("Google OAuth Callback Error:", error);
    return res.redirect(
      `${effectiveFrontendUrl}/login?oauthError=${encodeURIComponent(error.message || "Google authentication failed")}`,
    );
  }
};

/**
 * Complete First-Time OAuth Registration (Role Onboarding)
 * Never allows role = admin
 */
exports.oauthOnboard = async (req, res, next) => {
  try {
    const {
      onboardingToken,
      role,
      phone,
      address,
      city,
      state,
      postalCode,
      location,
      organizationName,
      organizationType,
      registrationNumber,
      receivingCapacityKg,
      acceptedFoodCategories,
      operatingHours,
      description,
      transportType,
      maximumCapacityKg,
      serviceRadiusKm,
    } = req.body;

    if (!onboardingToken) {
      return res
        .status(400)
        .json({ success: false, message: "Onboarding session token required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(onboardingToken, JWT_SECRET);
    } catch (err) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Onboarding session has expired. Please sign in again.",
        });
    }

    const { oauthProfile } = decoded;
    if (!oauthProfile || !oauthProfile.provider || !oauthProfile.providerId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid onboarding payload" });
    }

    // Strict role check: only donor, ngo, or volunteer
    if (!["donor", "ngo", "volunteer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role selected. Public onboarding supports Donor, NGO, and Volunteer roles only.",
      });
    }

    // Ensure email is not already taken
    const normalizedOauthEmail = (oauthProfile.email || "")
      .trim()
      .toLowerCase();
    const existing = await User.findOne({ email: normalizedOauthEmail });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "An account with this email already exists. Please sign in instead.",
        });
    }

    const user = await User.create({
      name: oauthProfile.name,
      email: normalizedOauthEmail,
      phone: phone || "0000000000",
      role,
      profileImage: oauthProfile.profileImage || "",
      address: address || "",
      city: city || "Coimbatore",
      state: state || "Tamil Nadu",
      postalCode: postalCode || "",
      location: location || { type: "Point", coordinates: [76.9558, 11.0168] },
      isEmailVerified: true,
      authProviders: [
        {
          provider: oauthProfile.provider,
          providerId: oauthProfile.providerId,
          email: oauthProfile.email,
          linkedAt: new Date(),
        },
      ],
    });

    let roleProfile;
    if (role === "donor") {
      roleProfile = await DonorProfile.create({
        userId: user._id,
        organizationName: organizationName || user.name,
        organizationType: organizationType || "other",
        totalDonations: 0,
      });
    } else if (role === "ngo") {
      roleProfile = await NGOProfile.create({
        userId: user._id,
        organizationName: organizationName || user.name,
        registrationNumber: registrationNumber || `NGO-${Date.now()}`,
        verificationStatus: "pending", // Pending admin approval
        receivingCapacityKg: Number(receivingCapacityKg) || 100,
        acceptedFoodCategories: acceptedFoodCategories || [],
        operatingHours: operatingHours || { hours: "08:00 AM - 09:00 PM" },
        description: description || "",
      });
    } else if (role === "volunteer") {
      roleProfile = await VolunteerProfile.create({
        userId: user._id,
        transportType: transportType || "bike",
        maximumCapacityKg: Number(maximumCapacityKg) || 25,
        serviceRadiusKm: Number(serviceRadiusKm) || 15,
        availability: true,
        totalPoints: 0,
        completedTasks: 0,
        achievements: ["Community Newcomer"],
      });
    }

    const { accessToken } = generateTokens(user);
    attachCookie(res, accessToken);

    const userObj = user.toObject();
    if (role === "donor") userObj.donorProfile = roleProfile;
    else if (role === "ngo") userObj.ngoProfile = roleProfile;
    else if (role === "volunteer") userObj.volunteerProfile = roleProfile;

    res.status(201).json({
      success: true,
      message: "Account successfully registered and profile configured.",
      data: { user: userObj, token: accessToken },
    });
  } catch (error) {
    next(error);
  }
};
