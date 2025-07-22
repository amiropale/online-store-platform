import express from "express";
import { confirmPayment, getMyPayments, searchPayments } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/confirm", authenticate, confirmPayment);
router.get("/", authenticate, getMyPayments);
router.get("/search", authenticate, searchPayments);

export default router;