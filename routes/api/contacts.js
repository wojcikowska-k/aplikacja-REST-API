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

contactsRouter.get("/", get);
contactsRouter.get("/:contactId", getById);
contactsRouter.post("/", add);
contactsRouter.delete("/:contactId", remove);
contactsRouter.put("/:contactId", update);
contactsRouter.patch("/:contactId/favorite", changeStatus);

export default contactsRouter;
