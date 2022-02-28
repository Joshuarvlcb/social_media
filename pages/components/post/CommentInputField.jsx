import React, { useState } from "react";
import { Form } from "semantic-ui-react";
import { postComment } from "../../util/postActions";
const CommentInputField = ({ setComments, user, postId }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <Form
      reply
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        await postComment(postId, user, text, setComments, setText);
      }}
    >
      <Form.Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="add comment"
        action={{
          color: "blue",
          icon: "edit",
          loading: loading,
          disabled: text === "" || loading,
        }}
      ></Form.Input>
    </Form>
  );
};

export default CommentInputField;
