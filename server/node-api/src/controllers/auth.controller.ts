  import { Request, Response } from "express";
  import {
    registerUser,
    loginUser,
  } from "../auth/auth.service";

  export const register = async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        name,
        email,
        password,
        role,
        companyId,
      } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message:
            "Name, email, password and role are required",
        });
      }

      const user = await registerUser(
        name,
        email,
        password,
        role,
        companyId
      );

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      console.error("Register error:", error);

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to register user",
      });
    }
  };

  export const login = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const result = await loginUser(
        email,
        password
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      console.error("Login error:", error);

      return res.status(401).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Login failed",
      });
    }
  };