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
import randomstring from "randomstring";
import nodemailer from "nodemailer";
import { nanoid } from "nanoid";

const schemaUserValidate = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
const schemaEmailValidate = Joi.object({
  email: Joi.string().email().required(),
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
    newUser.verificationToken = nanoid();
    await newUser.save();

    sendEmail({ email, verificationToken: newUser.verificationToken });

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

export const uploadDir = path.join(process.cwd(), "tmp");

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
  try {
    const { path: temporaryName } = req.file;
    const ext = path.extname(temporaryName);
    const avatarName = randomstring.generate() + ext;
    const storeImage = path.join(
      process.cwd(),
      "public",
      "avatars",
      avatarName
    );
    try {
      Jimp.read(temporaryName).then((avatar) => {
        return avatar.cover(250, 250).quality(60).write(storeImage);
      });
    } catch (err) {
      await fs.unlink(temporaryName);
      next(err);
    }
    await fs.unlink(temporaryName);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        status: "Unauthorized",
        code: 401,
        message: "Not authorized",
        data: "Bad request",
      });
    }
    user.avatarURL = `/avatars/${avatarName}`;
    await user.save();
    res.status(200).json({
      status: "success",
      code: 200,
      message: "File uploaded successfully",
      data: { avatarURL: user.avatarURL },
    });
  } catch (err) {
    next(err);
  }
};

//EMAIL
export const sendEmail = ({ email, verificationToken }) => {
  const config = {
    host: "gmail",
    auth: {
      user: "kasiarukat3456@gmail.com",
      pass: process.env.PASSWORD,
    },
  };

  const baseURL = process.env.BASE_URL;

  const transporter = nodemailer.createTransport(config);
  const emailOptions = {
    from: "kasiarukat3456@gmail.com",
    to: email,
    subject: `Verification`,
    html: `<a href="${baseURL}/users/verify/${verificationToken}">Click here for verification</a>`,
  };

  transporter.sendMail(emailOptions).then((info) => res.render("done"));
};

export const userVerification = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({
        status: "Not Found",
        code: 404,
        message: "User not found",
      });
    }

    await User.findByIdAndUpdate(user._id, {
      verificationToken: "",
      verify: true,
    });

    res.json({ message: "Success" });
  } catch (err) {
    next(err);
  }
};

export const sendEmailAgain = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "missing required field email" });
    }

    try {
      const value = await schemaEmailValidate.validateAsync({ email });
    } catch (err) {
      return res.status(400).json({
        status: 400,
        data: "Bad request",
        message: `${err.details[0].message}`,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res.status(400).json({
        status: "Bad request",
        code: 400,
        message: "Verification has already been passed",
      });
    }

    sendEmail({ email, verificationToken: user.verificationToken });
    res.status(200).json({
      status: "Ok",
      code: 200,
      message: "Verification email sent",
    });
  } catch (err) {
    next(err);
  }
};
