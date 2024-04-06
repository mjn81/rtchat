import CreateRoomForm from '@/components/form/CreateRoomForm';
import type { FC } from 'react';

interface CreateRoomProps {
  
}

const CreateRoom: FC<CreateRoomProps> = () => {
   return (
			<div className="flex justify-center items-center absolute w-screen h-screen z-50 bg-black bg-opacity-60 inset-0">
				<CreateRoomForm />
			</div>
		);
}

export default CreateRoom;