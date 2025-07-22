import express from "express";
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

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/autocomplete", autocompleteProducts);

export default router;