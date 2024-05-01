'use server';
import { db } from '@/lib/db';
import type { FC, PropsWithChildren } from 'react';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import SidebarChatList from '@/components/SidebarChatList';
import {
	chatRoomMemberStatus,
	chatRoomMembers,
	chatRooms,
	friendRequestStatus,
	friendRequests,
} from '@/db/schema';
import { and, count, eq } from 'drizzle-orm';
import SignOutButton from '@/components/signOutButton';
import {
	createUnseenChatUserKey,
	getFriendFromChatRoomName,
	getInitials,
	isUserPrivateChat,
} from '@/lib/utils';
import { fetchRedis } from '@/helpers/redis';
import SidebarOptions from '@/components/SidebarOption';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LayoutProps extends PropsWithChildren {}

const Layout: FC<LayoutProps> = async ({ children }) => {
	const session = await getServerSession(authOptions);
	if (!session) notFound();
	// query remove duplicate
	const chats = await db
		?.selectDistinct({ chatRoom: chatRooms })
		.from(chatRoomMembers)
		.where(
			and(
				eq(chatRoomMembers.userId, session.user.id),
				eq(chatRoomMembers.status, chatRoomMemberStatus.enumValues[0])
			)
		)
		.innerJoin(chatRooms, eq(chatRooms.id, chatRoomMembers.chatRoomId));

	const processesChats = await Promise.all(
		chats?.map(async (chat) => {
			if (isUserPrivateChat(chat.chatRoom.name)) {
				const friendId = getFriendFromChatRoomName(
					chat.chatRoom.name,
					session.user.id
				);
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
				eq(friendRequests.toUserId, session.user.id),
				eq(friendRequests.status, friendRequestStatus.enumValues[0])
			)
		);

	const chatIdUnseen: Map<string, number> = new Map();
	await Promise.all(
		processesChats.map(async ({ id }) => {
			const unseen = await fetchRedis(
				'get',
				createUnseenChatUserKey(id, session.user.id)
			);
			chatIdUnseen.set(id, Number(unseen) ?? 0);
		})
	);

	return (
		<div className="w-full flex flex-col-reverse lg:flex-row h-screen">
			<div className="hidden lg:flex w-full h-full max-w-xs grow flex-col gap-y-5 overflow-y-auto overflow-x-hidden border-r border-gray-200 bg-white px-6">
				<Link
					href="/chat"
					className="font-bold text-indigo-600 text-lg flex h-16 w-fit shrink-0 items-center"
				>
					<Image
						className="lg:absolute lg:inset-0"
						src="/logo.svg"
						alt="RTChat"
						width={64}
						height={64}
					/>
				</Link>

				{(chats?.length ?? 0) > 0 ? (
					<div className="text-xs font-semibold leading-6 text-gray-400">
						Your chats
					</div>
				) : null}

				<nav className="flex flex-1 flex-col">
					<ul role="list" className="flex flex-1 flex-col gap-y-7">
						<li>
							<SidebarChatList
								initialUnseen={chatIdUnseen}
								sessionId={session.user.id}
								initialChats={processesChats}
							/>
						</li>

						<li>
							<div className="text-xs font-semibold leading-6 text-gray-400">
								Overview
							</div>
							<SidebarOptions
								sessionId={session.user.id}
								unseenRequestCount={unseenRequestCount?.at(0)?.count ?? 0}
							/>
						</li>

						<li className="-mx-6 mt-auto flex items-center gap-2">
							<div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
								<Avatar asChild>
									<div className="relative h-8 w-8">
										<AvatarImage
											width={32}
											height={32}
											referrerPolicy="no-referrer"
											src={session.user.image || ''}
											alt="Profile picture"
										/>
										<AvatarFallback>
											{getInitials(session.user.name ?? 'User')}
										</AvatarFallback>
									</div>
								</Avatar>
								<span className="sr-only">Your profile</span>
								<div className="flex flex-col">
									<span
										aria-hidden="true"
										className="max-w-40 whitespace-nowrap truncate"
									>
										{session.user.name}
									</span>
									<span className="text-xs text-zinc-400" aria-hidden="true">
										{session.user.email}
									</span>
								</div>
							</div>
							<SignOutButton className="h-full" />
						</li>
					</ul>
				</nav>
			</div>
			<aside className="max-lg:flex-1 max-h-screen w-full container p-4">
				{children}
			</aside>
		</div>
	);
};

export default Layout;
