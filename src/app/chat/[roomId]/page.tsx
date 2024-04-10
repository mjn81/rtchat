import ChatInput from '@/components/ChatInput';
import Messages from '@/components/Messages';
import RoomHeader from '@/components/RoomHeader';
import { RoomInfoModal, RoomInfoModalProps } from '@/components/RoomInfoHeader';
import { chatRoomMemberStatus, chatRoomMembers, messages, users } from '@/db/schema';
import { authOptions } from '@/lib/auth';
import { getFriendFromChatRoomName, isUserPrivateChat } from '@/lib/utils';
import { and, desc, eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { type FC, type PropsWithChildren } from 'react';

interface PageProps extends PropsWithChildren {
  params: {
    roomId: string,
  }
}

const Page: FC<PageProps> = async ({ children, params: { roomId } }) => {
	const session = await getServerSession(authOptions);
  const chatRoomDetails = await db?.query.chatRooms.findFirst({
		where: (chatRoom) => eq(chatRoom.id, roomId),
  });
	if (!session) notFound()
	if (!chatRoomDetails) redirect('/chat');
  const isMember = await db?.query.chatRoomMembers.findFirst({
		where: (member) =>
			and(
				eq(member.chatRoomId, roomId),
				eq(member.userId, session.user.id),
				eq(member.status, chatRoomMemberStatus.enumValues[0])
			),
	});
  if (!isMember) notFound()
  
  const initialMessages = await db?.query.messages.findMany({
    where: (message) => eq(message.chatRoomId, roomId),
    orderBy: desc(messages.createdAt),
  });
  
  const roomName = chatRoomDetails.name;
  if (isUserPrivateChat(roomName)) {
    const friendId = getFriendFromChatRoomName(roomName, session.user.id);
    const friendDetail = await db?.query.users.findFirst({
      where: (user) => eq(user.id, friendId),
    });

    if (!friendDetail) notFound();
    return (
			<div className="flex flex-col flex-1 justify-between h-full max-h-[calc(100vh-2rem)]">
				<div className="flex sm:items-center  justify-between pb-3 border-b-2 border-gray-200">
					{/* <RoomHeader
						isPrivate
						roomImage={friendDetail.image ?? ''}
						roomName={friendDetail.name ?? ''}
						friendEmail={friendDetail.email}
					/> */}
				</div>

				<Messages
					chatId={roomId}
					sessionImg={session.user.image}
					chatPartners={[friendDetail]}
					sessionId={session.user.id}
					initialMessages={initialMessages ?? []}
				/>
				<ChatInput chatId={roomId} chatPartner={friendDetail} />
			</div>
		);
	}
	
	const members = await db
		?.select({
			user: users,
			chatRoomMember: {
				status: chatRoomMembers.status,
			}
		})
		.from(chatRoomMembers)
		.where(eq(chatRoomMembers.chatRoomId, roomId))
		.innerJoin(users, eq(chatRoomMembers.userId, users.id));
	
	const joinedMembers: User[] = [];
	// including users that left chat
	const allMembersInfoMembers: User[] = [];
	
	for (const {chatRoomMember, user} of members ?? []) {
		if (chatRoomMember.status === chatRoomMemberStatus.enumValues[0]) {
			joinedMembers.push(user);
		}
		allMembersInfoMembers.push(user);
	}
		
  return (
		<div className="flex flex-col flex-1 justify-between h-full max-h-[calc(100vh-2rem)]">
			<div className="flex sm:items-center  justify-between pb-3 border-b-2 border-gray-200">
				<RoomHeader
					roomImage=""
					roomName={chatRoomDetails.name}
					membersCount={joinedMembers.length}
					Modal={RoomInfoModal}
					modalProps={
						{
							roomDetail: chatRoomDetails,
							members: joinedMembers,
							sessionId: session.user.id,
						} satisfies RoomInfoModalProps
					}
				/>
			</div>

			<Messages
				chatId={roomId}
				sessionImg={session.user.image}
				chatPartners={allMembersInfoMembers}
				sessionId={session.user.id}
				initialMessages={initialMessages ?? []}
			/>
			<ChatInput isRoom chatId={roomId} roomName={chatRoomDetails.name} />
		</div>
	);
}

export default Page;