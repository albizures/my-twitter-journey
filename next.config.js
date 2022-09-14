const WindiCSSWebpackPlugin = require('windicss-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack(config) {
		config.plugins.push(new WindiCSSWebpackPlugin());

		return config;
	},
	reactStrictMode: true,
	swcMinify: true,
	images: {
		domains: ['pbs.twimg.com'],
	},
};

module.exports = nextConfig;
