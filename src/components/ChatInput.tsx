'use client';

import type { FC } from "react";
import  { useRef, useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/Button";
import axios from "axios";
import toast from "react-hot-toast";
import { messageValidator } from "@/lib/validations/message";
import { messageType } from "@/db/schema";
import { detectLinkToMd } from "@/lib/utils";


interface ChatInputProps {
  chatPartner?: User;
  chatId: string;
  roomName?: string;
  isRoom?: boolean;
}
 
const ChatInput: FC<ChatInputProps> = ({chatPartner , chatId, isRoom=false, roomName}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const sendMessage = async () => {
    setIsLoading(true);
    try {
      const validatedMessage = messageValidator.parse({
				text: detectLinkToMd(input),
				type: messageType.enumValues[0],
				chatRoomId: chatId,
			});
      await axios.post('/api/message', validatedMessage);
      setInput('');

    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
    finally {
      setIsLoading(false);
    }
  }

  return (
		<div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
			<div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
				<ReactTextareaAutosize
					ref={textareaRef}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							sendMessage();
						}
					}}
					rows={1}
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder={
						isRoom
							? `Message in @${roomName ?? ''}`
							: `Message #${chatPartner?.name ?? ''}`
					}
					className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
				/>
				<div
					onClick={() => textareaRef.current?.focus()}
					className="py-2"
					aria-hidden
				>
					<div className="py-px">
						<div className="h-9" />
					</div>
				</div>
				<div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
					<div className="flex-shrink-0">
						<Button isLoading={isLoading} onClick={sendMessage} type="submit">
							Post
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
 
export default ChatInput;