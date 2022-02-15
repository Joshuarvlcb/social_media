const router = require("express").Router();
const { authMiddleware } = require("../middleware/auth");
const { searchUsers } = require("../controllers/search");

router.route("/:searchText").get(authMiddleware, searchUsers);

module.exports = router;
