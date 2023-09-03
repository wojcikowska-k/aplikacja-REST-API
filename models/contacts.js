import {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
  changeFavorite,
} from "../service/index.js";

export const get = async (req, res, next) => {
  try {
    const results = await listContacts();
    res.json({
      status: "success",
      code: 200,
      data: {
        contacts: results,
      },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const getById = async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const result = await getContactById(contactId);
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contact: result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${contactId}`,
        data: "Not Found",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const add = async (req, res, next) => {
  const { name, email, phone } = req.body;
  try {
    const result = await addContact({ name, email, phone });

    res.status(201).json({
      status: "success",
      code: 201,
      data: { contact: result },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const update = async (req, res, next) => {
  const { contactId } = req.params;
  const { name, email, phone } = req.body;
  try {
    const result = await updateContact(contactId, { name, email, phone });
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contact: result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${contactId}`,
        data: "Not Found",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const changeStatus = async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite = false } = req.body;

  try {
    const result = await changeFavorite(contactId, { favorite });
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contact: result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${contactId}`,
        data: "Not Found",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const remove = async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const result = await removeContact(contactId);
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contact: result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${contactId}`,
        data: "Not Found",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};
