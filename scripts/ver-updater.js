/* eslint-disable no-console */

const fs = require( 'fs' );
const pjson = require( '../package.json' );
const { exit } = require( 'process' );
const readline = require( 'readline' );
const { execSync } = require( 'child_process' );

console.log( `

██╗    ██╗ ██████╗ ██╗    ██╗███████╗██╗  ██╗██╗██████╗ ██████╗ ██╗███╗   ██╗ ██████╗ 
██║    ██║██╔═══██╗██║    ██║██╔════╝██║  ██║██║██╔══██╗██╔══██╗██║████╗  ██║██╔════╝ 
██║ █╗ ██║██║   ██║██║ █╗ ██║███████╗███████║██║██████╔╝██████╔╝██║██╔██╗ ██║██║  ███╗
██║███╗██║██║   ██║██║███╗██║╚════██║██╔══██║██║██╔═══╝ ██╔═══╝ ██║██║╚██╗██║██║   ██║
╚███╔███╔╝╚██████╔╝╚███╔███╔╝███████║██║  ██║██║██║     ██║     ██║██║ ╚████║╚██████╔╝
 ╚══╝╚══╝  ╚═════╝  ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝     ╚═╝╚═╝  ╚═══╝ ╚═════╝ 

Starting build process...

` );

const reg1 = /define\( 'SZQL_VER', '(\d+\.\d+\.\d+(?:-[a-zA-Z]+)?)' \);/;
const reg2 = /\*\sVersion:\s+(\d+\.\d+\.\d+(?:-[a-zA-Z]+)?)/;
const reg3 = /Stable tag:\s+(\d+\.\d+\.\d+(?:-[a-zA-Z]+)?)/;

let phpFile = fs.readFileSync( 'syzenlabs-quantity-limits.php', 'utf8' );
let readmeFile = fs.readFileSync( 'readme.txt', 'utf8' );
const phpV1 = phpFile.match( reg1 )?.[ 1 ] ?? 'Constant version not found';
const phpV2 = phpFile.match( reg2 )?.[ 1 ] ?? 'Metadata version not found';
const readmeV = readmeFile.match( reg3 )?.[ 1 ] ?? 'Readme version not found';

const jsV = pjson.version;

const currVersion =
	jsV === phpV1 && phpV1 === phpV2 && readmeV === phpV2 ? jsV : 'error';

console.log( `Current Version: ${ currVersion }` );

if ( currVersion === 'error' ) {
	console.log( 'Version Mismatch!' );
	console.log(
		`PHP1:${ phpV1 }, PHP2:${ phpV2 }, JS:${ jsV }, Readme:${ readmeV }`
	);
	exit( 1 );
} else {
	const rl = readline.createInterface( {
		input: process.stdin,
		output: process.stdout,
	} );

	let newVersion = '';

	rl.question(
		'Enter new version (blank to auto-increment): ',
		( answer ) => {
			newVersion = answer.trim();

			if ( newVersion === '' ) {
				newVersion = getIncrementedVersion();
			}

			if ( ! readmeFile.includes( '= ' + newVersion + ' - ' ) ) {
				console.log(
					`Changelog for version ${ newVersion } not found in readme.txt!`
				);
				console.log( `Please include changelog before building.` );
				exit( 1 );
			} else {
				console.log( 'Changelog found in readme...' );
				console.log( 'Updating version...' );
				updateVersion( newVersion );

				console.log( 'Updated Version Successfully! \n\n' );
				rl.close();
			}
		}
	);
}

function updateVersion( version ) {
	phpFile = phpFile.replace( reg1, () => {
		return `define( 'SZQL_VER', '${ version }' );`;
	} );

	phpFile = phpFile.replace( reg2, () => {
		return `* Version:     ${ version }`;
	} );

	readmeFile = readmeFile.replace( reg3, () => {
		return `Stable tag: ${ version }`;
	} );

	// Write the updated content back to the file
	fs.writeFileSync( 'syzenlabs-quantity-limits.php', phpFile, 'utf8' );
	fs.writeFileSync( 'readme.txt', readmeFile, 'utf8' );

	execSync( `npm pkg set version=${ version }` );
}

function getIncrementedVersion() {
	let oldVersion = currVersion;
	let channel = null;

	if ( oldVersion.includes( '-' ) ) {
		[ oldVersion, channel ] = oldVersion.split( '-' );
	}

	const [ major, minor, patch ] = oldVersion.split( '.' ).map( Number );

	if ( isNaN( patch ) ) {
		throw new Error( 'Version increment error. ' + currVersion );
	}

	return `${ major }.${ minor }.${ patch + 1 }${
		channel ? `-${ channel }` : ''
	}`;
}
