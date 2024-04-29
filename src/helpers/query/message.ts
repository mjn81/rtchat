import { MESSAGE_HISTORY_LIMIT } from '@/constants/message';
import { Message, messages } from '@/db/schema';
import { db } from '@/lib/db';
import { and, asc, desc, eq, gt, lt, lte } from 'drizzle-orm';

export type ChatRoomMessages = {
	messages: Message[];
	hasMore: boolean;
	nextCursor: string | null;
};

export const getChatRoomMessages = async ({
	roomId,
	limit = MESSAGE_HISTORY_LIMIT,
	cursor = undefined,
}: {
	limit?: number;
	cursor?: string;
	roomId: string;
}): Promise<ChatRoomMessages> => {
	// cursor pagination
	const rowLimit = limit + 1;
	const cursorMessage = cursor
		? await db.query.messages.findFirst({
				where: (message) => eq(message.id, cursor),
		  })
		: null;
	const dbMessages = await db.query.messages.findMany({
		where: (message) =>
			and(
				eq(message.chatRoomId, roomId),
				cursorMessage
					? lte(message.createdAt, cursorMessage.createdAt)
					: undefined
			),
		orderBy: desc(messages.createdAt),
		limit: rowLimit,
	});

	const hasMore = dbMessages.length > limit;
	let nextCursor = null;
	if (hasMore) {
		nextCursor = dbMessages.pop()?.id;
  }
  
  // include cursor message
  if (cursorMessage) {
    dbMessages.unshift(cursorMessage);
  }

	return {
		messages: dbMessages,
		hasMore,
		nextCursor: nextCursor ? nextCursor : null,
	};
};
