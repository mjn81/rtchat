'use client'
import { useState, type FC } from 'react';
import { type BaseModalProps, Modal } from './ui/Modal';
import Image from 'next/image';
import { Copy, RefreshCw,  X } from 'lucide-react';
import { ChatRoom } from '@/db/schema';
import { format } from 'date-fns';
import { cn, createJoinRoomURL } from '@/lib/utils';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { updateRoomValidator } from '@/lib/validations/room';
import { z } from 'zod';

export interface RoomInfoModalProps {
	roomDetail: ChatRoom;
	sessionId: string;
  members: Partial<User>[];
}
const formatTimestamp = (timestamp: Date) => {
	// date time format
	return format(timestamp, 'MM/dd/yyyy HH:mm a');
};
export const RoomInfoModal: FC<BaseModalProps<RoomInfoModalProps>> = ({sessionId , roomDetail, members, setIsOpen, isOpen}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isChanged, setIsChanged] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [name, setName] = useState<string>(roomDetail.name);

	const onUpdateRoomInfo = async () => {
		setIsLoading(true);
		try {
			if (!isChanged) {
				return;
			}
			const validatedBody = updateRoomValidator.parse({ name, id: roomDetail.id });
			axios.put('/api/room', validatedBody);
			toast.success('Room info updated successfully');
			setIsOpen(false);
			setError('');
			setIsChanged(false);
		} catch (error) {

			if (error instanceof z.ZodError) {
				setError(error.errors[0].message);
				return;
			}

			if (error instanceof AxiosError) {
				toast.error(error.response?.data);
				return;
			}

			toast.error('Something went wrong');
		}
		finally {
			setIsLoading(false);
		}
	} 
	const isAdmin = roomDetail.creatorId === sessionId;
	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen}>
			<div className="shadow-md animate-go-down max-w-lg w-full m-3 relative bg-white p-4 rounded-md space-y-3">
				<button
					onClick={() => setIsOpen(false)}
					className="absolute top-1.5 right-1.5 w-9 h-9 aspect-square rounded-full flex justify-center items-center"
				>
					<X className="text-gray-900" />
				</button>
				<div className="relative border-b py-2 border-gray-300 flex items-center gap-3">
					<div className="relative overflow-hidden w-8 h-8 sm:w-12 sm:h-12">
						<Image
							fill
							referrerPolicy="no-referrer"
							src={''}
							alt={`${roomDetail.name} room profile picture`}
							className="rounded-full"
						/>
					</div>
					<div className="flex-grow">
						<input
							type="text"
							value={name}
							onChange={(e) => {
								if (e.target.value !== roomDetail.name) {
									setIsChanged(true);
								} else {
									setIsChanged(false);
								}
								setName(e.target.value);
							}}
							className="text-gray-700 hover:text-gray-800 focus:text-gray-800 text-xl mr-3 p-0 font-semibold border-none outline-none focus:border-none focus:outline-none focus:ring-0"
							placeholder="Room Name (required)"
							defaultValue={roomDetail.name}
						/>
						{error && <p className="text-red-500 text-sm">{error}</p>}
					</div>

					<button
						disabled={!isChanged}
						type="submit"
						onClick={onUpdateRoomInfo}
					>
						<RefreshCw
							className={cn({
								'text-gray-400': !isChanged,
								'animate-spin': isLoading,
							})}
						/>
					</button>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full">
						<tbody>
							{/* Room Info */}
							<tr>
								<td colSpan={2}>
									<h4 className="text-md text-gray-900 font-semibold">
										Room Info
									</h4>
								</td>
							</tr>
							{/* Members */}
							<tr>
								<td className="py-2 font-semibold text-sm text-gray-800">
									Members
								</td>
								<td className="py-2 font-semibold text-sm text-gray-600">
									{members.length}
								</td>
							</tr>
							{/* URL */}
							{isAdmin && (
								<tr>
									<td className="py-2 font-semibold text-sm text-gray-800">
										URL
									</td>
									<td
										className="py-2 font-semibold flex items-center justify-between gap-3 text-sm text-gray-600 hover:text-indigo-600"
										onClick={() => {
											navigator.clipboard.writeText(
												createJoinRoomURL(roomDetail.url)
											);
											toast.success('Link copied to clipboard');
										}}
									>
										{createJoinRoomURL(roomDetail.url)}
										<button type="button">
											<Copy />
										</button>
									</td>
								</tr>
							)}
							{/* Note */}
							{isAdmin && (
								<tr>
									<td
										colSpan={2}
										className="p-2 font-medium text-sm rounded-lg xl:text-xs bg-orange-200 text-orange-800"
									>
										Note: Don&apos;t share this link with anyone unless you want
										them joining the room.
									</td>
								</tr>
							)}
							{/* Creation Date */}
							<tr>
								<td className="py-2 font-semibold text-sm text-gray-800">
									Creation Date
								</td>
								<td className="py-2 font-semibold text-sm text-gray-600">
									{formatTimestamp(roomDetail.createdAt)}
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div>
					<h4 className="text-md text-gray-900 font-semibold">Members</h4>
					<ul className="scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch mt-2 space-y-3 max-h-32 overflow-y-auto">
						{members.map((member) => (
							<li key={member.id} className="flex items-center space-x-2">
								<div className="relative overflow-hidden w-8 h-8 sm:w-8 sm:h-8">
									<Image
										fill
										referrerPolicy="no-referrer"
										src={member.image ?? ''}
										alt={`${member.name ?? 'Unknown'} room profile picture`}
										className="rounded-full"
									/>
								</div>
								<span className="flex-grow">{member.name}</span>
								{member.id === roomDetail.creatorId ? (
									<span className="text-sm text-gray-400">Admin</span>
								) : null}

								{isAdmin && member.id !== roomDetail.creatorId ? (
									<button className="text-sm text-rose-700 hover:underline">
										remove{' '}
									</button>
								) : null}
							</li>
						))}
					</ul>
				</div>
			</div>
		</Modal>
	);
}


