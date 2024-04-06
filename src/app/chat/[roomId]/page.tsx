import ChatInput from '@/components/ChatInput';
import Messages from '@/components/Messages';
import { chatRoomMembers, messages, users } from '@/db/schema';
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
        eq(member.userId, session.user.id)
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
					<div className="relative flex items-center space-x-4">
						<div className="relative">
							<div className="relative w-8 h-8 sm:w-12 sm:h-12">
								<Image
									fill
									referrerPolicy="no-referrer"
									src={friendDetail.image ?? ''}
									alt={`${friendDetail.name} profile picture`}
									className="rounded-full"
								/>
							</div>
						</div>

						<div className="flex flex-col leading-tight">
							<div className="text-xl flex items-center">
								<span className="text-gray-700 mr-3 font-semibold">
									{friendDetail.name}
								</span>
							</div>

							<span className="text-sm text-gray-600">{friendDetail.email}</span>
						</div>
					</div>
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
		})
		.from(chatRoomMembers)
		.where(eq(chatRoomMembers.chatRoomId, roomId))
		.innerJoin(users, eq(chatRoomMembers.userId, users.id));
	const userInfoMembers = members?.map(member => member.user)
		?? [];
  return (
		<div className="flex flex-col flex-1 justify-between h-full max-h-[calc(100vh-2rem)]">
			<div className="flex sm:items-center  justify-between pb-3 border-b-2 border-gray-200">
				<div className="relative flex items-center space-x-4">
					<div className="relative">
						<div className="relative w-8 h-8 sm:w-12 sm:h-12">
							<Image
								fill
								referrerPolicy="no-referrer"
								src={''}
								alt={`${chatRoomDetails.name} profile picture`}
								className="rounded-full"
							/>
						</div>
					</div>

					<div className="flex flex-col leading-tight">
						<div className="text-xl flex items-center">
							<span className="text-gray-700 mr-3 font-semibold">
								{chatRoomDetails.name}
							</span>
						</div>

						<span className="text-sm text-gray-600">
							{!!members && members.length > 1
								? `${members.length} members`
								: `1 member`}
						</span>
					</div>
				</div>
			</div>

			<Messages
				chatId={roomId}
				sessionImg={session.user.image}
				chatPartners={userInfoMembers}
				sessionId={session.user.id}
				initialMessages={initialMessages ?? []}
			/>
			<ChatInput isRoom chatId={roomId} roomName={chatRoomDetails.name} />
		</div>
	);
}

export default Page;