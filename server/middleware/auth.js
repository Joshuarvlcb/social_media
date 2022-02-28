const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send("Unautorized1");
    }
    if (!req.headers.authorization.split(" ")[0] === "Bearer") {
      return res.status(401).send("Unautorized2");
    }

    const auth = req.headers.authorization.split(" ")[1];
    const { userId } = jwt.verify(auth, process.env.JWT_SECRET);
    req.userId = userId;
    //comments
    //like list

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send("Unauthorized3");
  }
};

module.exports = { authMiddleware };
