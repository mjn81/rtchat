import FriendRequestSidebarOption from '@/components/FriendRequestSidebarOption';
import SidebarChatList from '@/components/SidebarChatList';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { SIDEBAR_OPTIONS } from '@/constants/sidebar';
import { getChatsWithUnseenCount } from '@/helpers/query/chatRoom';
import { authOptions } from '@/lib/auth';
import { Cog, MessageCircleMore } from 'lucide-react';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

interface ChatProps {}

const Chat: FC<ChatProps> = async () => {
	const session = await getServerSession(authOptions);
	if (!session) notFound();
	const { chatIdUnseen, processesChats, unseenRequestCount } =
		await getChatsWithUnseenCount(session.user.id);

	return (
		<section className="h-full">
			{/* mobile sidebar chats */}
			<aside className="gap-2.5 flex flex-col h-full lg:hidden">
				<section className="px-2 flex-1 flex flex-col overflow-y-auto">
					<SidebarChatList
						initialUnseen={chatIdUnseen}
						sessionId={session.user.id}
						initialChats={processesChats}
					/>
				</section>
				<nav className="w-full border-t border-border">
					<ul
						role="list"
						className="flex justify-evenly items-center mt-3 sm:mt-4 gap-3 text-muted-foreground"
					>
						<li className='grid place-items-center'>
							<MessageCircleMore className="text-primary w-6 h-6 sm:w-7 sm:h-7" />
						</li>
						{SIDEBAR_OPTIONS.map((option) => {
							return (
								<li key={option.id}>
									<Dialog>
										<DialogTrigger className='grid place-items-center'>
											{<option.icon className="w-6 h-6 sm:w-7 sm:h-7" />}
										</DialogTrigger>
										<DialogContent>
											<option.form />
										</DialogContent>
									</Dialog>
								</li>
							);
						})}
						<li>
							<FriendRequestSidebarOption
								sessionId={session.user.id}
								initialUnseenRequestCount={unseenRequestCount?.at(0)?.count ?? 0}
							/>
						</li>
						<li>
							<Link href="/settings">
								<Cog className="w-6 h-6 sm:w-7 sm:h-7" />
							</Link>
						</li>
					</ul>
				</nav>
			</aside>
		</section>
	);
};

export default Chat;
