import express from "express";
import { createProduct, getAllProducts } from "../controllers/product.controller";
import { searchProducts } from "../controllers/product-search.controller";
import { updateProduct, deleteProduct } from "../controllers/product.controller";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;