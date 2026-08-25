import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ErrorHandler from "./error.js";
import { catchAsyncError } from "./catchAsyncError.js";

const ROLE_MAP = {
  Admin: "ADMIN/RECEPTIONIST",
  Reception: "ADMIN/RECEPTIONIST",
  Doctor: "DOCTOR",
  Pharmacy: "PHARMACIST",
  Patient: "PATIENT",
  Lab: "LAB",
  "X-Ray": "XRAY",
};

export const normalizeRole = (role) => ROLE_MAP[role] || role;

export const ROLE_GROUPS = {
  ADMIN_RECEPTION: "ADMIN/RECEPTIONIST",
  DOCTOR: "DOCTOR",
  PATIENT: "PATIENT",
  PHARMACIST: "PHARMACIST",
  LAB: "LAB",
  XRAY: "XRAY",
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("User is not authenticated.", 401));
    }

    const normalizedRole = normalizeRole(req.user.role);
    if (!allowedRoles.includes(normalizedRole)) {
      return next(new ErrorHandler("You are not authorized to access this resource.", 403));
    }

    next();
  };
};

export const authenticateUser = catchAsyncError(async (req, res, next) => {
  let token = req.cookies.token;

  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorHandler("User is not authenticated.", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await User.findById(decodedData.id);
  if (!req.user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  req.user.normalizedRole = normalizeRole(req.user.role);

  next();
});
