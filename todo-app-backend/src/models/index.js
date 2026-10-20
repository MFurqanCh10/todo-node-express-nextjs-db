
import { User } from "../modules/auth/models/user.model.js";
import { Task } from "../modules/tasks/models/task.model.js";

User.hasMany(Task, {
  foreignKey: "userId",
  as: "tasks",
  onDelete: "CASCADE",
});

Task.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export { User, Task };
