
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../../models/index.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const safeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
});

export const registerUser = async (payload = {}) => {
  const { fullName, email, password } = payload;

  if (
    typeof fullName !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !fullName.trim() ||
    !email.trim() ||
    !password
  ) {
    throw createError(
      "Full name, email and password are required",
      400
    );
  }

  if (fullName.trim().length > 100) {
    throw createError("Full name is too long", 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw createError("Please enter a valid email address", 400);
  }

  if (password.length < 8) {
    throw createError(
      "Password must be at least 8 characters",
      400
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw createError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  const token = createToken(user.id);

  return {
    user: safeUser(user),
    token,
  };
};

export const loginUser = async (payload = {}) => {
  const { email, password } = payload;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    throw createError("Email and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    where: { email: normalizedEmail },
  });

  // Use the same message for an unknown email and wrong password.
  if (!user) {
    throw createError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw createError("Invalid email or password", 401);
  }

  const token = createToken(user.id);

  return {
    user: safeUser(user),
    token,
  };
};
