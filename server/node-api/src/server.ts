import app from "./app";
import { env } from "./config/env";
import prisma from "./config/prisma";

async function startServer() {
  try {
    await prisma.$connect();

    console.log("🗄️ PostgreSQL connected successfully");

    app.listen(env.PORT, () => {
      console.log(
        `🚀 PharmaFlow Backend running on http://localhost:${env.PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

startServer();