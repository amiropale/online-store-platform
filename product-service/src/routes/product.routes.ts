import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";

import {
  searchProducts,
  autocompleteProducts,
} from "../controllers/product-search.controller";

const router = express.Router();

router.post("/", authenticate, createProduct);
router.put("/:id", authenticate, updateProduct);
router.delete("/:id", authenticate, deleteProduct);
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/autocomplete", autocompleteProducts);

export default router;