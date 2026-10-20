
import { Task } from "../../../models/index.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validatePayload = (payload) => {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw createError("Request body must be an object", 400);
  }
};

const validateTaskId = (id) => {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id || "")) {
    throw createError("Invalid task ID", 400);
  }
};

export const createTaskForUser = async (userId, payload) => {
  validatePayload(payload);

  const { title, description } = payload;

  if (typeof title !== "string" || !title.trim()) {
    throw createError("Task title is required", 400);
  }

  if (title.trim().length > 150) {
    throw createError("Task title cannot exceed 150 characters", 400);
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    throw createError("Description must be text", 400);
  }

  const task = await Task.create({
    title: title.trim(),
    description:
      typeof description === "string"
        ? description.trim() || null
        : null,
    userId,
  });

  return task;
};

export const getUserTasks = async (userId) => {
  return Task.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });
};

export const getUserTaskById = async (userId, taskId) => {
  validateTaskId(taskId);

  const task = await Task.findOne({
    where: {
      id: taskId,
      userId,
    },
  });

  if (!task) {
    throw createError("Task not found", 404);
  }

  return task;
};

export const updateUserTask = async (
  userId,
  taskId,
  payload
) => {
  validatePayload(payload);
  validateTaskId(taskId);

  const allowedFields = new Set([
    "title",
    "description",
    "isCompleted",
  ]);

  const fields = Object.keys(payload);

  if (fields.length === 0) {
    throw createError("Provide at least one field to update", 400);
  }

  if (fields.some((field) => !allowedFields.has(field))) {
    throw createError("Request contains unsupported fields", 400);
  }

  const updates = {};

  if (Object.hasOwn(payload, "title")) {
    if (
      typeof payload.title !== "string" ||
      !payload.title.trim()
    ) {
      throw createError("Task title cannot be empty", 400);
    }

    if (payload.title.trim().length > 150) {
      throw createError(
        "Task title cannot exceed 150 characters",
        400
      );
    }

    updates.title = payload.title.trim();
  }

  if (Object.hasOwn(payload, "description")) {
    if (
      payload.description !== null &&
      typeof payload.description !== "string"
    ) {
      throw createError("Description must be text or null", 400);
    }

    updates.description =
      typeof payload.description === "string"
        ? payload.description.trim() || null
        : null;
  }

  if (Object.hasOwn(payload, "isCompleted")) {
    if (typeof payload.isCompleted !== "boolean") {
      throw createError("isCompleted must be true or false", 400);
    }

    updates.isCompleted = payload.isCompleted;
  }

  // Always check both task ID and authenticated user ID.
  const task = await Task.findOne({
    where: {
      id: taskId,
      userId,
    },
  });

  if (!task) {
    throw createError("Task not found", 404);
  }

  await task.update(updates);

  return task;
};

export const deleteUserTask = async (userId, taskId) => {
  const task = await getUserTaskById(userId, taskId);

  await task.destroy();

  return task.id;
};
