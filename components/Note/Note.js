import {
  Anchor,
  Avatar,
  Box,
  Center,
  Chip,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import Link from "next/link";
import { Kind, nip19 } from "nostr-tools";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { cacheProfile, getCachedProfile } from "../../cache/cache";
import {
  CommentIcon,
  MoreIcon,
  ShakaIcon,
  VerifiedIcon,
  ZapIcon,
} from "../../icons/StemstrIcon";
import useNostr from "../../nostr/hooks/useNostr";
import { useProfile } from "../../nostr/hooks/useProfile";
import { getRelativeTimeString } from "../../nostr/utils";
import DownloadSoundButton from "../DownloadSoundButton/DownloadSoundButton";
import NoteAction from "../NoteAction/NoteAction";
import SoundPlayer from "../SoundPlayer/SoundPlayer";
import RepostButton from "../RepostButton/RepostButton";
import useStyles from "./Note.styles";
import { Route } from "enums";

export default function Note(props) {
  const { note, type } = props;
  const { publish, signEvent } = useNostr();
  const auth = useSelector((state) => state.auth);
  const cachedProfile = getCachedProfile(nip19.npubEncode(note.event.pubkey));
  const [userData, setUserData] = useState(cachedProfile);
  const [profileFetched, setProfileFetched] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("initial");
  const { data } = useProfile({
    pubkey: note.event.pubkey,
  });
  const downloadUrl = useMemo(() => {
    const downloadUrlTag =
      note.event.tags?.find((tag) => tag[0] === "download_url") || null;
    return downloadUrlTag ? downloadUrlTag[1] : null;
  }, [note.event]);

  const handleClickShaka = () => {
    let created_at = Math.floor(Date.now() / 1000);
    let tags = [
      ["p", note.event.pubkey],
      ["e", note.event.id],
    ];
    let reactionEvent = {
      kind: Kind.Reaction,
      created_at: created_at,
      tags: tags,
      content: "🤙",
    };
    signEvent(reactionEvent).then((reactionEvent) => {
      if (reactionEvent) {
        publish(reactionEvent, [process.env.NEXT_PUBLIC_STEMSTR_RELAY]);
      }
    });
  };

  useEffect(() => {
    if (!profileFetched && data) {
      setProfileFetched(true);
      setUserData(data);
      cacheProfile(data.npub, data);
    }
  }, [data, setUserData]);

  return (
    <Stack>
      <Group position="apart">
        <Group spacing={6}>
          <Anchor component={Link} href={`/user/${note.event.pubkey}`}>
            <Avatar
              src={userData?.picture}
              alt={userData?.name}
              size={42}
              radius="50%"
            />
          </Anchor>
          <Text size="lg" color="white">
            {userData?.display_name
              ? userData.display_name
              : `@${note.event.pubkey.substring(0, 5)}...`}
          </Text>
          <VerifiedIcon width={14} height={14} />
          <Text size="xs" color="rgba(255, 255, 255, 0.74)">
            {userData?.name ? `@${userData.name}` : ""}
          </Text>
          <Text size="sm" color="rgba(255, 255, 255, 0.38)">
            · {getRelativeTimeString(note.event.created_at)}
          </Text>
        </Group>
        <Group position="right">
          <DownloadSoundButton
            href={downloadUrl}
            downloadStatus={downloadStatus}
            setDownloadStatus={setDownloadStatus}
          />
          <Center
            sx={(theme) => ({
              width: 28,
              height: 28,
              color: theme.colors.gray[2],
            })}
          >
            <MoreIcon width={24} height={24} />
          </Center>
        </Group>
      </Group>
      <Group noWrap>
        {type === "parent" && (
          <Box
            pl="md"
            mr="md"
            sx={(theme) => ({
              alignSelf: "stretch",
              borderRight: `1px solid ${theme.colors.gray[4]}`,
            })}
          />
        )}
        <Stack>
          <SoundPlayer
            event={note.event}
            downloadStatus={downloadStatus}
            setDownloadStatus={setDownloadStatus}
          />
          <Text c="white" sx={{ overflowWrap: "anywhere" }}>
            {note.event.content}
          </Text>
          <Group position="left">
            {note.event?.tags
              ?.filter((tag) => tag[0] == "t")
              .map((tag, index) => (
                <Chip radius="md" key={index}>
                  #{tag[1]}
                </Chip>
              ))}
          </Group>
          <Group position="apart">
            <NoteAction>
              <Anchor
                component={Link}
                href={`${Route.Thread}/${note.event.id}`}
                sx={{
                  color: "white",
                  ":hover": {
                    textDecoration: "none",
                  },
                }}
              >
                <Group position="center" spacing={6}>
                  <CommentIcon width={18} height={18} />{" "}
                  <Text lh="normal" c="gray.1">
                    {note.replies.length}
                  </Text>
                </Group>
              </Anchor>
            </NoteAction>
            {/* <RepostButton note={note} /> */}
            {/* <NoteAction>
            <ShakaIcon onClick={handleClickShaka} width={18} height={18} /> 0
          </NoteAction> */}
            {/* <NoteAction>
            <ZapIcon width={18} height={18} /> 4
          </NoteAction> */}
          </Group>
        </Stack>
      </Group>
    </Stack>
  );
}

export function FeedNote(props) {
  const { classes } = useStyles();

  return (
    <Box className={classes.box}>
      <Note {...props} />
    </Box>
  );
}
