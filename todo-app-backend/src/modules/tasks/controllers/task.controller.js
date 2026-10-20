
import {
  createTaskForUser,
  getUserTasks,
  getUserTaskById,
  updateUserTask,
  deleteUserTask,
} from "../services/task.service.js";

const handleError = (res, error) => {
  let statusCode = error.statusCode || 500;

  if (
    error.name === "SequelizeValidationError" ||
    error.name === "SequelizeDatabaseError"
  ) {
    statusCode = error.name === "SequelizeValidationError"
      ? 400
      : 500;
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    statusCode = 409;
  }

  if (statusCode >= 500) {
    console.error("Task error:", error);
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : error.message,
  });
};

export const createTask = async (req, res) => {
  try {
    const task = await createTaskForUser(req.userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: { task },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await getUserTasks(req.userId);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: { tasks },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await getUserTaskById(
      req.userId,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await updateUserTask(
      req.userId,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: { task },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteTask = async (req, res) => {
  try {
    const deletedId = await deleteUserTask(
      req.userId,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: { id: deletedId },
    });
  } catch (error) {
    return handleError(res, error);
  }
};
