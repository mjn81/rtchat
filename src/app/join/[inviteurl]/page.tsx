import JoinRoomButton from '@/components/JoinRoomButton';
import { authOptions } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

interface JoinRoomProps {
  params: {
    inviteurl: string;
  } 
}

const JoinRoom: FC<JoinRoomProps> =async ({params: {inviteurl}}) => {
	const session = await getServerSession(authOptions);
	if (!session) notFound();

	const roomDetail = await db?.query.chatRooms.findFirst({
		columns: {
			name: true,
		},
		where: (room) => eq(room.url, inviteurl),
	});
	if (!roomDetail)
		return (
			<div className="flex justify-center flex-col gap-2 items-center text-center w-screen h-screen">
				<p className="text-2xl font-bold text-gray-900">Sorry!</p>
				<p className="text-md font-semibold text-gray-700">
					This room does not exist or is no longer available
        </p>
        <small className='text-sm font-medium text-gray-500'>
          Log: tried to join {inviteurl}
        </small>
			</div>
		);
	return (
		<div className="flex justify-center flex-col gap-2 items-center text-center w-screen h-screen">
      <p className="text-2xl font-bold text-gray-900">Do you want to join {roomDetail.name}?</p>
			<p className="text-md font-semibold text-gray-600">
				if yes please click the button down below
      </p>
      <JoinRoomButton roomName={roomDetail.name} url={inviteurl} />
		</div>
	);
}

export default JoinRoom;