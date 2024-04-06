import axios from "axios";
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const push = async (message: string, id: string) => {
  return axios.post('http://localhost:4000/api/push', {
		message,
		id: '11232',
	});
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
