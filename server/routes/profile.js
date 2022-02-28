const router = require("express").Router();
const { getProfile } = require("../controllers/profile");

router.route("/:username").get(getProfile);

module.exports = router;
