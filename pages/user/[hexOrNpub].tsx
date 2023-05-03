import { useEffect, useMemo } from "react";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Group,
  Image,
  Stack,
  Text,
} from "@mantine/core";
import Head from "next/head";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import { selectAuthState, reset as logout } from "store/Auth";
import { Route } from "enums/routes";
import { useProfile } from "nostr/hooks/useProfile";
import { getPublicKeys } from "nostr/utils";
import useContactList from "nostr/hooks/useContactList";
import ProfileActionButton from "components/ProfileActionButton/ProfileActionButton";
import CopyNpub from "components/CopyNpub/CopyNpub";
import ProfileFeed from "components/ProfileFeed/ProfileFeed";
import BackButton from "components/BackButton/BackButton";
import {
  SettingsIcon,
  ZapIcon,
  ShareIcon,
  EditIcon,
  VerifiedIcon,
  ChevronLeftIcon,
} from "icons/StemstrIcon";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { hexOrNpub } = router.query;
  const { pk, npub } = useMemo(
    () => getPublicKeys(hexOrNpub as string),
    [hexOrNpub]
  );
  const authState = useSelector(selectAuthState);
  const { data: userData, nip05 } = useProfile({
    pubkey: pk,
  });
  const { contactList, relayList } = useContactList({
    pubkey: pk,
  });

  const handleLogout = () => {
    dispatch(logout());
    router.push(Route.Login);
  };

  return (
    <>
      <Head>
        <title>{`Stemstr - ${userData?.display_name || "Profile"}`}</title>
      </Head>
      <Box
        sx={(theme) => ({
          padding: `${theme.spacing.md}px ${theme.spacing.md}px 0`,
          height: 200,
        })}
      >
        {userData?.banner && (
          <Image
            src={userData.banner}
            height={200}
            styles={(theme) => ({
              root: {
                position: "absolute",
                zIndex: -1,
                top: 0,
                left: 0,
                right: 0,
              },
              imageWrapper: {
                position: "static",
              },
            })}
          />
        )}
        <Group position="apart">
          <Group spacing="sm" align="center" c="white">
            <BackButton defaultUrl={Route.Home}>
              <ChevronLeftIcon width={24} height={24} />
            </BackButton>
            <Text c="white" fw="bold" fz={24} lh="normal">
              Profile
            </Text>
          </Group>
          <Group spacing={20}>
            <ActionIcon variant="default" color="white">
              <SettingsIcon width={24} height={24} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>
      <Group pl="md" pr="md" mb="lg" position="apart" mt={-50}>
        <Avatar
          src={userData?.picture}
          alt={userData?.name}
          size={100}
          radius={50}
        />
        <Group>
          <ProfileActionButton>
            <ShareIcon width={13} height={13} />
          </ProfileActionButton>
          <ProfileActionButton>
            <ZapIcon width={13} height={13} />
          </ProfileActionButton>
          <ProfileActionButton>
            <EditIcon width={13} height={13} />
            <Text lh="normal" ml={8}>
              Edit Profile
            </Text>
          </ProfileActionButton>
        </Group>
      </Group>
      <Stack spacing={6} mb="xl" pl="md" pr="md" c="white">
        <Text size="lg" color="white" fw="bold">
          {userData?.display_name
            ? userData.display_name
            : `@${pk.substring(0, 5)}...`}
        </Text>
        <Group spacing={4}>
          <Text size="sm">{userData?.name && `@${userData.name}`}</Text>
          {nip05 && (
            <>
              <VerifiedIcon width={14} height={14} />
              <Text size="sm" color="purple.2">
                {userData?.nip05 &&
                  userData.nip05.slice(userData.nip05.indexOf("@") + 1)}
              </Text>
            </>
          )}
        </Group>
        <Text size="sm" mb={8} sx={{ whiteSpace: "pre-wrap" }}>
          {userData?.about}
        </Text>
        <CopyNpub npub={npub} />
      </Stack>
      <Group
        spacing="xl"
        position="center"
        sx={(theme) => ({
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          marginBottom: theme.spacing.md,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderLeftWidth: 0,
          borderRightWidth: 0,
          borderStyle: "solid",
          borderColor: theme.fn.rgba(theme.colors.gray[0], 0.1),
          fontSize: 14,
          color: theme.white,
          [theme.fn.largerThan("sm")]: {
            marginLeft: -theme.spacing.md,
            marginRight: -theme.spacing.md,
          },
        })}
      >
        <Text>
          <Text span fw={700}>
            {contactList ? contactList.tags.length : 0}
          </Text>{" "}
          following
        </Text>
        <Text>
          <Text span fw={700}>
            ?
          </Text>{" "}
          followers
        </Text>
        <Text>
          <Text span fw={700}>
            {Object.keys(relayList).length}
          </Text>{" "}
          relays
        </Text>
      </Group>
      <Box pl="md" pr="md">
        {authState?.user?.npub === npub ? (
          <Button onClick={handleLogout} mb="md">
            Logout
          </Button>
        ) : null}
        <ProfileFeed pubkey={pk} />
      </Box>
    </>
  );
}