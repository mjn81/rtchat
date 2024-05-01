import { db } from '@/lib/db';
import ChatInput from '@/components/ChatInput';
import Messages from '@/components/Messages';
import RoomHeader from '@/components/RoomHeader';
import {
	FriendRoomInfoModal,
	FriendRoomInfoModalProps,
	RoomInfoModal,
	RoomInfoModalProps,
} from '@/components/RoomInfoHeader';
import { chatRoomMemberStatus, chatRoomMembers, users } from '@/db/schema';
import { authOptions } from '@/lib/auth';
import { getFriendFromChatRoomName, isUserPrivateChat } from '@/lib/utils';
import { and, desc, eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { type FC, type PropsWithChildren } from 'react';
import { getChatRoomMessages } from '@/helpers/query/message';
import { ChatContextProvider } from '@/context/ChatContext';
import { ChatContextMessage } from '@/types/types';

interface PageProps extends PropsWithChildren {
	params: {
		roomId: string;
	};
}

const Page: FC<PageProps> = async ({ children, params: { roomId } }) => {
	const session = await getServerSession(authOptions);
	const chatRoomDetails = await db?.query.chatRooms.findFirst({
		where: (chatRoom) => eq(chatRoom.id, roomId),
	});
	if (!session) notFound();
	if (!chatRoomDetails) redirect('/chat');
	const isMember = await db?.query.chatRoomMembers.findFirst({
		where: (member) =>
			and(
				eq(member.chatRoomId, roomId),
				eq(member.userId, session.user.id),
				eq(member.status, chatRoomMemberStatus.enumValues[0])
			),
	});
	if (!isMember) notFound();

	const {
		messages: initialMessages,
		nextCursor: cursor,
		hasMore,
	} = await getChatRoomMessages({
		roomId,
	});

	const roomName = chatRoomDetails.name;
	if (isUserPrivateChat(roomName)) {
		const friendId = getFriendFromChatRoomName(roomName, session.user.id);
		const friendDetail = await db?.query.users.findFirst({
			where: (user) => eq(user.id, friendId),
		});

		if (!friendDetail) notFound();
		return (
			<div className="flex flex-col flex-1 justify-between h-full lg:max-h-[calc(100vh-2rem)]">
				<div className="flex sm:items-center justify-between pb-3 border-b-2 border-gray-200">
					<RoomHeader
						sessionId={session.user.id}
						isPrivate
						roomImage={friendDetail.image ?? ''}
						initialRoomName={friendDetail.name ?? ''}
						friendEmail={friendDetail.email}
						Modal={FriendRoomInfoModal}
						modalProps={
							{
								friend: friendDetail,
								sessionId: session.user.id,
							} satisfies FriendRoomInfoModalProps
						}
					/>
				</div>
				<ChatContextProvider>
					<Messages
						chatId={roomId}
						user={session.user as User}
						chatPartnersMap={new Map([[friendId, friendDetail]])}
						initialMessages={initialMessages as ChatContextMessage[] ?? []}
						nextCursor={cursor}
						hasMore={hasMore}
					/>
					<ChatInput sessionId={session.user.id} chatId={roomId} chatPartner={friendDetail} />
				</ChatContextProvider>
			</div>
		);
	}

	const members = await db
		?.select({
			user: users,
			chatRoomMember: {
				status: chatRoomMembers.status,
			},
		})
		.from(chatRoomMembers)
		.where(eq(chatRoomMembers.chatRoomId, roomId))
		.innerJoin(users, eq(chatRoomMembers.userId, users.id));

	const joinedMembers: User[] = [];
	// including users that left chat
	const chatRoomMembersMap = new Map<string, User>();
	for (const { chatRoomMember, user } of members ?? []) {
		if (chatRoomMember.status === chatRoomMemberStatus.enumValues[0]) {
			joinedMembers.push(user);
		}
		chatRoomMembersMap.set(user.id, user);
	}

	return (
		<div className="flex flex-col flex-1 justify-between h-full max-h-[calc(100vh-2rem)]">
			<div className="flex sm:items-center  justify-between pb-3 border-b-2 border-gray-200">
				<RoomHeader
					roomImage=""
					sessionId={session.user.id}
					initialRoomName={chatRoomDetails.name}
					membersCountInitial={joinedMembers.length}
					Modal={RoomInfoModal}
					roomId={roomId}
					modalProps={
						{
							roomDetail: chatRoomDetails,
							membersInitial: joinedMembers,
							sessionId: session.user.id,
						} satisfies RoomInfoModalProps
					}
				/>
			</div>
			<ChatContextProvider>
				<Messages
					chatId={roomId}
					user={session.user as User}
					chatPartnersMap={chatRoomMembersMap}
					initialMessages={initialMessages as ChatContextMessage[] ?? []}
					nextCursor={cursor}
					hasMore={hasMore}
				/>
				<ChatInput isRoom sessionId={session.user.id} chatId={roomId} roomName={chatRoomDetails.name} />
			</ChatContextProvider>
		</div>
	);
};

export default Page;
