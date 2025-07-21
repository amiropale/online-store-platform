import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  deleteOrder,
  updateOrderStatus,
} from "../controllers/order.controller";
import { searchOrders } from "../controllers/order-search.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.delete("/:id", deleteOrder);
router.put("/:id/status", updateOrderStatus);
router.get("/search", searchOrders);
router.post("/", authenticate, createOrder);
router.get("/", authenticate, getAllOrders);
router.get("/:id", authenticate, getOrderById);
router.get("/search", authenticate, searchOrders);

export default router;