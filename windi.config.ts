import { defineConfig } from 'windicss/helpers';

function shortcut(...values: string[]) {
	return values.join(' ');
}

export default defineConfig({
	extract: {
		include: ['**/*.{jsx,tsx,css}'],
		exclude: ['node_modules', '.git', '.next'],
	},
});
