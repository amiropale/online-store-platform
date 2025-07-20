import express from "express";
import { createProduct, getAllProducts } from "../controllers/product.controller";
import { searchProducts } from "../controllers/product-search.controller";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/search", searchProducts);

export default router;