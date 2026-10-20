import { Router } from "express";

import {
  getProfile,
  updateProfile,
  changePassword,
  getSettings,
  updateSettings,
} from "../controllers/settings.controller";

import {
  authenticate,
} from "../middlewares/auth.middleware";

const router = Router();

// ==========================================
// PROFILE
// ==========================================

router.get(
  "/profile",
  authenticate,
  getProfile
);

router.put(
  "/profile",
  authenticate,
  updateProfile
);

// ==========================================
// PASSWORD
// ==========================================

router.put(
  "/password",
  authenticate,
  changePassword
);

// ==========================================
// USER SETTINGS / PREFERENCES
// ==========================================

router.get(
  "/preferences",
  authenticate,
  getSettings
);

router.put(
  "/preferences",
  authenticate,
  updateSettings
);

export default router; 