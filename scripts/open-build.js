const { exec } = require( 'child_process' );
const path = require( 'path' );

const buildDir = path.resolve( 'build' );
const isWindows = process.platform === 'win32';

const cmd = isWindows
	? `explorer "${ buildDir }"`
	: process.platform === 'darwin'
	? `open "${ buildDir }"`
	: `xdg-open "${ buildDir }"`;

exec( cmd, { detached: true }, () => process.exit( 0 ) );
