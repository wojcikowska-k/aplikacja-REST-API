import fs from "fs/promises";
import { nanoid } from "nanoid";
import path from "path";

const contactsPath = path.resolve("models", "contacts.json");

export const listContacts = async () => {
  try {
    const contacts = fs.readFile(contactsPath);
    const parsedContacts = JSON.parse(await contacts);

    return parsedContacts;
  } catch (error) {
    console.log(error);
  }
};

export const getContactById = async (contactId) => {
  try {
    const contacts = fs.readFile(contactsPath);
    const parsedContacts = JSON.parse(await contacts);

    return parsedContacts.find((el) => el.id === contactId);
  } catch (error) {
    console.log(error);
  }
};

export const addContact = async (body) => {
  try {
    const { name, email, phone } = body;
    const contact = {
      id: nanoid(),
      name,
      email,
      phone,
    };
    const contacts = fs.readFile(contactsPath);
    const parsedContacts = JSON.parse(await contacts);
    parsedContacts.push(contact);
    await fs.writeFile(contactsPath, JSON.stringify(parsedContacts));

    return contact;
  } catch (error) {
    console.log(error);
  }
};

export const removeContact = async (contactId) => {};

export const updateContact = async (contactId, body) => {};
