
import {
  registerUser,
  loginUser,
} from "../services/auth.service.js";

const handleError = (res, error) => {
  let statusCode = error.statusCode || 500;

  if (error.name === "SequelizeValidationError") {
    statusCode = 400;
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    statusCode = 409;
  }

  if (statusCode >= 500) {
    console.error("Authentication error:", error);
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : error.message,
  });
};

export const signup = async (req, res) => {
  try {
    const data = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
