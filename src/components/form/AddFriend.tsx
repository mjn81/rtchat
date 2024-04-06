'use client'
import { FC, useState } from "react";
import { Button } from "@/components/ui/Button";
import { addFriendValidator } from "@/lib/validations/add-friend";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Cross, X } from "lucide-react";

interface AddFriendFormProps {
  
}
type FormData = z.infer<typeof addFriendValidator>;
const AddFriendForm: FC<AddFriendFormProps> = () => {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { register, handleSubmit, setError, formState: {errors}} = useForm<FormData>({
    resolver: zodResolver(addFriendValidator)
  });
  
  const addFriend = async (email: string) => {
    setIsLoading(true);
    try {
      const validatedEmail = addFriendValidator.parse({
        email
      });

      await axios.post('/api/friends/send', {
        email: validatedEmail
      }
      );
      setShowSuccess(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(
          'email',
          { message: error.message }
        );
        return
      }

      if (error instanceof AxiosError) {
        setError('email',
          {
          message: error.response?.data
        })
        return 
      }

      setError('email', {
        message: 'Something went wrong'
      })
    } finally {
      setIsLoading(false);
    }
  }

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  }
  
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
			<section className="flex justify-between items-center">
				<label
					htmlFor="email"
					className="block text-md font-medium leading-6 text-gray-900"
				>
					Add friend by E-Mail
				</label>
				<p className="text-sm text-red-600">{errors.email?.message}</p>
				{showSuccess ? (
					<p className="text-sm text-green-600">Friend request sent!</p>
				) : null}
			</section>
			<div className="mt-2 flex-col flex sm:flex-row gap-4">
				<input
					{...register('email')}
					type="text"
					id="email"
					placeholder="you@example.com"
					className="block w-full rounded-md border-0 py-1.5  text-gray-900 shadow-sm ring-1 ring-inset focus:ring-inset focus:shadow ring-gray-300 focus:ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
				/>
				<Button isLoading={isLoading} className="w-full sm:w-fit">Add</Button>
			</div>
		</form>
	);
}

export default AddFriendForm;