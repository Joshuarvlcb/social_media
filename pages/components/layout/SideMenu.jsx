import { useRouter } from "next/router";
import { List, Icon } from "semantic-ui-react";
import Link from "next/link";
import { logoutUser } from "../../util/auth";

const SideMenu = ({
  user: { email, unreadNotification, unreadMessage, username },
}) => {
  const router = useRouter();
  const isActive = (route) => router.pathname === route;

  return (
    <>
      <List
        style={{ marginTop: "1rem" }}
        size="big"
        verticalAlign="middle"
        selection
      >
        <Link href="/">
          <List.Item active={isActive("/")}>
            <Icon
              name="home"
              size="large"
              color={isActive("/") ? "teal" : undefined}
            />
            <List.Content>
              <List.Header content="Home" />
            </List.Content>
          </List.Item>
        </Link>
        <List.Item onClick={() => logoutUser(email)}>
          <Icon name="log out" size="large" />
          <List.Content>
            <List.Header content="Logout" />
          </List.Content>
        </List.Item>
      </List>
    </>
  );
};

export default SideMenu;
