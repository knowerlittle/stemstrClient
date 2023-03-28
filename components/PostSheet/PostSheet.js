import { Button, Drawer, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDispatch, useSelector } from "react-redux";
import { closeSheet, openSheet } from "../../store/Sheets";
import SoundFieldGroup from "../FieldGroups/SoundFieldGroup";
import CommentFieldGroup from "../FieldGroups/CommentFieldGroup";
import TagsFieldGroup from "../FieldGroups/TagsFieldGroup";
import ShareAcrossField from "../ShareAcrossField/ShareAcrossField";
import { parseHashtags } from "../Fields/TagsField/TagsField";
import useNostr from "../../nostr/hooks/useNostr";

export default function PostSheet() {
  const { publish, signEvent } = useNostr();
  const sheetKey = "postSheet";
  const auth = useSelector((state) => state.auth);
  const relays = useSelector((state) => state.relays);
  const opened = useSelector((state) => state.sheets[sheetKey]);
  const dispatch = useDispatch();
  const form = useForm({
    initialValues: {
      file: null,
      uploadResponse: {
        streamUrl: null,
        downloadUrl: null,
      },
      comment: "",
      tags: "",
      shareAcross: true,
    },
    validate: {},
  });

  const handleSubmit = async (values) => {
    let hashtags = parseHashtags(values.tags);
    let created_at = Math.floor(Date.now() / 1000);
    let tags = [
      ["client", "stemstr.app"],
      ["stemstr_version", "1.0"],
    ];
    hashtags.forEach((hashtag) => {
      tags.push(["t", hashtag]);
    });

    if (values.uploadResponse.streamUrl && values.uploadResponse.downloadUrl) {
      tags.push(["download_url", values.uploadResponse.downloadUrl]);
      tags.push(["stream_url", values.uploadResponse.streamUrl]);
      let event = {
        kind: 1808,
        created_at: created_at,
        tags: tags,
        content: `${values.comment}`,
      };
      signEvent(event).then((event) => {
        if (event) {
          console.log(event);
          publish(event, [process.env.NEXT_PUBLIC_STEMSTR_RELAY]);
          form.reset();
          dispatch(closeSheet(sheetKey));
        }
      });
    } else {
      let event = {
        kind: 1,
        created_at: created_at,
        tags: tags,
        content: `${values.comment}`,
      };
      signEvent(event).then((event) => {
        if (event) {
          publish(event, [process.env.NEXT_PUBLIC_STEMSTR_RELAY]);
          form.reset();
          dispatch(closeSheet(sheetKey));
        }
      });
    }
  };

  const toggleSheet = () => {
    if (opened) {
      dispatch(closeSheet(sheetKey));
    } else {
      dispatch(openSheet(sheetKey));
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={() => toggleSheet()}
      position="bottom"
      title="Share"
      padding="md"
      size="full"
      styles={(theme) => ({
        header: {
          paddingTop: 8,
          color: theme.white,
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 40,
        },
        closeButton: {
          color: theme.white,
          svg: {
            width: 24,
            height: 24,
          },
        },
        drawer: {
          backgroundColor: theme.colors.dark[8],
          paddingTop: 24,
          maxWidth: 600,
          margin: "auto",
        },
      })}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing={28}>
          <SoundFieldGroup form={form} {...form.getInputProps("file")} />
          <CommentFieldGroup {...form.getInputProps("comment")} />
          <TagsFieldGroup {...form.getInputProps("tags")} />
          <ShareAcrossField {...form.getInputProps("shareAcross")} />
          <Button type="submit">Share</Button>
        </Stack>
      </form>
    </Drawer>
  );
}
