'use client'
import axios, { AxiosError } from 'axios';
import { useState, type FC } from 'react';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface JoinRoomButtonProps {
  roomName: string;
  url: string;
}

const JoinRoomButton: FC<JoinRoomButtonProps> = ({roomName, url}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const onClick = async () => {
    setIsLoading(true)
    try {
      await axios.get(`/api/room/accept/${url}`);
      router.replace('/chat');
    } catch (e) {
      if (e instanceof AxiosError) {
        toast.error(e.response?.data)
        return
      }
      toast.error('something went wrong, try again later')
    } finally {
      setIsLoading(false)
    }
  }
  return (
		<Button
			disabled={isLoading}
			onClick={onClick}
			className="text-2xl h-14 px-8"
		>
			{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
			Join {roomName} Now!
		</Button>
	);
}

export default JoinRoomButton;