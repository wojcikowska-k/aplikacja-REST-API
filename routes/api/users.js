import express from "express";
const router = express.Router();
import { signup, auth, login, logout, current } from "../../models/users.js";

router.post("/signup", signup);

router.post("/login", login);

router.get("/logout", auth, logout);

router.get("/current", auth, current);

export default router;
