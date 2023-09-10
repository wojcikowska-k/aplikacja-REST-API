import { User } from "../service/schemas/users.js";
import passport from "passport";
import Joi from "joi";
import jwt from "jsonwebtoken";
import "dotenv/config";

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
      token,
      user: {
        email: `${payload.email}`,
        subscription: `${payload.subscription}`,
      },
    },
  });
};

export const signup = async (req, res, next) => {
  const { password, email, subscription } = req.body;
  const user = await User.findOne({ email }).lean();

  try {
    const value = await schemaUserValidate.validateAsync({ email, password });
  } catch (err) {
    return res.status(400).json({
      message: `${err.details[0].message}`,
    });
  }

  if (user) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email is already in use",
      data: "Conflict",
    });
  }

  try {
    const newUser = new User({ email, subscription });
    newUser.method.setPassword(password);
    await newUser.save();

    res.status(201).json({
      status: "success",
      code: 201,
      message: "Registration successful",
      data: {
        user: {
          email: `${email}`,
          subscription: `${subscription}`,
        },
      },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const getUser = (req, res, next) => {
  const { email } = req.user;

  res.json({
    status: "success",
    code: 200,
    data: {
      message: `Authorization was successful: ${email}`,
    },
  });
};

export const logout = async (req, res, next) => {
  try {
    const id = req.user.id;
    const user = getUser(id);
    user.token = null;
    await user.save();
  } catch (error) {
    console.error(error);
  }
};

export const current = async (req, res, next) => {
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
      const { email, subscription } = user;
      return res.json({
        status: "success",
        code: 200,
        data: {
          user: {
            email: `${email}`,
            subscription: `${subscription}`,
          },
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};
