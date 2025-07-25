import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  decreaseStock,
} from "../controllers/product.controller";

import {
  searchProducts,
  autocompleteProducts,
} from "../controllers/product-search.controller";

const router = express.Router();

router.post("/", authenticate, createProduct);
router.get("/search", searchProducts);
router.get("/autocomplete", autocompleteProducts);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", authenticate, updateProduct);
router.delete("/:id", authenticate, deleteProduct);
router.post("/decrease-stock", decreaseStock);

export default router;