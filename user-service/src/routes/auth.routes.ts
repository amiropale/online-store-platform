import express from "express";
import { register, login } from "../controllers/auth.controller";
import { searchUsers } from "../controllers/user-search.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { getProfile } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/profile", authenticate, getProfile);
router.get("/search", authenticate, searchUsers);

export default router;