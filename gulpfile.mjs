// @ts-nocheck
/* eslint-disable no-console */
import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
// import concat from 'gulp-concat';
import { spawn } from 'child_process';
import { deleteSync } from 'del';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import autoprefixer from 'gulp-autoprefixer';
import cached from 'gulp-cached';
import header from 'gulp-header';
import remember from 'gulp-remember';
import rename from 'gulp-rename';
import sassGlob from 'gulp-sass-glob';
import shell from 'gulp-shell';
import watch from 'gulp-watch';
import zip from 'gulp-zip';
import _ from 'lodash';
import { resolve } from 'path';
import readline from 'readline';

const pkg = JSON.parse( readFileSync( './package.json', 'utf-8' ) );
const sass = gulpSass( dartSass );

function runCommand( command, args = [], options = {} ) {
	return new Promise( ( resolvePromise, rejectPromise ) => {
		const child = spawn( command, args, {
			shell: false,
			stdio: 'inherit',
			...options,
		} );
		child.on( 'error', rejectPromise );
		child.on( 'close', ( code ) => {
			if ( code === 0 ) {
				resolvePromise();
				return;
			}
			rejectPromise(
				new Error( `${ command } exited with code ${ code }` )
			);
		} );
	} );
}

const excludedFiles = [
	'!./.git',
	'!./node_modules/**',
	'!./.gitignore',
	'!./src/**',
	'!./build/**',
	'!./**/*.LICENSE.txt',
	'!.*',
	'!./docs/**',
	'!package.json',
	'!package-lock.json',
	'!*.yml',
	'!*.key',
	'!**/*.map',
	'!update-deps-key.mjs',
	'!gulpfile.mjs',
	'!*.js',
	'!*.bak',
	'!*.phar',
	'!Todo.md',
	'!jsconfig.json',
	'!composer.json',
	'!composer.lock',
	'!scoper.inc.php',
	'!*.md',
	'!*.jsonc',
	'!./assets/js/szql-wc-shipping-settings.js',
	'!./assets/css/szql-backend-temp.css',
	'!./scripts/**',
	'!./vendor/**',
];

function getDateTime() {
	const currDate = new Date();
	const year = currDate.getFullYear();
	const month = currDate.getMonth() + 1; // Note: Month is zero-based, so January is 0
	const day = currDate.getDate();
	const hours = currDate.getHours();
	const minutes = currDate.getMinutes();
	const seconds = currDate.getSeconds();
	return `__${ year }-${ month }-${ day }_${ hours }-${ minutes }-${ seconds }`;
}

// Automate SCSS Compilation with Tailwind CSS
gulp.task( 'sass_compile', function () {
	return gulp
		.src( './src/scss/backend.scss', { allowEmpty: true } )
		.pipe( cached( 'scss' ) )
		.pipe( sassGlob() )
		.pipe(
			sass( {
				silenceDeprecations: [ 'legacy-js-api', 'import' ],
			} )
		)
		.pipe( remember( 'scss' ) )
		.pipe(
			header(
				'@import "tailwindcss";\n @custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));\n'
			)
		)
		.pipe( rename( 'szql-backend-temp.css' ) )
		.pipe( gulp.dest( './assets/css' ) );
} );

gulp.task( 'tailwind_compile', function () {
	return gulp
		.src( './assets/css/szql-backend-temp.css', {
			allowEmpty: true,
		} )
		.pipe( cached( 'tailwind' ) )
		.pipe(
			shell(
				'npx @tailwindcss/cli -i ./assets/css/szql-backend-temp.css -o ./src/style-generated.css --config ./tailwind.config.js'
			)
		)
		.pipe( remember( 'tailwind' ) );
} );

gulp.task( 'autoprefix_compile', function () {
	return (
		gulp
			.src( './assets/css/szql-backend.css', { allowEmpty: true } )
			.pipe( cached( 'autoprefix' ) )
			.pipe(
				autoprefixer( {
					cascade: false,
				} )
			)
			.pipe( remember( 'autoprefix' ) )
			// .pipe(
			// 	header(
			// 		'@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");\n'
			// 	)
			// )
			.pipe( gulp.dest( './assets/css' ) )
	);
} );

gulp.task( 'automate_scss', gulp.series( 'sass_compile', 'tailwind_compile' ) );

gulp.task( 'datatable_css', function () {
	return gulp
		.src( 'node_modules/@wordpress/dataviews/build-style/style.css' )
		.pipe( cached( 'datatable' ) )
		.pipe( rename( 'szql-backend-datatable.css' ) )
		.pipe( remember( 'datatable' ) )
		.pipe( gulp.dest( './assets/css' ) );
} );

gulp.task( 'datatable_css_rtl', function () {
	return gulp
		.src( 'node_modules/@wordpress/dataviews/build-style/style-rtl.css' )
		.pipe( cached( 'datatable_rtl' ) )
		.pipe( rename( 'szql-backend-datatable-rtl.css' ) )
		.pipe( remember( 'datatable_rtl' ) )
		.pipe( gulp.dest( './assets/css' ) );
} );

gulp.task(
	'datatable_css_all',
	gulp.series( 'datatable_css', 'datatable_css_rtl' )
);

/**
 * =================================================
 * Final Group Tasks
 * =================================================
 */

/**
 * Watch Final: Watch for changes in SCSS and JS files
 */
gulp.task( 'watch', function () {
	const runSass = _.debounce(
		() => gulp.series( 'sass_compile', 'datatable_css_all' )(),
		500
	);
	// Start Tailwind in watch mode
	spawn(
		'npx',
		[
			'@tailwindcss/cli',
			'-i',
			'./assets/css/szql-backend-temp.css',
			'-o',
			'./src/style-generated.css',
			'--config',
			'./tailwind.config.js',
			'--watch',
		],
		{ shell: true, stdio: 'inherit' }
	);
	watch(
		[ 'src/**/*.scss', '!src/frontend/**/*.scss' ],
		{ ignoreInitial: false },
		function ( vinyl ) {
			if ( vinyl.path.indexOf( 'backend.scss' ) === -1 ) {
				cached.caches.scss = {};
			}
			runSass();
		}
	);
} );

/**
 * Build Final: Compile SCSS and JS files
 */
gulp.task( 'build', gulp.series( 'automate_scss', 'datatable_css_all' ) );

/**
 * Package 1: Copy files to build folder
 */
let folderName = 'syzenlabs-quantity-limits';
let destName = 'syzenlabs-quantity-limits';

gulp.task( 'copy_files', function () {
	const date = getDateTime();
	folderName = 'Version-Unknown' + date;

	try {
		const v = pkg.version;
		if ( v ) {
			folderName = 'V' + v + date;
			destName = destName + '-' + v;
		} else {
			// Version definition not found; proceeding with unknown version label
		}
	} catch ( err ) {
		// Error getting version; proceeding with unknown version label
	}

	return gulp.src( [ './**/*', ...excludedFiles ], { encoding: false } ).pipe(
		gulp.dest( `./build/${ folderName }/syzenlabs-quantity-limits/`, {
			overwrite: true,
		} )
	);
} );

/**
 * Package 2: Zip the plugin
 */
gulp.task( 'zip', function () {
	return (
		gulp
			.src( `./build/${ folderName }/**`, { encoding: false } )
			// @ts-ignore
			.pipe( zip( destName + '.zip' ) )
			.pipe( gulp.dest( `./build/${ folderName }/` ) )
	);
} );

/**
 * Package Final: Build and zip the plugin
 */
gulp.task( 'package', gulp.series( 'copy_files', 'zip' ) );

// -----------------------------
// CI-specific tasks
// -----------------------------
// These tasks avoid versioned/timestamped folders and do not zip/clean.
// Files are placed directly under ./dist/optin for CI uploads.

const releaseBranch = 'release';
const releaseWorktree = './.worktrees/release';
const releaseWorktreeAbs = resolve( releaseWorktree );
const releaseWorktreeAbsPosix = releaseWorktreeAbs.replace( /\\/g, '/' );
const pipelineOriginalAbs = resolve( './bitbucket-pipelines-original.yml' );
const pipelineTargetAbs = resolve( releaseWorktree, 'bitbucket-pipelines.yml' );

function promptInput( question ) {
	return new Promise( ( resolvePromise ) => {
		const rl = readline.createInterface( {
			input: process.stdin,
			output: process.stdout,
		} );
		rl.question( question, ( answer ) => {
			rl.close();
			resolvePromise( answer.trim() );
		} );
	} );
}

function validateReleaseTag( tag ) {
	const tagMatch = /^v(\d+\.\d+\.\d+(?:-[a-zA-Z]+)?)$/.exec( tag );
	if ( ! tagMatch ) {
		throw new Error( 'Invalid tag. Use format vX.Y.Z or vX.Y.Z-channel.' );
	}

	const version = tagMatch[ 1 ];
	const readmeFile = readFileSync( './readme.txt', 'utf8' );
	const stableTagMatch = /Stable tag:\s+(\d+\.\d+\.\d+(?:-[a-zA-Z]+)?)/.exec(
		readmeFile
	);
	if ( ! stableTagMatch ) {
		throw new Error( 'Stable tag not found in readme.txt.' );
	}
	if ( stableTagMatch[ 1 ] !== version ) {
		throw new Error(
			`Stable tag mismatch. readme.txt has ${ stableTagMatch[ 1 ] } but tag is ${ version }.`
		);
	}

	if ( ! readmeFile.includes( `= ${ version } - ` ) ) {
		throw new Error(
			`Changelog entry for ${ version } not found in readme.txt.`
		);
	}

	return version;
}

async function getReleaseTag() {
	const envTag = ( process.env.RELEASE_TAG || '' ).trim();
	if ( envTag ) {
		validateReleaseTag( envTag );
		return envTag;
	}
	const inputTag = await promptInput( 'Enter release tag (vX.Y.Z): ' );
	validateReleaseTag( inputTag );
	return inputTag;
}

gulp.task( 'release_test_prepare_worktree', async function () {
	if ( ! existsSync( './.worktrees' ) ) {
		mkdirSync( './.worktrees', { recursive: true } );
	}

	try {
		await runCommand( 'git', [
			'worktree',
			'remove',
			'-f',
			releaseWorktree,
		] );
	} catch ( err ) {
		// ignore if worktree does not exist
	}

	try {
		await runCommand( 'git', [ 'fetch', 'origin', releaseBranch ] );
	} catch ( err ) {
		// ignore if remote branch does not exist
	}

	try {
		await runCommand( 'git', [
			'worktree',
			'add',
			'-f',
			'-B',
			releaseBranch,
			releaseWorktree,
			`origin/${ releaseBranch }`,
		] );
	} catch ( err ) {
		await runCommand( 'git', [
			'worktree',
			'add',
			'-f',
			'-B',
			releaseBranch,
			releaseWorktree,
		] );
	}
} );

gulp.task( 'release_test_copy_build', function () {
	deleteSync(
		[
			`${ releaseWorktreeAbsPosix }/**`,
			`!${ releaseWorktreeAbsPosix }/.git`,
			`!${ releaseWorktreeAbsPosix }/.git/**`,
		],
		{ force: true, dot: true }
	);

	return gulp
		.src( [ './build/**', '!./build/**/.*', '!./build/**/.*/**' ], {
			allowEmpty: true,
			dot: false,
		} )
		.pipe( gulp.dest( releaseWorktreeAbs ) );
} );

gulp.task( 'release_test_prepare_pipeline', function ( done ) {
	if ( ! existsSync( pipelineOriginalAbs ) ) {
		throw new Error( 'bitbucket-pipelines-original.yml not found.' );
	}
	copyFileSync( pipelineOriginalAbs, pipelineTargetAbs );
	done();
} );

gulp.task( 'release_test_force_push', async function () {
	const releaseTag = await getReleaseTag();
	const dateTag = new Intl.DateTimeFormat( 'en-GB', {
		timeZone: 'Asia/Dhaka',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: true,
	} ).format( new Date() );

	await runCommand( 'git', [ '-C', releaseWorktreeAbs, 'add', '-A' ] );
	await runCommand( 'git', [
		'-C',
		releaseWorktreeAbs,
		'commit',
		'-m',
		`Release build ${ releaseTag } ${ dateTag }`,
		'--allow-empty',
	] );
	await runCommand( 'git', [
		'-C',
		releaseWorktreeAbs,
		'tag',
		'-f',
		releaseTag,
	] );
	await runCommand( 'git', [
		'-C',
		releaseWorktreeAbs,
		'push',
		'-f',
		'origin',
		releaseBranch,
	] );
	await runCommand( 'git', [
		'-C',
		releaseWorktreeAbs,
		'push',
		'-f',
		'origin',
		releaseTag,
	] );
} );

gulp.task( 'release_test_cleanup', async function () {
	try {
		await runCommand( 'git', [
			'worktree',
			'remove',
			'-f',
			releaseWorktree,
		] );
	} catch ( err ) {
		// ignore if worktree does not exist
	}
	deleteSync( [ releaseWorktree ], { force: true } );
} );

gulp.task( 'copy_files_ci', function () {
	return gulp
		.src( [ './**/*', ...excludedFiles ], { encoding: false } )
		.pipe( gulp.dest( './build/' ) );
} );

gulp.task( 'clean_ci', async function () {
	deleteSync( [ 'build/**/*', 'build/*' ], { force: true } );
} );

gulp.task(
	'package-ci',
	gulp.series(
		'clean_ci',
		'copy_files_ci',
		'release_test_prepare_worktree',
		'release_test_copy_build',
		'release_test_prepare_pipeline',
		'release_test_force_push',
		'release_test_cleanup'
	)
);
