import { Center, Footer, Group } from "@mantine/core";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";

import { Route } from "enums";
import { openSheet } from "store/Sheets";

import {
  CompassIcon,
  HomeIcon,
  ProfileIcon,
  PlusIcon,
  CollectionIcon,
  BellIcon,
} from "icons/StemstrIcon";
import BottomNavigationItem, {
  AuthBottomNavigationItem,
} from "components/BottomNavigationItem/BottomNavigationItem";

import useStyles from "./BottomNavigation.styles";

export default function BottomNavigation() {
  const { classes } = useStyles();
  const { pathname } = useRouter();
  const dispatch = useDispatch();

  const openPostSheet = () => {
    dispatch(openSheet("postSheet"));
  };

  if (pathname === Route.Login || pathname === Route.Signup) return null;

  return (
    <Footer
      height={88}
      p="md"
      styles={{
        root: {
          width: "100%",
          left: "0",
          right: "0",
        },
      }}
      className={classes.footer}
    >
      <Group
        position="apart"
        align="center"
        spacing="xl"
        className={classes.group}
        maw={600}
        mx="auto"
      >
        <BottomNavigationItem />
        <BottomNavigationItem />
        <AuthBottomNavigationItem onClick={openPostSheet}>
          <Center
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background:
                "linear-gradient(142.52deg, #856BA3 9.14%, rgba(129, 36, 238, 0.76) 90.68%)",
              color: "white",
              cursor: "pointer",
            }}
          >
            <PlusIcon />
          </Center>
        </AuthBottomNavigationItem>
        <BottomNavigationItem />
        <BottomNavigationItem />
      </Group>
    </Footer>
  );
}
