import express from "express";
const contactsRouter = express.Router();
import {
  get,
  getById,
  add,
  update,
  changeStatus,
  remove,
} from "../../models/contacts.js";
import { auth } from "../../models/users.js";

contactsRouter.get("/", auth, get);
contactsRouter.get("/:contactId", auth, getById);
contactsRouter.post("/", auth, add);
contactsRouter.delete("/:contactId", auth, remove);
contactsRouter.put("/:contactId", auth, update);
contactsRouter.patch("/:contactId/favorite", auth, changeStatus);

export default contactsRouter;
