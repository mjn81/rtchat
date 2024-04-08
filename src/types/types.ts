import { FriendRequest } from "@/db/schema";

export type IncomingFriendRequest = { friendRequest: FriendRequest; user: User };
