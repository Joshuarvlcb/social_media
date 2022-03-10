import axios from "axios";
import { baseURL } from "./auth";
import catchError from "./catchErrors";
import Cookies from "js-cookie";
import Router from "next/router";

const profileAxios = axios.create({
  baseURL: `${baseURL}/api/v1/profile`,
  headers: { authorization: `Bearer ${Cookies.get("token")}` },
});

export const followUser = async (userToFollowId, setLoggedUserFollowStats) => {
  try {
    console.log("hi");
    await profileAxios.post(`/follow/${userToFollowId}`);

    setLoggedUserFollowStats((prev) => {
      return {
        ...prev,
        following: [...prev.following, { user: userToFollowId }],
      };
    });
  } catch (err) {
    console.log(err);
  }
};

export const unfollowUser = async (
  userToUnfollowId,
  setLoggedUserFollowStats
) => {
  try {
    console.log("foo");

    await profileAxios.post(`/unfollow/${userToUnfollowId}`);
    setLoggedUserFollowStats((prev) => ({
      ...prev,
      following: prev.following.filter(
        (following) => following.user !== userToUnfollowId
      ),
    }));
  } catch (err) {
    console.log(err);
  }
};
