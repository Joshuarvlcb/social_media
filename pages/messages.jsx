import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { baseURL } from "./util/auth";
import { parseCookies } from "nookies";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { Segment, Header, Divider, Comment, Grid } from "semantic-ui-react";
import ChatListSearch from "./components/chat/ChatListSearch";
import Chat from "./components/chat/Chat";
import Banner from "./components/messages/Banner";
import Message from "./components/messages/Message";
import MessageInputField from "./components/messages/MessageInputField";

const scrollDivToBottom = (divRef) =>
  divRef.current !== null &&
  divRef.current.scrollIntoView({ behavior: "smooth" });

const messages = ({ chatsData, user }) => {
  const [chats, setChats] = useState(chatsData);
  const router = useRouter();

  const socket = useRef();
  const [connectedUsers, setConnectedUsers] = useState([]);

  const [messages, setMessages] = useState([]);
  const [bannerData, setBannerData] = useState({ name: "", profilePicURL: "" });

  const divRef = useRef();
  const openChatId = useRef();

  const sendMsg = (msg) => {
    socket.current.emit("sendNewMsg", {
      userId: user._id,
      msgToSendUserId: openChatId.current,
      msg,
    });
  };
  const deleteMsg = () => {};

  const startServer = async () => {
    await fetch("/api/socket");
    socket.current = io();
    socket.current.on("connect", () => {
      console.log("connected");
    });

    socket.current.on("connectedUsers", ({ users }) => {
      users.length > 0 && setConnectedUsers(users);
    });

    socket.current.emit("join", { userId: user._id });
  };

  useEffect(() => {
    messages.length > 0 && scrollDivToBottom(divRef);
  }, [messages]);

  useEffect(() => {
    const loadMessages = () => {
      socket.current.emit("loadMessages", {
        userId: user._id,
        messagesWith: router.query.message,
      });
      socket.current.on("messagesLoaded", ({ chat }) => {
        setMessages(chat.messages);
        console.log(chat);
        setBannerData({
          name: chat.messagesWith.name,
          profilePicURL: chat.messagesWith.profilePicURL,
        });
        openChatId = chat.messagesWith._id;
        divRef.current && scrollDivToBottom(divRef);

        socket.current.on("noChatFound", async () => {
          try {
            const res = await axios.get(
              `${baseURL}/api/v1/messages/user/${router.query.message}`,
              {
                headers: { Authorization: `Bearer ${Cookies.get("token")}` },
              }
            );
            setBannerData({
              name: res.data.name,
              profilePicURL: res.data.profilePicURL,
            });
            setMessages([]);
            openChatId.current = router.query.message;
          } catch (err) {}
        });
      });
    };

    if (socket.current && router.query.message) loadMessages();
  }, [router.query.message]),
    useEffect(() => {
      startServer();
    }, []);

  // useEffect( () => {
  //   if(!socket.current) {
  //     socket.current = io('http://localhost:3000');
  //   }

  //   if(socket.current) {
  //     socket.current.emit('pingServer', {name: "Jimmy", age: 235})
  //   }
  // }, [])

  const deleteChat = async (messagesWith) => {
    try {
      await axios.delete(`${baseURL}/api/v1/messages/${messagesWith}`, {
        Headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });

      setChats((prev) =>
        prev.filter((chat) => chat.messagesWith !== messagesWith)
      );
      router.push("/messages", undefined, { shallow: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Segment>
      <Header
        icon="home"
        content="Go Back"
        onClick={() => router.push("/")}
        style={{ cursor: "pointer" }}
      />
      <Divider hidden />
      <div style={{ marginTop: "10px" }}>
        <ChatListSearch chats={chats} setChats={setChats} />
      </div>

      {chats.length > 0 ? (
        <>
          <Grid stackable>
            <Grid.Column width={10}>
              <Comment.Group size="big">
                <Segment
                  raised
                  style={{ overflow: "auto", maxHeight: "32rem" }}
                >
                  {chats.map((chat, i) => (
                    <Chat
                      key={i}
                      chat={chat}
                      connectedUsers={connectedUsers}
                      deleteChat={deleteChat}
                    />
                  ))}
                </Segment>
              </Comment.Group>
            </Grid.Column>
            <Grid.Column width={14}>
              {router.query.message && (
                <>
                  <div
                    style={{
                      overflow: "auto",
                      overflowX: "hidden",
                      maxHeight: "32rem",
                      height: "32rem",
                      backgroundColor: "whitesmoke",
                    }}
                  >
                    <div style={{ position: "sticky", top: "0" }}>
                      <Banner bannerData={bannerData} />
                    </div>
                    {messages.length > 0 &&
                      messages.map((message, i) => {
                        <Message
                          key={i}
                          user={user}
                          message={message}
                          bannerProfilePic={bannerData.profilePicURL}
                          divRef={divRef}
                        />;
                      })}
                  </div>

                  <MessageInputField sendMsg={sendMsg} />
                </>
              )}
            </Grid.Column>
          </Grid>
        </>
      ) : (
        <p> No chats </p>
      )}
    </Segment>
  );
};

messages.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseURL}/api/v1/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(res.data);
    // console.log(res.data);
    return { chatsData: res.data };
  } catch (err) {
    console.error(err);
    return { errorLoading: true };
  }
};

export default messages;
