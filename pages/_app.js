import Layout from "../pages/components/layout/Layout";
import "../styles/globals.css";
import "semantic-ui-css/semantic.min.css";
import { baseURL, redirectUser } from "./util/auth";
import { destroyCookie, parseCookies } from "nookies";
import axios from "axios";
import ProfilePage from "./[username]";

function MyApp({ Component, pageProps }) {
  // function MyApp(AppContext) {
  //   const { Component, pageProps } = AppContext;
  //   console.log(AppContext);
  return (
    <Layout user={pageProps.user}>
      <Component {...pageProps} />
    </Layout>
  );
}
// !!Protected routes

MyApp.getInitialProps = async ({ ctx, Component }) => {
  const { token } = parseCookies(ctx);
  let pageProps = {};

  const protectedRoutes = ["/", "/[username]", "/messages"];

  const isProtectedRoute = protectedRoutes.includes(ctx.pathname);

  if (!token) {
    isProtectedRoute && redirectUser(ctx, "/login");
  } else {
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    try {
      const res = await axios.get(`${baseURL}/api/v1/auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { user, followStats } = res.data;

      if (user) !isProtectedRoute && redirectUser(ctx, "/");
      pageProps.user = user;
      pageProps.followStats = followStats;
    } catch (error) {
      destroyCookie(ctx, "token");
      redirectUser(ctx, "/login");
    }
  }
  return { pageProps };
};

export default MyApp;
