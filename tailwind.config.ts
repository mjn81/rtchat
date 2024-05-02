import type { Config } from "tailwindcss"

const config = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	prefix: '',
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				blob: {
					'0%': {
						transform: 'translate(0,0) ',
					},
					'20%': {
						transform: 'translate(100px, -50px)',
					},
					'40%': {
						transform: 'translate(150px,-100px)',
          },
          '60%': {
						transform: 'translate(200px,-70px)',
          },
          '80%': {
						transform: 'translate(100px,60px)',
					},
					'100%': {
						transform: 'translate(0,0) ',
					},
				},
				"blob-left": {
					'0%': {
						transform: 'translate(0,0) ',
					},
					'20%': {
						transform: 'translate(-60px, -80px)',
					},
					'40%': {
						transform: 'translate(150px,-100px)',
          },
          '60%': {
						transform: 'translate(250px,150px) ',
          },
          '80%': {
						transform: 'translate(-20px,40px)',
					},
					'100%': {
						transform: 'translate(0,0) ',
					},
        },
        "blob-right": {
					'0%': {
						transform: 'translate(0,0) ',
					},
					'20%': {
						transform: 'translate(40px, -100px)',
					},
					'40%': {
						transform: 'translate(10px,-20px)',
          },
          '60%': {
						transform: 'translate(-60px,-80px)',
          },
          '80%': {
						transform: 'translate(-200px,100px)',
					},
					'100%': {
						transform: 'translate(0,0) ',
					},
				},
			},
			animation: {
        blob: 'blob 10s infinite linear',
        "blob-left": 'blob-left 10s infinite linear',
        "blob-right": 'blob-right 10s infinite linear',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config