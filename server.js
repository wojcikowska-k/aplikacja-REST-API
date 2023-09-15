import mongoose from "mongoose";
import app from "./app.js";
import fs from "fs/promises";
import dotenv from "dotenv";
import { uploadDir } from "./models/users.js";
dotenv.config();

const PORT = process.env.PORT || 3000;
const uriDb = process.env.DB_HOST;

const connection = mongoose.connect(uriDb, {});

const isAccessible = (path) => {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
};

const createFolderIsNotExist = async (folder) => {
  if (!(await isAccessible(folder))) {
    await fs.mkdir(folder);
  }
};

connection
  .then(() => {
    app.listen(PORT, function () {
      createFolderIsNotExist(uploadDir);
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Server not running. Error message: ${err.message}`);
    process.exit(1);
  });
