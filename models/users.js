import { User } from "../service/schemas/users.js";
import passport from "passport";
import Joi from "joi";
import jwt from "jsonwebtoken";
import "dotenv/config";
import gravatar from "gravatar";
import multer from "multer";
import fs from "fs/promises";
import Jimp from "jimp";
import path from "path";

const schemaUserValidate = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

const secret = process.env.SECRET;
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.validPassword(password)) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Email or password is wrong",
      data: "Bad request",
    });
  }

  const payload = {
    id: user.id,
    email: user.email,
    subscription: user.subscription,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  res.json({
    status: "success",
    code: 200,
    data: {
      token: token,
      user: {
        email: `${payload.email}`,
        subscription: `${payload.subscription}`,
      },
    },
  });
};

export const signup = async (req, res, next) => {
  const { password, email } = req.body;
  const user = await User.findOne({ email }).lean();
  const avatarURL = gravatar.url(email);

  if (user) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email is already in use",
      data: "Conflict",
    });
  }

  try {
    const value = await schemaUserValidate.validateAsync({ email, password });
  } catch (err) {
    return res.status(400).json({
      message: `${err.details[0].message}`,
    });
  }

  try {
    const newUser = new User({ email, avatarURL });
    newUser.setPassword(password);
    newUser.avatarURL = avatarURL;
    await newUser.save();

    res.status(201).json({
      status: "success",
      code: 201,
      message: "Registration successful",
      data: newUser,
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const getUser = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return null;
    } else {
      return user;
    }
  } catch (err) {
    console.log(err);
  }
};

export const logout = async (req, res) => {
  const { user } = req;

  try {
    user.token = null;
    await user.save();

    return res.status(204).send();
  } catch (err) {
    return res.status(401).json({
      status: "unauthorized",
      code: 401,
      message: `Incorrect login or password, ${err.message}`,
      data: "Bad request",
    });
  }
};

export const current = (req, res) => {
  const { email, subscription } = req.user;

  try {
    const id = req.user.id;
    const user = getUser(id);

    if (!user) {
      return res.json({
        status: "error",
        code: 401,
        data: {
          message: `Not authorized`,
        },
      });
    } else {
      return res.json({
        status: "success",
        code: 200,
        data: {
          message: `Authorization successful`,
          email,
          subscription,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

//AVATARS

const uploadDir = path.join(process.cwd(), "tmp");
const storeImage = path.join(process.cwd(), "../public/avatars");

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage: storage,
});

export const avatars = async (req, res, next) => {
  const user = req.user;
  const { email } = req.user;

  const temporaryName = req.user.avatarURL.split(" / ").pop();

  //changing path
  const newFileName = email.split("@")[0];

  const newAvatarPath = path.join(storeImage, `${newFileName}.jpg`);

  user.avatarURL = newAvatarPath;
  await user.save();

  //rename and resize
  try {
    await fs.rename(temporaryName, newFileName);
    newFileName.resize(250, 250);
    Jimp.read(newFileName, (err, newFileName) => {
      if (err) throw err;
      newFileName.resize(250, 250).write(newPath);
    });
  } catch (err) {
    await fs.unlink(temporaryName);
    return next(err);
  }
  res.json({
    description,
    message: "File uploaded successfully",
    status: 200,
  });
};
