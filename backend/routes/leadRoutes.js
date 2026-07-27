import { Router } from "express";
import {
  createLead,
  getLeads,
  updateLeadStatus,
  updateLead,
  deleteLead,
  getAnalytics,
} from "../controllers/leadController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/analytics", getAnalytics); // must be before "/:id" routes
router.route("/").get(getLeads).post(createLead);
router.patch("/:id/status", updateLeadStatus);
router.route("/:id").put(updateLead).delete(deleteLead);

export default router;
