const UserModel = require("../models/UserModel");
const FollowerModel = require("../models/FollowerModel");
const ProfileModel = require("../models/ProfileModel");
const usernameRegex = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/gim;
const defaultProfilePicURL = require("../util/defaultProfilePic");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const isEmail = require("validator/lib/isEmail");

const getUsernameAvailable = async (req, res) => {
  const { username } = req.params;
  try {
    if (username.length < 1) return res.status(401).send("Username too short");

    const test = usernameRegex.test(username);
    if (!(test || usernameRegex.test(username))) {
      return res.status(401).send("Invalid username");
    }

    const user = await UserModel.findOne({
      username: username.toLowerCase(),
    });
    if (user) return res.status(401).send("Username already taken");

    return res.status(200).send("Available");
  } catch (error) {
    console.log(error);
    res.status(500).send(`There was a server error`);
  }
};

const createUser = async (req, res) => {
  const {
    name,
    email,
    username,
    password,
    bio,
    facebook,
    youtube,
    twitter,
    instagram,
  } = req.body.user;

  if (!isEmail(email)) return res.status(401).send("Invalid Email");
  if (password.length < 6)
    return res.status(401).send("Password must be at least 6 chars long");

  try {
    let user;
    user = await UserModel.findOne({ email: email.toLowerCase() });
    if (user) return res.status(401).send("Email already in use");

    user = new UserModel({
      name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      profilePicURL: req.body.profilePicURL || defaultProfilePicURL,
    });

    user.password = await bcrypt.hash(password, 10);
    user = await user.save();

    let profileFields = {};
    profileFields.user = user._id;
    if (bio) profileFields.bio = bio;
    if (twitter) profileFields.twitter = twitter;
    if (youtube) profileFields.youtube = youtube;
    if (instagram) profileFields.instagram = instagram;
    if (facebook) profileFields.facebook = facebook;

    await new ProfileModel(profileFields).save();
    await new FollowerModel({
      user: user._id,
      followers: [],
      following: [],
    }).save();

    const payload = { userId: user._id };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "2d" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json(token);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

const postLoginUser = async (req, res) => {
  const { email, password } = req.body.user;

  if (!isEmail(email)) return res.status(401).send("Invalid Email");
  if (password.length < 6)
    return res.status(401).send("Password must be at least 6 chars long");

  try {
    const user = await UserModel.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) return res.status(401).send("Invalid Credentials");
    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) return res.status(401).send("Invalid Credentials");

    const payload = { userId: user._id };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "2d" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json(token);
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send("Sever Error");
  }
};

module.exports = { getUsernameAvailable, createUser, postLoginUser };
