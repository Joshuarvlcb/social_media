import { useEffect, useState } from "react";
import { baseURL } from "./util/auth";
import axios from "axios";
import { parseCookies } from "nookies";
import { NoPosts } from "./components/layout/NoData";
import CreatePost from "./components/post/CreatePost";
import { Segment } from "semantic-ui-react";
import CardPost from "./components/post/CardPost";
/*
  local storage is similar to cookies 
  stores information of the user in the browser 
*/

const index = ({ user, postData, errorLoading }) => {
  const [posts, setPosts] = useState(postData);
  const [showToastr, setShowStoastr] = useState(false);
  //*UseEffects ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

  useEffect(() => {
    document.title = `Welcome, ${user.name.split(" ")[0]}`;
  }, []);

  useEffect(() => {
    showToastr && setTimeout(() => setShowStoastr(false), 3000);
  }, [showToastr]);

  if (!posts || errorLoading) return <NoPosts />;

  return (
    <>
      {/* SHOW TOASTER STUFF */}
      <Segment>
        <CreatePost user={user} setPosts={setPosts} />
        {posts.map((post) => {
          return (
            <CardPost
              key={post._id}
              post={post}
              user={user}
              setPosts={setPosts}
              setShowStoastr={setShowStoastr}
            />
          );
        })}
      </Segment>
    </>
  );
};

index.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseURL}/api/v1/posts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { postData: res.data };
  } catch (err) {
    console.log(err);
    return { errorLoading: true };
  }
};

export default index;

// const index = ({ posts, token }) => {
//   return (
//     <>
//       <h1>{token}</h1>
//       {posts.map((post) => {
//         return (
//           <div key={post.id}>
//             <h1>{post.title}</h1>
//             <p>{post.body}</p>
//             <Divider />
//           </div>
//         );
//       })}
//     </>
//   );
// };

// index.getInitialProps = async (ctx) => {
//   const cookie = parseCookies(ctx);
//   const res = await axios.get("https://jsonplaceholder.typicode.com/posts");
//   // console.log(ctx);
//   return { posts: res.data, token: cookie.token };
// };
