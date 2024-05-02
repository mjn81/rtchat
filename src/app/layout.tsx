import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import Providers from '@/components/Providers';
import { cn } from "@/lib/utils";

const inter = Roboto({
	subsets: ['latin'],
	weight: ['300', '400', '500', '700', '900'],
});

export const metadata: Metadata = {
  title: "RTChat",
	description: "Real-time chatting app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
		<html lang="en">
			<body className={cn(inter.className, 'antialiased font-sans')}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
