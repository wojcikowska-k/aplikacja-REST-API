import express from "express";
const usersRouter = express.Router();
import {
  signup,
  auth,
  login,
  logout,
  current,
  avatars,
  upload,
} from "../../models/users.js";

usersRouter.post("/signup", signup);

usersRouter.post("/login", login);

usersRouter.get("/logout", auth, logout);

usersRouter.get("/current", auth, current);

usersRouter.patch("/avatars", auth, upload.single("avatar"), avatars);

export default usersRouter;
