import { Router } from "express";
import { processPayment } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, processPayment);

export default router;