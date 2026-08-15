export type SessionPresenceMessage = {
  type: "presence";
  count: number;
};

export type SessionMessage = SessionPresenceMessage;

export type CreateSessionResponse = {
  id: string;
  joinPath: string;
};

export type SessionStatusResponse = {
  id: string;
  participantCount: number;
  alive: boolean;
};
