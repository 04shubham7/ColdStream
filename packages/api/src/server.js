import "dotenv/config";
import app from "./app.js";

import { connectDB } from "./config/database.js";

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
