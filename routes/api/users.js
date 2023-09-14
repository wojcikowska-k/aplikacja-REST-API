import express from "express";
const usersRouter = express.Router();
import { signup, auth, login, logout, current } from "../../models/users.js";

usersRouter.post("/signup", signup);

usersRouter.post("/login", login);

usersRouter.get("/logout", auth, logout);

usersRouter.get("/current", auth, current);

export default usersRouter;
