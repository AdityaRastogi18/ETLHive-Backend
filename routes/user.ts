import express from "express";
import {
  handleCreateNewUser,
  handleLoginUser,
  handleUpdateUser,
} from "../controllers/user";
import {
  validateUsername,
  validateRegistration,
  validateUserUpdate,
} from "../validators/userValidator";
import { authenticateJWT } from "../middlewares/auth";

const router = express.Router();

router.route("/signup").post(validateRegistration, handleCreateNewUser);
router.route("/login").post(validateUsername, handleLoginUser);
router.route("/").patch(authenticateJWT, validateUserUpdate, handleUpdateUser);

export default router;
