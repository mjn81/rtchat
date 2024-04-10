'use client'
import { useState, type FC } from 'react';
import { type BaseModalProps, Modal } from './ui/Modal';
import Image from 'next/image';
import { Copy, Eye, EyeOff, RefreshCw,  X } from 'lucide-react';
import { ChatRoom } from '@/db/schema';
import { format } from 'date-fns';
import { cn, createJoinRoomURL, createProtectedText } from '@/lib/utils';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { removeUserValidator, updateRoomValidator } from '@/lib/validations/room';
import { z } from 'zod';
import { Button } from './ui/Button';

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
	const [isHidden, setIsHidden] = useState<boolean>(true);
	const roomUrl = createJoinRoomURL(roomDetail.url);
	const onUpdateRoomInfo = async () => {
		setIsLoading(true);
		try {
			if (!isChanged) {
				return;
			}
			const validatedBody = updateRoomValidator.parse({ name, id: roomDetail.id });
			await axios.put('/api/room', validatedBody);
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

	const onRemoveUser = async (userId: string) => {
		if (!userId) return;
		setIsLoading(true);
		try {
			const validatedBody = removeUserValidator.parse({ id: roomDetail.id, memberId: userId });
			await axios.delete('/api/room/admin/member', {
				data: validatedBody,
			});
			toast.success('User removed successfully');
			setIsOpen(false);
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error(error.errors[0].message);
				return;
			}
			if (error instanceof AxiosError) {
				toast.error(error.response?.data);
				return;
			}
			toast.error('Something went wrong');
		} finally {
			setIsLoading(false);
		}
	}

	const onLeaveRoom = async () => {
		setIsLoading(true);
		try {
			await axios.delete('/api/room/leave', {
				data: { id: roomDetail.id },
			});
			toast.success('Room left successfully');
			setIsOpen(false);
		} catch (error) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data);
				return;
			}
			toast.error('Something went wrong');
		} finally {
			setIsLoading(false);
		}
	}

	const onDeleteRoom = async () => {	
		setIsLoading(true);
		try {
			await axios.delete('/api/room/', {
				data: { id: roomDetail.id },
			});
			toast.success('Room deleted successfully');
			setIsOpen(false);
		} catch (error) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data);
				return;
			}
			toast.error('Something went wrong');
		} finally {
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
				<div className="relative border-b pb-2 border-gray-300 flex items-center gap-3">
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
									<td className="pb-2 font-semibold text-sm text-gray-800">
										URL
									</td>
									<td
										className={cn(
											'flex justify-between cursor-pointer pb-2 font-semibold text-gray-600 text-xs',
											{
												'tracking-widest': isHidden,
											}
										)}
									>
										<span className="overflow-hidden">
											{isHidden
												? createProtectedText(roomDetail.url)
												: roomDetail.url}
										</span>
										<span className="space-x-3">
											<button
												onClick={() => setIsHidden((pre) => !pre)}
												className="hover:text-orange-500"
											>
												{isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
											</button>
											<button
												className=" hover:text-indigo-600"
												onClick={() => {
													navigator.clipboard.writeText(roomUrl);
													toast.success('Link copied to clipboard');
												}}
												type="button"
											>
												<Copy size={18} />
											</button>
										</span>
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
								<td className="pt-3 font-semibold text-sm text-gray-800">
									Creation Date
								</td>
								<td className="pt-3 font-semibold text-sm text-gray-600">
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
									<button
										onClick={onRemoveUser.bind(null, member.id ?? '')}
										className="text-sm text-rose-700 hover:underline"
									>
										remove
									</button>
								) : null}
							</li>
						))}
					</ul>
				</div>

				<div className="flex items-center justify-center gap-2">
					<Button
						onClick={onLeaveRoom}
						className={cn('mt-4 w-full ', {
							'bg-rose-600 hover:bg-rose-800': !isAdmin,
						})}
					>
						Leave Room
					</Button>
					{isAdmin && (
						<Button
							onClick={onDeleteRoom}
							className="mt-4 w-full bg-rose-600 hover:bg-rose-800"
						>
							Delete Room
						</Button>
					)}
				</div>
			</div>
		</Modal>
	);
}
export interface FriendRoomInfoModalProps {
	sessionId: string;
	friend: User;
}

export const FriendRoomInfoModal: FC<BaseModalProps<FriendRoomInfoModalProps>> = ({
	sessionId,
	friend,
	setIsOpen,
	isOpen,
}) => {
	//const [isLoading, setIsLoading] = useState<boolean>(false);
	//const [isChanged, setIsChanged] = useState<boolean>(false);
	//const [error, setError] = useState<string>('');
	//const [isHidden, setIsHidden] = useState<boolean>(true);
	//const roomUrl = createJoinRoomURL(roomDetail.url);
	//const onUpdateRoomInfo = async () => {
	//setIsLoading(true);
	/**
		 
		 try {
			if (!isChanged) {
				return;
			}
			const validatedBody = updateRoomValidator.parse({
				name,
				id: roomDetail.id,
			});
			await axios.put('/api/room', validatedBody);
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
		} finally {
			setIsLoading(false);
		}
	};
		 */

	/** const onRemoveUser = async (userId: string) => {
		if (!userId) return;
		setIsLoading(true);
		try {
			const validatedBody = removeUserValidator.parse({
				id: roomDetail.id,
				memberId: userId,
			});
			await axios.delete('/api/room/admin/member', {
				data: validatedBody,
			});
			toast.success('User removed successfully');
			setIsOpen(false);
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error(error.errors[0].message);
				return;
			}
			if (error instanceof AxiosError) {
				toast.error(error.response?.data);
				return;
			}
			toast.error('Something went wrong');
		} finally {
			setIsLoading(false);
		}
	};

	const onLeaveRoom = async () => {
		setIsLoading(true);
		try {
			await axios.delete('/api/room/leave', {
				data: { id: roomDetail.id },
			});
			toast.success('Room left successfully');
			setIsOpen(false);
		} catch (error) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data);
				return;
			}
			toast.error('Something went wrong');
		} finally {
			setIsLoading(false);
		}
	};

	const onDeleteRoom = async () => {
		setIsLoading(true);
		try {
			await axios.delete('/api/room/', {
				data: { id: roomDetail.id },
			});
			toast.success('Room deleted successfully');
			setIsOpen(false);
		} catch (error) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data);
				return;
			}
			toast.error('Something went wrong');
		} finally {
			setIsLoading(false);
		}
	};
	const isAdmin = roomDetail.creatorId === sessionId;*/
	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen}>
			<div className="shadow-md animate-go-down max-w-lg w-full m-3 relative bg-white p-4 rounded-md space-y-3">
				<button
					onClick={() => setIsOpen(false)}
					className="absolute top-1.5 right-1.5 w-9 h-9 aspect-square rounded-full flex justify-center items-center"
				>
					<X className="text-gray-900" />
				</button>
				<div className="relative border-b pb-2 border-gray-300 flex items-center gap-3">
					<div className="relative overflow-hidden w-8 h-8 sm:w-12 sm:h-12">
						<Image
							fill
							referrerPolicy="no-referrer"
							src={friend.image ?? ''}
							alt={`${friend.name} room profile picture`}
							className="rounded-full"
						/>
					</div>
					<div className="flex-grow text-gray-700 text-xl mr-3 p-0 font-semibold">
						{friend.name}
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full">
						<tbody>
							{/* Room Info */}
							<tr>
								<td colSpan={2}>
									<h4 className="text-md text-gray-900 font-semibold">
										Friend Info
									</h4>
								</td>
							</tr>
							{/* Members */}
							<tr>
								<td className="py-2 font-semibold text-sm text-gray-800">
									E-Mail
								</td>
								<td className="py-2 font-semibold text-sm text-gray-600">
									{friend.email}
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				{/** <div className="flex items-center justify-center gap-2">
					<Button
						onClick={onLeaveRoom}
						className={cn('mt-4 w-full ', {
							'bg-rose-600 hover:bg-rose-800': !isAdmin,
						})}
					>
						Leave Room
					</Button>
					{isAdmin && (
						<Button
							onClick={onDeleteRoom}
							className="mt-4 w-full bg-rose-600 hover:bg-rose-800"
						>
							Delete Room
						</Button>
					)}
				</div> */}
			</div>
		</Modal>
	);
};
