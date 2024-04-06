import { Message } from "@/db/schema";
import axios from "axios";
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const push = async (message: Message, id: string) => {
  return axios.post('http://localhost:4000/api/push', {
		message,
		id,
	});
}

export const createChatRoomForTwoFriends = (friendId1: string, friendId2: string) =>
	[friendId1, friendId2].sort().join('$');

export const isUserPrivateChat = (roomName: string) => roomName.includes('$');

export const getFriendFromChatRoomName = (roomName: string, userId: string) =>
	roomName.split('$').find((id) => id !== userId) as string;


export const requestFriendToJoinMessage = (url: string) =>
	`Join Our Chatroom!
	Hi,
	Hope you're good! We've got this cool chatroom going on and I thought you might want to join in. Just click here ${url} to jump in!
	Catch you there!
	Cheers`;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
