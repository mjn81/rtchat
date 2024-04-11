import { Message } from "@/db/schema";
import { SOCKET_API_URL } from "@/constants/socket";
import axios from "axios";
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const push = async (data: any, id: string) => {
  return axios.post(`${SOCKET_API_URL}/api/push`, {
		data,
		id,
	});
}

export const chatEventListener = (chatId: string) => `chat:${chatId}`;
export const friendRequestEventListener = (userId: string) =>
	`friendRequest:${userId}`;
export const changeFriendRequestStatusEventListener = (userId: string) =>
	`changeFriendRequestStatus:${userId}`;

export const newRoomEventListener = (userId: string) => `newRoom:${userId}`;

export const newMessageEventListener = (userId: string) => `newMessage:${userId}`; 

export const leaveRoomEventListener = (chatId: string) => `leaveRoom:${chatId}`;
export const deleteRoomEventListener = (chatId: string) =>
	`deleteRoom:${chatId}`;
export const updateRoomEventListener = (chatId: string) =>
	`updateRoomInfo:${chatId}`;

export const deleteUserEventListener = (chatId: string) => `deleteUser:${chatId}`;

export const joinedEventListener = (chatId: string) => `joined:${chatId}`;

export const createChatRoomForTwoFriends = (friendId1: string, friendId2: string) =>
	[friendId1, friendId2].sort().join('$');

export const isUserPrivateChat = (roomName: string) => roomName.includes('$');

export const getFriendFromChatRoomName = (roomName: string, userId: string) =>
	roomName.split('$').find((id) => id !== userId) as string;

/// TODO: make this into markdown
export const requestFriendToJoinMessage = (url: string) =>
	`Join Our Chatroom!
	Hi,
	Hope you're good! We've got this cool chatroom going on and I thought you might want to join in. <a href="${url}">Just click here</a> to jump in!
	Catch you there!
	Cheers</pre>`;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}


export const getCurrentChatId = (currentPath: string | undefined | null) => {
	if (!currentPath || !currentPath.includes('chat')) {
		return '';
	}
	return currentPath.split('/').pop() as string;
}

export const createJoinRoomURL = (uri: string) => `${process.env.NEXT_PUBLIC_BASE_URL}/join/${uri}`
/// takes the url and returns shortened version with ****_**** pattern
export const createProtectedText = (text: string) => {
	const [first, second] = text.split('_');
	return `${first.slice(0, 3)}${'*'.repeat(first.length -3)}_${'*'.repeat( second.length)}`;
}

export const createUnseenChatUserKey = (chatId: string,userId: string) => `chat:unseen:${chatId}:${userId}`;