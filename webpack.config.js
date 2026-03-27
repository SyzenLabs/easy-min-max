const path = require( 'path' );
const webpack = require( 'webpack' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

let defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const RtlCssPlugin = require( '@wordpress/scripts/plugins/rtlcss-webpack-plugin' );

const jsOutputPath = path.resolve( __dirname, 'assets/js' );
const cssOutputPath = path.resolve( __dirname, 'assets/css' );
const cssOutputRelativeToJs =
	path
		.relative( jsOutputPath, cssOutputPath )
		.split( path.sep )
		.join( '/' ) || '.';

class MoveRtlCssToCssFolderPlugin {
	constructor( { destination = '../css' } = {} ) {
		this.destination = destination;
	}

	apply( compiler ) {
		compiler.hooks.thisCompilation.tap(
			'MoveRtlCssToCssFolderPlugin',
			( compilation ) => {
				compilation.hooks.processAssets.tap(
					{
						name: 'MoveRtlCssToCssFolderPlugin',
						stage: webpack.Compilation
							.PROCESS_ASSETS_STAGE_SUMMARIZE,
					},
					() => {
						const destination = this.destination
							.replace( /\\/g, '/' )
							.replace( /\/$/, '' );

						for ( const {
							name: assetName,
						} of compilation.getAssets() ) {
							if ( ! assetName.endsWith( '-rtl.css' ) ) {
								continue;
							}

							// Skip if it already has a directory component.
							if (
								assetName.includes( '/' ) ||
								assetName.includes( '\\' )
							) {
								continue;
							}

							const prefix =
								destination && destination !== '.'
									? `${ destination }/`
									: '';
							const newAssetName = `${ prefix }${ assetName }`;

							if (
								typeof compilation.renameAsset === 'function'
							) {
								compilation.renameAsset(
									assetName,
									newAssetName
								);
							} else {
								const asset = compilation.getAsset( assetName );
								if ( ! asset ) {
									continue;
								}
								compilation.emitAsset(
									newAssetName,
									asset.source,
									asset.info
								);
								compilation.deleteAsset( assetName );
							}

							for ( const chunk of compilation.chunks ) {
								if ( chunk.files?.has( assetName ) ) {
									chunk.files.delete( assetName );
									chunk.files.add( newAssetName );
								}
							}
						}
					}
				);
			}
		);
	}
}

// Update CSS rules to support SCSS
const cssRuleIndex = defaultConfig.module.rules.findIndex(
	( rule ) => rule.test && rule.test.toString().includes( 'css' )
);

if ( cssRuleIndex !== -1 ) {
	const cssRule = defaultConfig.module.rules[ cssRuleIndex ];
	// Add sass-loader to the CSS rule's use array
	cssRule.test = /\.(?:css|scss)$/;
	cssRule.use.push( 'sass-loader' );
}

defaultConfig = {
	...defaultConfig,
	context: __dirname,
	entry: {
		'eamm-backend': './src/index.js',
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
	plugins: [
		...( defaultConfig.plugins || [] ).filter(
			( plugin ) =>
				! ( plugin instanceof MiniCssExtractPlugin ) &&
				! ( plugin instanceof RtlCssPlugin )
		),
		new MiniCssExtractPlugin( {
			filename: () => {
				return `${ cssOutputRelativeToJs }/[name].css`;
			},
		} ),
		new RtlCssPlugin(),
		new MoveRtlCssToCssFolderPlugin( {
			destination: cssOutputRelativeToJs,
		} ),
	],
};

module.exports = defaultConfig;
