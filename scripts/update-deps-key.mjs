#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function stableStringify( obj ) {
	const allKeys = new Set();
	JSON.stringify( obj, ( key, value ) => ( allKeys.add( key ), value ) );
	const keys = Array.from( allKeys ).sort();
	return JSON.stringify( obj, keys, 2 );
}

function main() {
	const root = process.cwd();
	const lockPath = path.join( root, 'package-lock.json' );
	let lock;
	try {
		lock = JSON.parse( readFileSync( lockPath, 'utf8' ) );
	} catch ( e ) {
		console.error( 'package-lock.json not found or invalid.' );
		process.exit( 1 );
	}

	// Clone and strip root version fields so release version bumps don't affect the key
	const filtered = JSON.parse( JSON.stringify( lock ) );
	delete filtered.version; // root version
	if ( filtered.packages && filtered.packages[ '' ] ) {
		delete filtered.packages[ '' ].version; // root package version inside packages['']
	}

	// Build a digest primarily from dependency graph parts that reflect resolved versions
	// Keep everything else as-is (minus stripped fields) so updates to resolved versions invalidate the key
	const serialized = stableStringify( filtered );
	const hash = createHash( 'sha256' )
		.update( serialized )
		.digest( 'hex' )
		.slice( 0, 16 );

	const output = `deps-lock-hash:${ hash }\n`;
	writeFileSync( path.join( root, 'deps.key' ), output );
	console.log( 'Generated deps.key with hash:', hash );
}

main();
