
import "dotenv/config";
import app from "./app.js";
import { sequelize } from "./config/database.js";
import "./models/index.js";

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully.");

    await sequelize.sync();
    console.log("Database tables synchronized.");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error);
    process.exit(1);
  }
};

startServer();
