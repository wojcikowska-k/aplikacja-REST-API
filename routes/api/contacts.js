import express from "express";
import Joi from "joi";

import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} from "../../models/contacts.js";

const router = express.Router();

const responseSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});

const responseSchemaUpdate = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
}).or("name", "email", "phone");

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.json({
      status: "success",
      code: 200,
      data: {
        contacts,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);
    if (contact) {
      res.json({
        status: "success",
        code: 200,
        data: {
          contact,
        },
      });
    } else {
      res.json({
        status: "error",
        code: 404,
        message: "Not found",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const responseBody = responseSchema.validate(req.body);

    if (responseBody.error) {
      return res.status(400).send({
        message:
          "missing required name - " + responseBody.error.details[0].path[0],
      });
    } else {
      const contact = await addContact(responseBody.value);
      res.status(201).json({
        status: "success",
        code: 201,
        data: { contact },
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);
    if (contact) {
      removeContact(contactId);
      return res.status(200).send({
        message: "contact deleted",
      });
    } else {
      res.json({
        status: "error",
        code: 404,
        message: "Not found",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);
    if (contact) {
      try {
        const responseBody = responseSchemaUpdate.validate(req.body);

        if (responseBody.error) {
          return res.status(400).send({
            message: "missing fields",
          });
        } else {
          const contact = await updateContact(contactId, responseBody.value);

          res.status(200).json({
            status: "success",
            code: 200,
            data: { contact },
          });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      res.json({
        status: "error",
        code: 404,
        message: "Not found",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

export default router;
