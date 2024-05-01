'use client';

import type { FC } from 'react';
import { useContext, useRef, useState } from 'react';
import ReactTextareaAutosize from 'react-textarea-autosize';
import { Button } from './ui/button';
import { ArrowUp } from 'lucide-react';
import { ChatContext } from '@/context/ChatContext';

interface ChatInputProps {
	chatPartner?: User;
	chatId: string;
	roomName?: string;
	isRoom?: boolean;
	sessionId: string;
}

const ChatInput: FC<ChatInputProps> = ({
	chatPartner,
	chatId,
	isRoom = false,
	roomName,
	sessionId,
}) => {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const { handleChangeInput, input, sendMessage } = useContext(ChatContext);
	return (
		<div className="border-t border-gray-200 pt-4 mb-2 sm:mb-0">
			<div className="relative flex-1 px-3 py-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600 transition-shadow">
				<ReactTextareaAutosize
					ref={textareaRef}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							sendMessage({
								chatRoomId: chatId,
								type: 'TEXT',
								sessionId,
							});
						}
					}}
					rows={1}
					value={input}
					onChange={(e) => handleChangeInput(e.target.value)}
					placeholder={
						isRoom
							? `Message in @${roomName ?? ''}`
							: `Message #${chatPartner?.name ?? ''}`
					}
					className="outline-none block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 py-1.5 max-lg:pr-10 text-sm leading-6"
				/>
				<div
					onClick={() => textareaRef.current?.focus()}
					className="lg:py-2"
					aria-hidden
				>
					<div className="max-md:hidden py-px">
						<div className="h-2 lg:h-9" />
					</div>
				</div>
				<div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
					<div className="flex-shrink-0">
						<Button
							className="max-lg:w-6 max-lg:h-6 max-lg:rounded-full max-lg:p-0 max-lg:aspect-square"
							onClick={sendMessage.bind(null, {
								chatRoomId: chatId,
								sessionId: '',
								type: 'TEXT',
							})}
							type="submit"
						>
							<ArrowUp className="max-lg:h-4 max-lg:w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatInput;
