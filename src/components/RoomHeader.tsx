'use client';
import {
	changeRoomUserEventListener,
	deleteUserEventListener,
	joinedEventListener,
	updateRoomEventListener,
} from '@/lib/utils';
import { useSocketStore } from '@/store/socket';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, {
	useEffect,
	useState,
	type FC,
	type PropsWithChildren,
} from 'react';
import { Dialog, DialogTrigger } from './ui/dialog';

interface RoomHeaderProps extends PropsWithChildren {
	initialRoomName: string;
	membersCountInitial?: number;
	roomImage: string;
	friendEmail?: string;
	roomId?: string;
	isPrivate?: boolean;
	Modal: React.ElementType;
	modalProps: any;
	sessionId: string;
}

const RoomHeader: FC<RoomHeaderProps> = ({
	sessionId,
	roomImage,
	Modal,
	modalProps,
	roomId,
	initialRoomName,
	membersCountInitial,
	friendEmail,
	children,
	isPrivate = false,
}) => {
	const router = useRouter();
	const [roomName, setRoomName] = useState(initialRoomName);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [membersCount, setMembersCount] = useState(membersCountInitial ?? 0);
	const connect = useSocketStore((state) => state.connect);
	const disconnect = useSocketStore((state) => state.disconnect);
	useEffect(() => {
		if (isPrivate || !roomId) return;
		const socket = connect();
		const onRemoveUserHandler = ({ memberId }: DeleteUserSocketPayload) => {
			/// refresh to remove user from  current chat
			if (sessionId === memberId) {
				router.refresh();
			}
			setMembersCount((pre) => pre - 1);
		};

		const onRoomInfoUpdated = ({ name }: { name: string }) => {
			setRoomName(name);
		};
		const onUserJoinHandler = () => {
			setMembersCount((pre) => pre + 1);
		};

		socket.on(deleteUserEventListener(sessionId), onRemoveUserHandler);
		socket.on(changeRoomUserEventListener(roomId), onRemoveUserHandler);
		socket.on(joinedEventListener(roomId), onUserJoinHandler);
		socket.on(updateRoomEventListener(roomId), onRoomInfoUpdated);

		return () => {
			socket.removeListener(
				deleteUserEventListener(sessionId),
				onRemoveUserHandler
			);
			socket.removeListener(
				changeRoomUserEventListener(sessionId),
				onRemoveUserHandler
			);
			socket.removeListener(joinedEventListener(roomId), onUserJoinHandler);
			socket.removeListener(updateRoomEventListener(roomId), onRoomInfoUpdated);
			disconnect();
		};
	});
	return (
		<Dialog>
			<div className="flex items-center gap-2">
				<button onClick={() => router.back()}>
					<ChevronLeft className="lg:hidden w-8 h-8" />
				</button>
				<DialogTrigger
					className="relative cursor-pointer flex items-center space-x-4"
				>
					<div className="relative">
						<div className="relative w-8 h-8 sm:w-12 sm:h-12 overflow-hidden">
							<Image
								fill
								referrerPolicy="no-referrer"
								src={roomImage}
								alt={`${roomName} profile picture`}
								className="rounded-full"
							/>
						</div>
					</div>

					<div className="flex flex-col leading-tight">
						<div className="text-xl flex items-center">
							<span className="text-gray-700 mr-3 font-semibold">
								{roomName}
							</span>
						</div>

						<span className="text-sm text-gray-600">
							{isPrivate
								? friendEmail
								: !!membersCount && membersCount > 1
								? `${membersCount} members`
								: `1 member`}
						</span>
					</div>
					{children}
				</DialogTrigger>
			</div>

			<Modal isOpen={isOpen} setIsOpen={setIsOpen} {...modalProps} />
		</Dialog>
	);
};

export default RoomHeader;
