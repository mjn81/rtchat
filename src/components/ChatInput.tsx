'use client';

import type { FC } from "react";
import  { useRef, useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { messageValidator } from "@/lib/validations/message";
import { messageType } from "@/db/schema";
import { detectLinkToMd } from "@/lib/utils";
import { ArrowUp, Loader2 } from "lucide-react";


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
		<div className="border-t border-gray-200 pt-4 mb-2 sm:mb-0">
			<div className="relative flex-1 px-2 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600 transition-shadow">
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
				<div className="absolute right-0 bottom-0 flex justify-between max-md:-top-0.5 max-lg:top-0.5 py-2 pl-3 pr-2">
					<div className="flex-shrink-0">
						<Button className="max-lg:w-6 max-lg:h-6 max-lg:rounded-full max-lg:p-0 max-lg:aspect-square" disabled={isLoading} onClick={sendMessage} type="submit">
							{
								isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null
							}
							<ArrowUp className="max-lg:h-4 max-lg:w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
 
export default ChatInput;