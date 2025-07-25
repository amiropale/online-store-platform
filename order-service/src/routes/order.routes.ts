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

router.post("/", authenticate, createOrder);
router.get("/", authenticate, getAllOrders);
router.get("/:id", authenticate, getOrderById);
router.delete("/:id", authenticate, deleteOrder);
router.put("/:id/status", authenticate, updateOrderStatus);
router.get("/search", authenticate, searchOrders);

export default router;