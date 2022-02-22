import React, { useState } from "react";
import {
  Card,
  Icon,
  Image,
  Divider,
  Segment,
  Button,
  Popup,
  Header,
  Modal,
} from "semantic-ui-react";
import PostComments from "./PostComments";
import CommentInputField from "./CommentInputField";
import Link from "next/link";
import LikesList from "./LikedList";
import ImageModal from "./ImageModal";
import NoImageModal from "./NoImageModal";
import calculateTime from "../../util/calculateTime";
import { deletePost, likePost } from "../../util/postActions";

const CardPost = ({ post, user, setPosts, setShowToastr }) => {
  const [likes, setLikes] = useState(post.likes);
  const isLiked = likes.find((like) => like.user === user._id);

  const [comments, setComments] = useState(post.comments);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const addPropsToModal = () => {
    return { post, user, setLikes, likes, isLiked, comments, setComments };
  };

  return (
    <>
      <Segment basic>
        <Card color="teal" fluid>
          {post.picUrl && (
            <Image
              src={post.picUrl}
              style={{ cursor: "pointer" }}
              floated="left"
              wrapped
              ui={false}
              alt="post image"
              onClick={() => setShowModal(true)}
            />
          )}
          <Card.Content>
            <Image
              floated="left"
              src={post.user.profilePicURL}
              avatar
              circular
            />
          </Card.Content>
        </Card>
      </Segment>
    </>
  );
};

export default CardPost;
