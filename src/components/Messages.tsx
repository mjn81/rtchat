'use client';
import { chatEventListener } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { type Message } from '@/db/schema';
import { useSocketStore } from '@/store/socket';
import { useIntersection } from '@mantine/hooks';
import axios from 'axios';
import { ChatRoomMessages } from '@/helpers/query/message';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
const MessageComponent = dynamic(() => import('@/components/Message'), {
	ssr: false,
});

interface MessagesProps {
	initialMessages: Message[];
	sessionId: string;
	sessionImg: string | null | undefined;
	chatPartnersMap: Map<string, User>;
	chatId: string;
	hasMore: boolean;
	nextCursor: string | null;
}

type NextPageInput = {
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
	setCursor: React.Dispatch<React.SetStateAction<string | null>>;
	setIsPageLoading: React.Dispatch<React.SetStateAction<boolean>>;
	roomId: string;
	cursor: string | null;
};

const fetchNextPage = async ({
	roomId,
	setCursor,
	setMessages,
	cursor,
	setIsPageLoading,
}: NextPageInput) => {
	if (!cursor) return;
	setIsPageLoading(true);
	const nextPageData = await axios.get<ChatRoomMessages>(
		`/api/message/${roomId}`,
		{
			params: {
				cursor,
			},
		}
	);
	const { messages, nextCursor } = nextPageData.data;
	setCursor(nextCursor);
	setIsPageLoading(false);
	setMessages((pre) => [...pre, ...messages]);
};

const Messages: FC<MessagesProps> = ({
	chatId,
	initialMessages,
	sessionId,
	chatPartnersMap,
	sessionImg,
	nextCursor,
	hasMore,
}) => {
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [loading, setLoading] = useState(false);
	const [cursorState, setCursorState] = useState(nextCursor);
	const scrollDownRef = useRef<HTMLDivElement | null>(null);
	const lastMessageRef = useRef<HTMLDivElement>(null);
	const { ref, entry } = useIntersection({
		root: lastMessageRef.current,
		threshold: 1,
	});
	const connect = useSocketStore((state) => state.connect);
	const disconnect = useSocketStore((state) => state.disconnect);
	useEffect(() => {
		const socket = connect();
		socket.on(chatEventListener(chatId), (message: Message) => {
			setMessages((prevMessages) => [message, ...prevMessages]);
		});

		return () => {
			socket.removeListener(chatEventListener(chatId));
			disconnect();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId, chatId]);

	useEffect(() => {
		if (entry?.isIntersecting) {
			fetchNextPage({
				roomId: chatId,
				cursor: cursorState,
				setCursor: setCursorState,
				setMessages,
				setIsPageLoading: setLoading,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [entry, fetchNextPage]);

	return (
		<div className="relative flex h-full flex-1 flex-col-reverse gap-2 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
			<div ref={scrollDownRef}></div>
			{loading && (
				<div className="cursor-pointer text-sm fixed z-50 top-20 mt-1 left-1/2  lg:ml-24 max-lg:-translate-x-1/2  flex max-w-fit items-center justify-center gap-1 rounded-full border border-gray-200 bg-white px-4 py-1  shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
					<Loader2 className="w-4 h-4 animate-spin" />
					<span>Loading...</span>
				</div>
			)}
			{messages.map((message, index) => {
				const hasNextMessageFromSameUser =
					messages[index - 1]?.sender === messages[index].sender;
				const isLastMessage = index === messages.length - 1;
				return (
					<MessageComponent
						hasNextMessageFromSameUser={hasNextMessageFromSameUser}
						ref={isLastMessage ? ref : null}
						sessionImg={sessionImg}
						key={message.id}
						chatPartnersMap={chatPartnersMap}
						message={message}
						sessionId={sessionId}
					/>
				);
			})}
		</div>
	);
};

export default Messages;
