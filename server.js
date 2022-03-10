//* EXPRESS APP SETUP */
const express = require("express");
const { connectDB } = require("./server/util/connect");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");

require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const app = express();
const PORT = process.env.PORT || 3000;

//* NEXT APP SETUP */
const next = require("next");
//!create a check for development vs production
const dev = process.env.NODE_ENV !== "production";
//! there are giant error warnings that pop us when in dev.
const nextApp = next({ dev });
//! this is a built in next router that will handle ALL requests made to the server
const handler = nextApp.getRequestHandler();

//* MIDDLEWARES */
const { authMiddleware } = require("./server/middleware/auth");
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

//*ROUTERS */
const userRoute = require("./server/routes/userRoutes");
const authRoute = require("./server/routes/authRoutes");
const searchRoute = require("./server/routes/search");
const uploadRoute = require("./server/routes/uploadPicRoute");
const postsRoute = require("./server/routes/postsRoute");
const profileRoute = require("./server/routes/profile");
const messagesRoute = require("./server/routes/messages");
const { default: Server } = require("next/dist/server/base-server");

app.use("/api/v1/search", searchRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/uploads", uploadRoute);
app.use("/api/v1/posts", authMiddleware, postsRoute);
app.use("/api/v1/profile", authMiddleware, profileRoute);
app.use("/api/v1/messages", authMiddleware, messagesRoute);

//*SOCKETS*//
// const Server = require("http").Server(app);
// const io = require("socket.io")(Server);
// io.on("connect", (socket) => {
//   socket.on("ping server", (data) => {
//     console.log(data);
//   });
// });
connectDB();

nextApp.prepare().then(() => {
  app.all("*", (req, res) => handler(req, res));
  app.listen(PORT, (err) => {
    if (err) console.log(err);
    else console.log(`Server listening @ ${PORT}`);
  });
});
