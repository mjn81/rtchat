'use client';
import { type Message } from '@/db/schema';
import { cn, getInitials } from '@/lib/utils';
import React from 'react';
import md from 'markdown-it';
import Image from 'next/image';
import { format } from 'date-fns';
import { ChatContextMessage } from '@/types/types';
import { Check, CheckCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const formatTimestamp = (timestamp: Date) => {
	// date time format
	return format(timestamp, 'h:mm a');
};

interface MessageProps {
	message: ChatContextMessage;
	chatPartnersMap: Map<string, User>;
	user: User;
	hasNextMessageFromSameUser: boolean;
}
const Message = React.forwardRef<HTMLDivElement, MessageProps>(
	({ message, chatPartnersMap, user, hasNextMessageFromSameUser }, ref) => {
		const isCurrentUser = message.sender === user.id;
		const partner = !isCurrentUser
			? chatPartnersMap.get(message.sender)
			: undefined;
		/// decrypt message and render markdown
		const text = md().render(message.text);
		return (
			<div ref={ref} key={`${message.id}-${message.updatedAt}`}>
				<div
					className={cn('flex items-end', {
						'justify-end': isCurrentUser,
					})}
				>
					<div
						className={cn('flex flex-col space-y-0.5 text-base max-w-xs mx-2', {
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
						<div className="flex items-center gap-1.5 text-muted-foreground">
							<span className="block leading-tight text-[0.6rem]">
								{formatTimestamp(message.updatedAt)}
							</span>
							{message?.isLoading ? (
								<Check className="w-3.5 h-3.5" />
							) : (
								<CheckCheck className="w-3.5 h-3.5" />
							)}
						</div>
					</div>
					<Avatar asChild>
						<div
							className={cn('relative w-8 h-8 mb-4', {
								'order-2': isCurrentUser,
								'order-1': !isCurrentUser,
								invisible: hasNextMessageFromSameUser,
							})}
						>
							<AvatarImage
								src={isCurrentUser ? user.image || '' : partner?.image || ''}
								referrerPolicy="no-referrer"
								alt="profile picture"
								width={32}
								height={32}
							/>
							<AvatarFallback>
								{getInitials(
									isCurrentUser ? user.name || '' : partner?.name || ''
								)}
							</AvatarFallback>
						</div>
					</Avatar>
				</div>
			</div>
		);
	}
);

Message.displayName = 'Message';

export default Message;
