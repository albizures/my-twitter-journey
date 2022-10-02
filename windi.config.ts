import { defineConfig } from 'windicss/helpers';

function shortcut(...values: string[]) {
	return values.join(' ');
}

export default defineConfig({
	theme: {
		extend: {
			fontFamily: {
				serif: "'Playfair Display', serif",
				sans: "'Lato', sans-serif",
				body: "'Lato', sans-serif",
			},
		},
	},
	extract: {
		include: ['**/*.{jsx,tsx,css}'],
		exclude: ['node_modules', '.git', '.next'],
	},
});
