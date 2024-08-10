import express from "express";
import { validateLead } from "../validators/leadValidator";
import {
  handleCreateNewLead,
  handleGetLeads,
  handleUpdateLead,
  handleDeleteLead,
} from "../controllers/lead";
import { authenticateJWT } from "../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .post(validateLead, authenticateJWT, handleCreateNewLead)
  .get(authenticateJWT, handleGetLeads);

router
  .route("/:id")
  .patch(authenticateJWT, handleUpdateLead)
  .delete(authenticateJWT, handleDeleteLead);

export default router;
