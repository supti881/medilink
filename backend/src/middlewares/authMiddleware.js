import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Check if user is logged in
export const protect = async (req, res, next) => {
  // console.log('hitted here')
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token && req.cookies?.medilink_token) {
      token = req.cookies.medilink_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login first.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded",decoded)

    const user = await User.findById(decoded.id);
    // console.log(user)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Authorization failed.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      error: error.message,
    });
  }
};

// Check user role
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User information not found. Please login again.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};