const UserModel = require("../models/UserModel");
const PostModel = require("../models/PostModel");
const uuid = require("uuid").v4;

/*--------------------------------------------------------------------------
CREATE A POST
.post('/)
req.body {text,location,picUrl}
----------------------------------------------------------------------------*/
const createPost = async (req, res) => {
  const { text, location, picUrl } = req.body;
  if (!text.length) return res.status(401).send("Text must be at least 1 char");

  try {
    const newPost = {
      user: req.userId,
      text,
    };
    if (location) newPost.location = location;
    if (picUrl) newPost.picUrl = picUrl;
    /*
        ??save
        ??populate
    */
    const post = await new PostModel(newPost).save();
    const postCreated = await PostModel.findById(post._id).populate("user");

    return res.status(200).json(postCreated);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error @ createPost");
  }
};

/*--------------------------------------------------------------------------
GET ALL POSTS
.get('/')
req.query { pageNumber } = help with pagination
----------------------------------------------------------------------------*/

const getAllPosts = async (req, res) => {
  const { page } = req.query;

  const pageNumber = +page;
  const size = 8;

  try {
    let posts;

    if (pageNumber === 1) {
      /*
    ??the 2 populate
    */
      posts = await PostModel.find()
        .limit(size)
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("comments.user");
    } else {
      const skips = size * (pageNumber - 1);
      posts = await PostModel.find()
        .skip(skips)
        .limit(size)
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("comments.user");
    }
    return res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).send("server @ getAllPosts");
  }
};

/*--------------------------------------------------------------------------
GET A POST BY ID
.get(':/postId')
req.params {postId}
----------------------------------------------------------------------------*/
const getPostById = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.postId)
      .populate("user")
      .populate("comments.user");

    if (!post) return res.status(403).send("post not found");
    return res.status(200).json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).send("server error @ getPostById");
  }
};

/*--------------------------------------------------------------------------
DELETE A POST
.delete('/:postId')
req.params {postId}
----------------------------------------------------------------------------*/

const deletePost = async (req, res) => {
  try {
    const { userId } = req;
    const { postId } = req.params;
    const post = await PostModel.findById(postId);
    if (!post) return res.status(403).send("post not found");

    const user = await UserModel.findById(userId);
    if (post.user.toString() !== userId) {
      if (user.role === "admin") {
        await post.remove();
        return res.status(200).send("post deleted successfully");
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send("server error in deletePOst");
  }
};
/*--------------------------------------------------------------------------
LIKE A POST
.post('/like/:postId')
req.params {postId}

----------------------------------------------------------------------------*/

const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;
    const post = await PostModel.findById(postId);
    if (!post) return res.status(403).send("post not found");

    const isLiked = post.likes.find((like) => like.user.toString() === userId);
    if (isLiked) return res.status(401).send("post already liked");

    await post.likes.unshift({ user: userId });
    await post.save();

    return res.status(200).send("post liked");
  } catch (err) {
    console.log(err);
    return res.status(500).send("server error @ likedPost");
  }
};

/*--------------------------------------------------------------------------
UNLIKE A POST
.put('/like:postId')
req.params {postId}
----------------------------------------------------------------------------*/

const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const post = await PostModel.findById(postId);
    if (!post) return res.status(403).send("post not found");

    const likedIndex = post.likes.findIndex(
      (like) => like.user.toString() == userId
    );

    if (likedIndex === -1) return res.status(403).send("post not liked");

    await post.likes.splice(likedIndex, 1);
    await post.save();
    return res.status(200).send("post unlike");
  } catch (err) {
    console.log(err);
    return res.status(500).send("server error @ unlikePost");
  }
};

/*--------------------------------------------------------------------------
GET ALL LIKES ON A POST
.get('/like:postId')
req.params {postId}
----------------------------------------------------------------------------*/

const getLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await PostModel.findById(postId).populate("likes.user");
    if (!post) return res.status(403).send("post not found");

    return res.status(200).json(post.likes);
  } catch (err) {
    console.log(err);
    return res.status(500).send("server error @ unlikePost");
  }
};

/*--------------------------------------------------------------------------
CREATE A COMMENT
.post('/comment.:postId')
req.params {postId}
req.body {text}
----------------------------------------------------------------------------*/
const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const { userId } = req;

    console.log(text);
    if (!text) return res.status(403).send("Text required");
    const post = await PostModel.findById(postId);
    if (!post) return res.status(403).send("post not found");
    const newComment = {
      user: userId,
      _id: uuid(),
      text,
    };
    console.log(newComment);

    await post.comments.unshift(newComment);
    await post.save();

    return res.status(200).json(newComment);
  } catch (err) {
    console.log(err);
    return res.status(500).send("server error @ createComment");
  }
};

/*--------------------------------------------------------------------------
DELETE A COMMENT
.delete('/comment/:postId/:commentId')
req.params {commentId,postId}
----------------------------------------------------------------------------*/
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req;

    const post = await PostModel.findById(postId);
    if (!post) return res.status(403).send("post not found");

    const comment = post.comment.find((comment) => comment.id === commentId);
    if (!comment) return res.status(403).send("comment not found");

    const user = await UserModel.findById(userId);
    const deleteComment = async () => {
      const indexOf = post.comments.map(({ _id }) => _id).indexOf(commentId);
      await post.comments.splice(indexOf, 1);
      await post.save();

      return res.status(200).send("comment deleted");
    };

    if (comment.user.toString() !== userId) {
      if (user.role === "admin") {
        await deleteComment();
      } else {
        return res.status(401).send("unauthorized to delete comment");
      }
    }
    await deleteComment();
  } catch (err) {
    console.log(err);
    return res.status(500).send("server error @ createComment");
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  likePost,
  unlikePost,
  getLikes,
  createComment,
  deleteComment,
};
