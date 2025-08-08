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
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				'work-time': {
					DEFAULT: 'hsl(var(--work-time))',
					foreground: 'hsl(var(--work-time-foreground))'
				},
				savings: 'hsl(var(--savings))',
				gold: {
					DEFAULT: 'hsl(var(--gold))',
					foreground: 'hsl(var(--gold-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'gold-glow': {
					'0%': { 
						opacity: '0',
						transform: 'translateY(10px) scale(0.95)',
						boxShadow: '0 0 0 rgba(255, 215, 0, 0)'
					},
					'50%': {
						boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
					},
					'100%': { 
						opacity: '1',
						transform: 'translateY(0) scale(1)',
						boxShadow: '0 0 10px rgba(255, 215, 0, 0.1)'
					}
				},
				'coin-fall': {
					'0%': {
						transform: 'translateY(-100px) rotate(0deg)',
						opacity: '0'
					},
					'20%': {
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(50px) rotate(720deg)',
						opacity: '0'
					}
				},
				'coin-rise': {
					'0%': {
						transform: 'translateY(100px) rotate(0deg)',
						opacity: '0'
					},
					'20%': {
						opacity: '1'
					},
					'80%': {
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(-100px) rotate(-720deg)',
						opacity: '0'
					}
				},
				'coin-fall-spill': {
					'0%': {
						transform: 'translate(var(--x-start, 0px), -100px) scale(var(--scale, 1)) rotate(0deg)',
						opacity: '0'
					},
					'15%': {
						opacity: '1'
					},
					'40%': {
						transform: 'translate(var(--x-mid, 0px), 200px) scale(var(--scale, 1)) rotate(180deg)'
					},
					'80%': {
						transform: 'translate(var(--x-end, 0px), 600px) scale(var(--scale, 1)) rotate(360deg)'
					},
					'100%': {
						transform: 'translate(var(--x-end, 0px), 100vh) scale(var(--scale, 1)) rotate(540deg)',
						opacity: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'gold-glow': 'gold-glow 0.6s ease-out',
				'coin-fall': 'coin-fall 1.5s ease-out',
				'coin-rise': 'coin-rise 1.2s ease-out',
				'coin-fall-spill': 'coin-fall-spill 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
