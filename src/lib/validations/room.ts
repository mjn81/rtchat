import { z } from 'zod';

export const createRoomValidator = z.object({
  name: z.string().min(5),
  url: z.string().optional(),
});

export const updateRoomValidator = z.object({
  id: z.string(),
  name: z.string().min(5),
});

export const removeUserValidator = z.object({
  id: z.string().min(2),
  memberId: z.string().min(2),
});