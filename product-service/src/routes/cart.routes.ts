import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  checkoutCart,
} from "../controllers/cart.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authenticate);

router.post("/", addToCart);
router.get("/", getCart);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);
router.post("/checkout", checkoutCart);

export default router;