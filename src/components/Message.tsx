'use client';
import { type Message } from '@/db/schema';
import { cn } from '@/lib/utils';
import React, { FC, forwardRef } from 'react';
import md from 'markdown-it';
import Image from 'next/image';
import { format } from 'date-fns';

const formatTimestamp = (timestamp: Date) => {
	// date time format
	return format(timestamp, 'MM/dd/yy HH:mm a');
};

interface MessageProps {
	message: Message;
	chatPartnersMap: Map<string, User>;
	sessionId: string;
	sessionImg: string | null | undefined;
	hasNextMessageFromSameUser: boolean;
}
const Message = forwardRef<HTMLDivElement,MessageProps>(
	(
		{
			message,
			chatPartnersMap,
			sessionId,
			hasNextMessageFromSameUser,
			sessionImg,
		},
		ref
	) => {
		const isCurrentUser = message.sender === sessionId;
    const partner = chatPartnersMap.get(message.sender);
    /// decrypt message and render markdown
		const text = md().render(message.text);
		return (
			<div
				ref={ref}
				className="chat-message"
				key={`${message.id}-${message.updatedAt}`}
			>
				<div
					className={cn('flex items-end', {
						'justify-end': isCurrentUser,
					})}
				>
					<div
						className={cn('flex flex-col space-y-2 text-base max-w-xs mx-2', {
							'order-1 items-end': isCurrentUser,
							'order-2 items-start': !isCurrentUser,
						})}
					>
						<span
							className={cn('px-4 py-2 rounded-lg inline-block', {
								'bg-indigo-600': isCurrentUser,
								'bg-gray-200': !isCurrentUser,
								'rounded-br-none': !hasNextMessageFromSameUser && isCurrentUser,
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
	}
);

Message.displayName = 'Message';

export default Message;
