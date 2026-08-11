import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ErrorHandler from "./error.js";
import { catchAsyncError } from "./catchAsyncError.js";
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

  next();
});
