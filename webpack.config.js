// @ts-nocheck
const path = require( 'path' );

let defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

const jsOutputPath = path.resolve( __dirname, 'assets/js' );

defaultConfig = {
	...defaultConfig,
	context: __dirname,
	entry: {
		'syzeql-backend': './src/index.js',
		'syzeql-frontend': './src/frontend/index.js',
	},
	output: {
		...( defaultConfig.output || {} ),
		path: jsOutputPath,
		filename: '[name].js',
	},
	resolve: {
		...defaultConfig.resolve,
		alias: {
			...( defaultConfig.resolve?.alias || {} ),
			'@': path.resolve( __dirname, 'src' ),
		},
	},
	module: {
		...defaultConfig.module,
		rules: [
			...defaultConfig.module.rules,
			{
				test: /\.svg$/i,
				use: [
					{
						loader: '@svgr/webpack',
						options: {
							icon: true,
						},
					},
				],
			},
		],
	},
};

module.exports = defaultConfig;
