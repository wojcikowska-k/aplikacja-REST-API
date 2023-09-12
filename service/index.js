import { Contact } from "./schemas/contacts.js";
// import { User } from "./schemas/users.js";

//CONTACTS
export const listContacts = async () => {
  return Contact.find({});
};

export const getContactById = (contactId) => {
  return Contact.findOne({ _id: contactId });
};

export const addContact = async (contact) => {
  return Contact.create(contact);
};

export const updateContact = (contactId, fields) => {
  return Contact.findByIdAndUpdate({ _id: contactId }, fields, { new: true });
};

export const removeContact = (contactId) => {
  return Contact.findByIdAndDelete(contactId);
};

export const changeFavorite = (contactId, { favorite }) => {
  return Contact.findByIdAndUpdate({ _id: contactId }, { $set: { favorite } });
};
// //USERS
// export const listUsers = async () => {
//   return User.find({});
// };
// export const getUserById = (userId) => {
//   return User.findOne({ _id: userId });
// };
