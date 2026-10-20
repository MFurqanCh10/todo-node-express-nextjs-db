
import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";

import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

const router = Router();

// Every task endpoint requires a valid JWT.
router.use(requireAuth);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
