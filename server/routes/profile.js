const router = require("express").Router();
const {
  getProfile,
  getUserPosts,
  getFollowing,
  getFollowers,
  followUser,
  unfollowUser,
} = require("../controllers/profile");

router.route("/:username").get(getProfile);
router.route("/posts/:username").get(getUserPosts);
router.route("/following/:userId").get(getFollowing);
router.route("/followers/:userId").get(getFollowers);
router.route("/follow/:userToFollowId").post(followUser);
router.route("/unfollow/:userToUnFollowId").post(unfollowUser);
module.exports = router;
