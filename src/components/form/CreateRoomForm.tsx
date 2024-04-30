'use client';
import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { X } from 'lucide-react';
import { createRoomValidator } from '@/lib/validations/room';
import { useRouter } from 'next/navigation';
import { DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';

interface CreateRoomFormProps {}
type FormData = z.infer<typeof createRoomValidator>;
const CreateRoomForm: FC<CreateRoomFormProps> = () => {
	const [showSuccess, setShowSuccess] = useState<boolean>(false);
	const router = useRouter();
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(createRoomValidator),
	});

	const CreateRoom = async ({ name, url }: { name: string; url?: string }) => {
		try {
			const validatedBody = createRoomValidator.parse({
				name,
				url,
			});

			await axios.post('/api/room', validatedBody);
			setShowSuccess(true);
			router.push('/chat');
		} catch (error) {
			if (error instanceof z.ZodError) {
				setError(error.name as keyof FormData, { message: error.message });
				return;
			}

			if (error instanceof AxiosError) {
				setError('root', {
					message: error.response?.data,
				});
				return;
			}

			setError('root', {
				message: 'Something went wrong',
			});
		}
	};

	const onSubmit = (data: FormData) => {
		CreateRoom(data);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DialogHeader>
				<DialogTitle>Create New Room</DialogTitle>
				<DialogDescription>
					create a new room and invite your friends to join
				</DialogDescription>
			</DialogHeader>

			<div className="mt-2 flex-col flex gap-2">
				<label htmlFor="name" className=" space-y-1">
					<span className="text-sm flex justify-between items-center">
						Room Name*
						<p className="text-red-600">{errors.name?.message}</p>
					</span>

					<Input
						{...register('name')}
						type="text"
						id="name"
						placeholder="Test Room"
						className="block w-full rounded-md border-0 py-1.5  text-gray-900 shadow-sm ring-1 ring-inset focus:ring-inset focus:shadow ring-gray-300 focus:ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
					/>
				</label>
				<label htmlFor="url" className="space-y-1">
					<span className="text-sm flex justify-between items-center">
						Room Url
						<p className="text-red-600">{errors.url?.message}</p>
					</span>
					<Input
						{...register('url')}
						type="text"
						id="url"
						placeholder="If not provided, a random url will be generated."
						className="block w-full rounded-md border-0 py-1.5  text-gray-900 shadow-sm ring-1 ring-inset focus:ring-inset focus:shadow ring-gray-300 focus:ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
					/>
				</label>
				<Button className="w-full mt-1">Create</Button>
			</div>
		</form>
	);
};

export default CreateRoomForm;
