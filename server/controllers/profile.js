const UserModel = require("../models/UserModel");
const PostModel = require("../models/PostModel");
const FollowerModel = require("../models/FollowerModel");
const ProfileModel = require("../models/ProfileModel");
const bcrypt = require("bcryptjs");

const getProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await UserModel.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(404).send("user does not exist :(");

    // !!populate

    const profile = await ProfileModel.findOne({ user: user._id }).populate(
      "user"
    );

    const profileFollowStats = await FollowerModel.findOne({ user: user._id });

    return res.status(200).json({
      profile,
      followersLength:
        profileFollowStats.followers.length > 0
          ? profileFollowStats.followers.length
          : 0,
      followingLength:
        profileFollowStats.followers.length > 0
          ? profileFollowStats.followers.length
          : 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("error @ getProfile");
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await UserModel.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(404).send("user not found");

    const posts = await PostModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("comments.user");

    return res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    return res.status(500).send("error @ getUserPosts");
  }
};

const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await FollowerModel.findOne({ user: userId }).populate(
      "followers.user"
    );
    return res.status(200).json(user.followers);
  } catch (err) {
    console.error(err);
    return res.status(500).send("error @ getFollowers");
  }
};

const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await FollowerModel.findOne({ user: userId }).populate(
      "following.user"
    );
    return res.status(200).json(user.following);
  } catch (err) {
    console.error(err);
    return res.status(500).send("error @ getFollowing");
  }
};
const followUser = async (req, res) => {
  try {
    const { userId } = req;
    const { userToFollowId } = req.params;

    const user = await FollowerModel.findOne({ user: userId });
    const userToFollow = await FollowerModel.findOne({ user: userToFollowId });

    if (!user || !userToFollow) return res.status(404).send("user not found");

    const isFollowing = user.following.find(
      (u) => u.user._id.toString() === userToFollowId
    );

    if (isFollowing) return res.status(401).send("user already followed");

    await user.following.unshift({ user: userToFollowId });
    await userToFollow.followers.unshift({ user: userId });

    await user.save();
    await userToFollow.save();

    return res.status(200).send("user followed");
  } catch (err) {
    console.error(err);
    return res.status(500).send("error @ followUser");
  }
};
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req;
    const { userToUnFollowId } = req.params;

    const user = await FollowerModel.findOne({ user: userId });
    const userToUnFollow = await FollowerModel.findOne({
      user: userToUnFollowId,
    });

    if (!user || !userToUnFollow) return res.status(404).send("user not found");

    const isFollowingIndex = user.following.findIndex(
      (u) => u.user._id.toString() === userToUnFollowId
    );
    console.log(isFollowingIndex);
    if (isFollowingIndex === -1)
      return res.status(401).send("user not followed before");

    await user.following.splice(isFollowingIndex, 1);
    await user.save();

    const removeFollowerIndex = userToUnFollow.followers.findIndex(
      (eachUser) => eachUser._id.toString() === userId
    );

    await userToUnFollow.followers.splice(removeFollowerIndex, 1);
    await userToUnFollow.save();

    return res.status(200).send(`User UnFollowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).send("error @ unfollowUser");
  }
};
const updateProfile = async (req, res) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).send("error @ updateProfile");
  }
};
const updatePassword = async (req, res) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).send("error @ updatePassword");
  }
};
module.exports = {
  getProfile,
  getUserPosts,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  updateProfile,
  updatePassword,
};
