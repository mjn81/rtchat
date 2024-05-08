import { db } from '@/lib/db';
import {
	chatRoomMemberStatus,
	chatRoomMembers,
	chatRooms,
	friendRequestStatus,
	friendRequests,
} from '@/db/schema';
import { nanoid } from 'nanoid';
import { and, count, eq } from 'drizzle-orm';
import { getRedisClient } from '../redis';
import {
	createUnseenChatUserKey,
	getFriendFromChatRoomName,
	isUserPrivateChat,
} from '@/lib/utils';

export const addMembersToChatRoom = async (
	chatRoomId: string,
	memberIds: string[]
) => {
	try {
		const members: any[] = [];
		for (const memberId of memberIds) {
			members.push({
				chatRoomId,
				userId: memberId,
			});
		}
		await db?.insert(chatRoomMembers).values(members);
	} catch (e) {
		console.error(e);
	}
};

export const getChatsWithUnseenCount = async (userId: string) => {
	const chats = await db
		?.selectDistinct({ chatRoom: chatRooms })
		.from(chatRoomMembers)
		.where(
			and(
				eq(chatRoomMembers.userId, userId),
				eq(chatRoomMembers.status, chatRoomMemberStatus.enumValues[0])
			)
		)
		.innerJoin(chatRooms, eq(chatRooms.id, chatRoomMembers.chatRoomId));

	const processesChats = await Promise.all(
		chats?.map(async (chat) => {
			if (isUserPrivateChat(chat.chatRoom.name)) {
				const friendId = getFriendFromChatRoomName(chat.chatRoom.name, userId);
				const friendDetail = await db?.query.users.findFirst({
					columns: {
						email: true,
						name: true,
					},
					where: (user) => eq(user.id, friendId),
				});

				return {
					...chat.chatRoom,
					name: friendDetail?.name ?? friendDetail?.email ?? 'Deleted',
				};
			}

			return chat.chatRoom;
		}) ?? []
	);

	const unseenRequestCount = await db
		?.select({ count: count() })
		.from(friendRequests)
		.where(
			and(
				eq(friendRequests.toUserId, userId),
				eq(friendRequests.status, friendRequestStatus.enumValues[0])
			)
		);
	const redis = await getRedisClient();
	const chatIdUnseen: Map<string, number> = new Map();


	if (processesChats.length === 0) {
		return { processesChats, chatIdUnseen, unseenRequestCount };
	}
	const unseenChatUserKeyList = processesChats.map(({ id }) =>
		createUnseenChatUserKey(id, userId)
	);

	const unseenList = await redis.mGet(unseenChatUserKeyList);
	
	for(let i = 0; i < unseenList.length; i++) {
		chatIdUnseen.set(processesChats[i].id, Number(unseenList[i]) ?? 0);
	}

	return { processesChats, chatIdUnseen, unseenRequestCount };
};

export const generateChatRoomUrl = (name: string) => {
	return name.replace(/\s/g, '_').toLowerCase() + nanoid(10);
};
