
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#D2840C',
					foreground: '#ffffff'
				},
				secondary: {
					DEFAULT: '#1a1a1a',
					foreground: '#ffffff'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: '#2a2a2a',
					foreground: '#a0a0a0'
				},
				accent: {
					DEFAULT: '#D2840C',
					foreground: '#ffffff'
				},
				popover: {
					DEFAULT: '#1a1a1a',
					foreground: '#ffffff'
				},
				card: {
					DEFAULT: '#1a1a1a',
					foreground: '#ffffff'
				},
				friday: {
					black: '#0a0a0a',
					'black-light': '#1a1a1a',
					'black-lighter': '#2a2a2a',
					orange: '#D2840C',
					'orange-light': '#E09528',
					'orange-dark': '#B8740A'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'bubble-float': {
					'0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
					'33%': { transform: 'translate(30px, -30px) rotate(120deg)' },
					'66%': { transform: 'translate(-20px, 20px) rotate(240deg)' }
				},
				'text-slide': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'10%, 90%': { transform: 'translateX(0)', opacity: '1' },
					'100%': { transform: 'translateX(-100%)', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				}
			},
			animation: {
				'float': 'float 3s ease-in-out infinite',
				'bubble-float': 'bubble-float 8s ease-in-out infinite',
				'text-slide': 'text-slide 4s ease-in-out infinite',
				'fade-in': 'fade-in 0.5s ease-out',
				'bubble-1': 'bubble-float 8s ease-in-out infinite',
				'bubble-2': 'bubble-float 8s ease-in-out infinite 2s',
				'bubble-3': 'bubble-float 8s ease-in-out infinite 4s',
				'bubble-4': 'bubble-float 8s ease-in-out infinite 6s'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
