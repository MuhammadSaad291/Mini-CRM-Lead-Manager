import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Create a signed JWT for a given user id.
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Shape the user object we send back (never include the password).
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});


//  Registers a new user and returns a JWT.
 
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({ success: true, message: "User registered successfully", token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};


//  Verifies credentials and returns a JWT.
 
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // password has select:false in the model, so explicitly select it here.
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);
    res.json({ success: true, message: "Login successful", token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};


  // Returns the currently authenticated user (protected route).

export const getMe = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};
