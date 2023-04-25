import { Event, nip19 } from "nostr-tools";

export const uniqBy = <T>(arr: T[], key: keyof T): T[] => {
  return Object.values(
    arr.reduce(
      (map, item) => ({
        ...map,
        [`${item[key]}`]: item,
      }),
      {}
    )
  );
};

export const uniqValues = (value: string, index: number, self: string[]) => {
  return self.indexOf(value) === index;
};

export const dateToUnix = (_date?: Date) => {
  const date = _date || new Date();

  return Math.floor(date.getTime() / 1000);
};

export const log = (
  isOn: boolean | undefined,
  type: "info" | "error" | "warn",
  ...args: unknown[]
) => {
  if (!isOn) return;
  console[type](...args);
};

export const getNoteIds = (noteId: string): { hex: string; bech32: string } => {
  // TODO: Error handling, etc.
  const ids = { hex: "", bech32: "" };
  if (noteId.startsWith("note")) {
    ids.bech32 = noteId;
    let { type, data } = nip19.decode(noteId);
    if (typeof data === "string") {
      ids.hex = data;
    }
  } else {
    ids.hex = noteId;
    ids.bech32 = nip19.noteEncode(noteId);
  }
  return ids;
};

export const getPublicKeys = (
  hexOrNpub: string
): { pk: string; npub: string } => {
  const publicKeys = { pk: "", npub: "" };
  if (isNpub(hexOrNpub)) {
    publicKeys.npub = hexOrNpub;
    let { type, data } = nip19.decode(hexOrNpub);
    publicKeys.pk = data as string;
  } else if (isHexPubkey(hexOrNpub)) {
    publicKeys.pk = hexOrNpub;
    publicKeys.npub = nip19.npubEncode(hexOrNpub);
  } else {
    // TODO: throw error
  }
  return publicKeys;
};

// TODO: Write this function fr
export const isNpub = (hexOrNpub: string): boolean => {
  return hexOrNpub.startsWith("npub1");
};

// TODO: Write this function fr
export const isHexPubkey = (hexOrNpub: string): boolean => {
  return !isNpub(hexOrNpub);
};

export const abbreviateKey = (key: string): string => {
  return `${key.slice(0, 12)}...${key.slice(-12)}`;
};

export const usesDepecratedETagSchema = (event: Event | undefined) => {
  if (!event) return false;
  const tag = event.tags.find((t) => t[0] === "e");
  if (tag && tag[3] !== undefined) {
    return false;
  }
  return !!tag;
};

interface ParsedEventTags {
  rootId: string | undefined;
  mentionIds: string[];
  replyingToId: string | undefined;
}

export const parseEventTags = (event: Event) => {
  const result: ParsedEventTags = {
    rootId: "",
    mentionIds: [],
    replyingToId: "",
  };
  const eTags = event.tags.filter((t) => t[0] === "e");
  if (usesDepecratedETagSchema(event)) {
    if (eTags) {
      if (eTags.length === 1) {
        result.replyingToId = eTags[0][1];
      }
      if (eTags.length > 0) {
        result.rootId = eTags[0][1];
      }
      if (eTags.length > 1) {
        console.log(eTags);
        result.replyingToId = eTags[eTags.length - 1][1];
      }
      if (eTags.length > 2) {
        for (let i = 1; i < eTags.length - 1; i++) {
          result.mentionIds.push(eTags[i][1]);
        }
      }
    }
  } else {
    eTags?.forEach((t) => {
      switch (t[3]) {
        case "root":
          result.rootId = t[1];
          break;
        case "reply":
          result.replyingToId = t[1];
          break;
        case "mention":
          result.mentionIds.push(t[1]);
          break;
      }
    });
  }
  return result;
};

export const getRelativeTimeString = (timestamp: number) => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const diffInSeconds = nowInSeconds - timestamp;

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  let parts: any[];
  if (diffInSeconds < 60) {
    parts = rtf.formatToParts(-diffInSeconds, "second");
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    parts = rtf.formatToParts(-minutes, "minute");
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    parts = rtf.formatToParts(-hours, "hour");
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    parts = rtf.formatToParts(-days, "day");
  } else if (diffInSeconds < 2628288) {
    const weeks = Math.floor(diffInSeconds / 604800);
    parts = rtf.formatToParts(-weeks, "week");
  } else {
    const months = Math.floor(diffInSeconds / 2628288);
    parts = rtf.formatToParts(-months, "month");
  }

  const v = parts.find((part) => part.type === "integer");
  if (!v) {
    return;
  }

  return `${v.value}${v.unit.substring(0, 1)}`;
};
