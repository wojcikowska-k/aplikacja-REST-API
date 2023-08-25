const fs = require("fs/promises");

const listContacts = async () => {
  try {
    const contacts = fs.readFile("models/contacts.json");
    return JSON.parse(await contacts);
  } catch (error) {
    console.log(error);
  }
};

const getContactById = async (contactId) => {};

const removeContact = async (contactId) => {};

const addContact = async (body) => {};

const updateContact = async (contactId, body) => {};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
