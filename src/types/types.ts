import { FriendRequest, Message } from "@/db/schema";

export type IncomingFriendRequest = { friendRequest: FriendRequest; user: User };

export type ExtendedMessage = {
  message: Message;
  sender: Omit<User, "emailVerified">;
}

export type ChatContextMessage = Message & {
	isLoading: boolean;
	isError: boolean;
	error: string;
};