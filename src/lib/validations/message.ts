import { messageType } from "@/db/schema";
import { z } from "zod";

export const messageValidator = z.object({
	chatRoomId: z.string(),
	text: z.string(),
	type: z.enum(messageType.enumValues),
});

export const messageArrayValidator = z.array(messageValidator);

export type MessageBody = z.infer<typeof messageValidator>

export const getMessageValidator = z.object({
	roomId: z.string(),
	cursor: z.string().optional(),
	limit: z.number().optional(),
});