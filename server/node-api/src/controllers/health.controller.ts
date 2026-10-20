import { Request, Response } from "express";
import prisma from "../config/prisma";

export const healthCheck = async (
  _req: Request,
  res: Response
) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "PharmaFlow API is healthy",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(503).json({
      success: false,
      message: "PharmaFlow API is running, but database is unavailable",
      database: "disconnected",
    });
  }
};