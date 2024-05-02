'use client';
import { type MessageType, type Message, messageType } from '@/db/schema';
import { encryptMessage } from '@/lib/security';
import { detectLinkToMd } from '@/lib/utils';
import { messageValidator } from '@/lib/validations/message';
import { ChatContextMessage } from '@/types/types';
import axios, { AxiosError } from 'axios';
import { nanoid } from 'nanoid';
import React, {
	type FC,
	type PropsWithChildren,
	createContext,
	useState,
} from 'react';



type SendMessageInput = {
	chatRoomId: string;
	type: MessageType;
	sessionId: string;
};

type SendingMessageContext = {
	messages: ChatContextMessage[] | null;
	setMessages: React.Dispatch<React.SetStateAction<ChatContextMessage[]>>;
	input: string;
	sendMessage: (input: SendMessageInput) => void;
	handleChangeInput: React.Dispatch<React.SetStateAction<string>>;
};

export const ChatContext = createContext<SendingMessageContext>({
	messages: null,
	setMessages: () => {},
	input: '',
	sendMessage: () => {},
	handleChangeInput: () => {},
});

interface Props extends PropsWithChildren {}

export const ChatContextProvider: FC<Props> = ({ children }) => {
	const [messages, setMessages] = useState<ChatContextMessage[]>([]);
	const [input, setInput] = useState<string>('');
	const sendMessage = async ({
		chatRoomId,
		type,
		sessionId,
	}: SendMessageInput) => {
		const tempId = nanoid();
		const sendingMessage = {
			isLoading: true,
			id: tempId,
			chatRoomId,
			createdAt: new Date(),
			type,
			error: '',
			isError: false,
			sender: sessionId,
			text: input,
			updatedAt: new Date(),
		} satisfies ChatContextMessage;
		setInput(''); 

		setMessages((pre) => [sendingMessage, ...(pre ?? [])]);
		try {
			
			const validatedMessage = messageValidator.parse({
				text: detectLinkToMd(input),
				type,
				chatRoomId,
			});

			const encryptedMessage = encryptMessage(validatedMessage.text);
			const response = await axios.post<Message>(
				'/api/message',
				validatedMessage
			);
			setMessages(
				(pre) =>
					pre?.map((msg) => {
						if (msg.id === tempId) {
							return response.data as ChatContextMessage;
						}
						return msg;
					}) ?? []
			);
		} catch (error) {
			if (error instanceof AxiosError) {
				setMessages(
					(pre) =>
						pre?.map((msg) => {
							if (msg.id === tempId) {
								return {
									...msg,
									isError: true,
									error: error.response?.data,
								};
							}
							return msg;
						}) ?? []
				);
				return;
			}

			if (error instanceof Error) {
				setMessages(
					(pre) =>
						pre?.map((msg) => {
							if (msg.id === tempId) {
								return {
									...msg,
									isError: true,
									error: error.message,
								};
							}
							return msg;
						}) ?? []
				);
				return;
			}

			setMessages(
				(pre) =>
					pre?.map((msg) => {
						if (msg.id === tempId) {
							return {
								...msg,
								isError: true,
								error: 'oops!something went wrong.',
							};
						}
						return msg;
					}) ?? []
			);
			return;
		}
	};
	return (
		<ChatContext.Provider
			value={{
				messages,
				input,
				handleChangeInput: setInput,
				sendMessage,
				setMessages,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};
