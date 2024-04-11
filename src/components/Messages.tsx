'use client';
import { chatEventListener, cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import type { FC } from "react";
import { format } from 'date-fns';
import Image from "next/image";
import { Message } from "@/db/schema";
import { useSocketStore } from "@/store/socket";
import md from 'markdown-it';

interface MessagesProps {
	initialMessages: Message[];
	sessionId: string;
	sessionImg: string | null | undefined;
	chatPartners: User[];
	chatId: string;
}

const formatTimestamp = (timestamp: Date) => {
	// date time format
	return format(timestamp, 'MM/dd/yy HH:mm a');
}
 
const Messages: FC<MessagesProps> = ({chatId,initialMessages, sessionId, chatPartners, sessionImg}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
	const scrollDownRef = useRef<HTMLDivElement | null>(null);
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
	}, [sessionId, chatId]);

	const [chatPartnersMap, setChatPartnersMap] = useState<Map<string, User>>(new Map());
	useEffect(() => {
		const map: Map<string, User> = new Map();
		for (const partner of chatPartners) {
			map.set(partner.id, partner);
		}
		setChatPartnersMap(map);
	}, []);
		
  return (
		<div
			id="messages"
			className="flex h-full flex-1 flex-col-reverse gap-2 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
		>
			<div ref={scrollDownRef}></div>
			{messages.map((message, index) => {
        const isCurrentUser = message.sender === sessionId;
        const hasNextMessageFromSameUser = messages[index - 1]?.sender === messages[index].sender
				const partner = chatPartnersMap.get(message.sender);
				const text = md().render(message.text);
        return (
					<div
						className="chat-message"
						key={`${message.id}-${message.updatedAt}`}
					>
						<div
							className={cn('flex items-end', {
								'justify-end': isCurrentUser,
							})}
						>
							<div
								className={cn(
									'flex flex-col space-y-2 text-base max-w-xs mx-2',
									{
										'order-1 items-end': isCurrentUser,
										'order-2 items-start': !isCurrentUser,
									}
								)}
							>
								<span
									className={cn('px-4 py-2 rounded-lg inline-block', {
										'bg-indigo-600': isCurrentUser,
										'bg-gray-200': !isCurrentUser,
										'rounded-br-none':
											!hasNextMessageFromSameUser && isCurrentUser,
										'rounded-bl-none':
											!hasNextMessageFromSameUser && !isCurrentUser,
									})}
								>
									<span className="block leading-tight text-gray-400 text-[0.6rem]">
										{formatTimestamp(message.updatedAt)}
									</span>
									<p
										className={cn(
											'p-0 m-0 prose text-white prose-a:text-white prose-headings:text-white',
											{
												'text-white': isCurrentUser,
												'text-gray-900': !isCurrentUser,
											}
										)}
										dangerouslySetInnerHTML={{ __html: text }}
									></p>
								</span>
							</div>
							<div
								className={cn('relative w-6 h-6', {
									'order-2': isCurrentUser,
									'order-1': !isCurrentUser,
									invisible: hasNextMessageFromSameUser,
								})}
							>
								<Image
									fill
									src={isCurrentUser ? sessionImg || '' : partner?.image || ''}
									alt="profile picture"
									referrerPolicy="no-referrer"
									className="rounded-full"
								/>
							</div>
						</div>
					</div>
				);
      })}
		</div>
	);
}
 
export default Messages;