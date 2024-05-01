'use client';
import { ChatRoom } from '@/db/schema';
import {
	cn,
	deleteUserEventListener,
	getCurrentChatId,
	newMessageEventListener,
	newRoomEventListener,
} from '@/lib/utils';
import { useSocketStore } from '@/store/socket';
import { ExtendedMessage } from '@/types/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import UnseenChatToast from './UnseenChatToast';
import axios from 'axios';

interface SidebarChatListProps {
	initialChats: ChatRoom[];
	sessionId: string;
	initialUnseen: Map<string, number>;
}

const SidebarChatList: FC<SidebarChatListProps> = ({
	initialChats,
	sessionId,
	initialUnseen,
}) => {
	const pathname = usePathname();
	const [currentChatId, setCurrentChatId] = useState<string>(
		getCurrentChatId(pathname)
	);
	const [chats, setChats] = useState<ChatRoom[]>(initialChats);
	const [unseenMessages, setUnseenMessages] =
		useState<Map<string, number>>(initialUnseen);
	const connect = useSocketStore((state) => state.connect);
	const disconnect = useSocketStore((state) => state.disconnect);
	useEffect(() => {
		if (pathname?.includes('chat')) {
			const cId = getCurrentChatId(pathname);
			setCurrentChatId(() => cId);
			// clear chat unseen messages
			setUnseenMessages((prev) => {
				const unseenCount = prev.get(cId) ?? 0;
				if (unseenCount > 0) {
					prev.set(cId, 0);
					return new Map(prev);
				}
				axios.delete('/api/message/unseen', {
					data: {
						id: cId,
					},
				});
				return prev;
			});
		}
	}, [pathname]);
	useEffect(() => {
		const socket = connect();
		const newMessageHandler = (data: ExtendedMessage) => {
			// notification logic
			const shouldNotify = data.message.chatRoomId !== currentChatId;
			if (!shouldNotify) return;
			toast.custom((t) => (
				<UnseenChatToast
					t={t}
					chatId={data.message.chatRoomId}
					message={data.message}
					senderImage={data.sender.image ?? ''}
					senderName={data.sender.name ?? ''}
				/>
			));
			// add unseen number
			setUnseenMessages((prev) => {
				const unseenCount = prev.get(data.message.chatRoomId) ?? 0;
				const newMap = new Map(prev);
				newMap.set(data.message.chatRoomId, unseenCount + 1);
				return newMap;
			});
			axios.post('/api/message/unseen', {
				chatRoomId: data.message.chatRoomId,
			});
		};
		const newRoomHandler = (data: ChatRoom) => {
			setChats((prev) => [...prev, data]);
		};
		const onRemoveUserHandler = ({
			memberId,
			roomId,
		}: DeleteUserSocketPayload) => {
			setChats((pre) => pre.filter((chat) => chat.id !== roomId));
		};

		socket.on(deleteUserEventListener(sessionId), onRemoveUserHandler);
		socket.on(newMessageEventListener(sessionId), newMessageHandler);
		socket.on(newRoomEventListener(sessionId), newRoomHandler);

		return () => {
			socket.removeListener(
				newMessageEventListener(sessionId),
				newMessageHandler
			);
			socket.removeListener(newRoomEventListener(sessionId), newRoomHandler);
			socket.removeListener(
				deleteUserEventListener(sessionId),
				onRemoveUserHandler
			);

			disconnect();
		};
	});
	return (
		<ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
			{chats.sort().map((chat) => {
				const unseenMessagesCount = unseenMessages.get(chat.id) ?? 0;
				return (
					<li key={chat.id}>
						<a
							href={`/chat/${chat.id}`}
							className={cn(
								'text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
								{
									'bg-gray-50 text-indigo-600': currentChatId === chat.id,
								}
							)}
						>
							{chat.name}
							{unseenMessagesCount > 0 ? (
								<div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center ">
									{unseenMessagesCount}
								</div>
							) : null}
						</a>
					</li>
				);
			})}
		</ul>
	);
};

export default SidebarChatList;
