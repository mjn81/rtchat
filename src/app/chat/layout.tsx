'use server';
import type { FC, PropsWithChildren } from 'react';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import SidebarChatList from '@/components/SidebarChatList';
import SignOutButton from '@/components/signOutButton';
import {
	getInitials,
} from '@/lib/utils';
import SidebarOptions from '@/components/SidebarOption';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getChatsWithUnseenCount } from '@/helpers/query/chatRoom';
import {LogoAbsolute} from '@/components/Logo';

interface LayoutProps extends PropsWithChildren {}

const Layout: FC<LayoutProps> = async ({ children }) => {
	const session = await getServerSession(authOptions);
	if (!session) notFound();
	const {chatIdUnseen,processesChats,unseenRequestCount} = await getChatsWithUnseenCount(session.user.id);
	return (
		<div className="w-full flex flex-col-reverse lg:flex-row h-screen">
			<div className="hidden lg:flex w-full h-full max-w-xs grow flex-col gap-y-5 overflow-y-auto overflow-x-hidden border-r border-gray-200 bg-white px-6">
				<LogoAbsolute />
				<nav className="flex flex-1 flex-col">
					<ul role="list" className="flex flex-1 flex-col gap-y-7">
						<li>
							<SidebarChatList
								initialUnseen={chatIdUnseen}
								sessionId={session.user.id}
								initialChats={processesChats}
								isSubscribing
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
