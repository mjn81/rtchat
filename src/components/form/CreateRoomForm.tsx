'use client';
import { FC, useState } from 'react';
import { Button } from '@/components/ui/Button';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { X } from 'lucide-react';
import { createRoomValidator } from '@/lib/validations/room';
import { useRouter } from 'next/navigation';

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
        url
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
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="animate-go-down max-w-md w-full m-3 relative bg-white p-4 rounded-md"
		>
			<Link
				href=".."
				className="absolute top-1.5 right-1.5 w-4 h-4 p-0.5 aspect-square rounded-full bg-rose-600 flex justify-center items-center"
			>
				<X color="white" />
			</Link>
			<p className="block text-md font-medium leading-6 text-gray-900">
				Create New Room
			</p>

			<div className="mt-2 flex-col flex gap-2">
				<label htmlFor="name" className=" space-y-1">
					<span className="text-sm flex justify-between items-center">
						Room Name*
						<p className="text-red-600">{errors.name?.message}</p>
					</span>

					<input
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
					<input
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
