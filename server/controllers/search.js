const UserModel = require("../models/UserModel");

const searchUsers = async (req, res) => {
  let { searchText } = req.params;
  if (!searchText) return res.status(401).send("no searchText given");

  try {
    const results = await UserModel.find({
      name: { $regex: searchText, $options: "i" },
    });
    res.status(200).json(results);
  } catch (err) {
    console.log("search error at controllers/search", err);
    res.status(500).send("sever error @ controller/search");
  }
};

module.exports = { searchUsers };
