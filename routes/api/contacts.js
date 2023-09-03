import express from "express";
const router = express.Router();
import {
  get,
  getById,
  add,
  update,
  changeStatus,
  remove,
} from "../../models/contacts.js";

router.get("/", get);
router.get("/:contactId", getById);
router.post("/", add);
router.delete("/:contactId", remove);
router.put("/:contactId", update);
router.patch("/:contactId/favorite", changeStatus);

export default router;
