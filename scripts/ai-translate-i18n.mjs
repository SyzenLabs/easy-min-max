/* eslint-disable no-console */
// @ts-nocheck
/* eslint-disable camelcase */
import gettextParser from 'gettext-parser';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = Object.fromEntries(
	process.argv.slice( 2 ).map( ( arg ) => {
		const [ key, value ] = arg.replace( /^--/, '' ).split( '=' );
		return [ key, value ?? true ];
	} )
);

const defaultLocales = [ 'de_DE', 'fr_FR', 'it_IT', 'pl_PL', 'es_ES' ].join(
	','
);
const potPath =
	args.pot || path.join( 'languages', 'easy-min-max.pot' );
const outDir = args.outDir || path.dirname( potPath );
const locales = String(
	args.locales || process.env.EAMM_I18N_LOCALES || defaultLocales
)
	.split( ',' )
	.map( ( locale ) => locale.trim() )
	.filter( Boolean );

const apiKey = process.env.OPENAI_API_KEY;
const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const org = process.env.OPENAI_ORG;
const batchSize = Number.parseInt( args.batch || '40', 10 );

const createSpinner = ( label ) => {
	const frames = [ '|', '/', '-', '\\' ];
	let index = 0;
	const start = () => {
		process.stdout.write( `${ label } ${ frames[ index ] }` );
		return setInterval( () => {
			index = ( index + 1 ) % frames.length;
			process.stdout.write( `\r${ label } ${ frames[ index ] }` );
		}, 120 );
	};
	const stop = ( message ) => {
		process.stdout.write( `\r${ message }\n` );
	};
	return { start, stop };
};

if ( ! apiKey ) {
	throw new Error( 'Missing OPENAI_API_KEY environment variable.' );
}

const pluralFormsByLocale = {
	de_DE: 'nplurals=2; plural=(n != 1);',
	fr_FR: 'nplurals=2; plural=(n > 1);',
	it_IT: 'nplurals=2; plural=(n != 1);',
	pl_PL: 'nplurals=3; plural=(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<12 || n%100>14) ? 1 : 2);',
	es_ES: 'nplurals=2; plural=(n != 1);',
};

const buildPrompt = ( targetLocale, items ) => {
	return [
		`Target locale: ${ targetLocale }.`,
		'Translate each message to the target locale.',
		'Preserve placeholders like %s, %d, %1$s, %2$d, {{ }} and HTML tags.',
		'Do not translate brand names like WordPress, WooCommerce, or product names.',
		'Return JSON only in this shape: {"translations":[{"id":1,"text":"..."}]}',
		'If an item has plural text, return an array in "text" matching plural count.',
		'Items:',
		JSON.stringify( items, null, 2 ),
	].join( '\n' );
};

const extractJson = ( content ) => {
	const start = content.indexOf( '{' );
	const end = content.lastIndexOf( '}' );
	if ( start === -1 || end === -1 ) {
		throw new Error( 'No JSON found in AI response.' );
	}
	return JSON.parse( content.slice( start, end + 1 ) );
};

const chunk = ( array, size ) => {
	const chunks = [];
	for ( let i = 0; i < array.length; i += size ) {
		chunks.push( array.slice( i, i + size ) );
	}
	return chunks;
};

const translateBatch = async ( targetLocale, items ) => {
	const spinner = createSpinner(
		`Translating ${ items.length } strings to ${ targetLocale }...`
	);
	const spinnerId = spinner.start();
	const response = await fetch( `${ baseUrl }/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${ apiKey }`,
			...( org ? { 'OpenAI-Organization': org } : {} ),
		},
		body: JSON.stringify( {
			model,
			temperature: 0,
			messages: [
				{
					role: 'system',
					content:
						'You are a professional translator for WordPress plugins. Return JSON only.',
				},
				{
					role: 'user',
					content: buildPrompt( targetLocale, items ),
				},
			],
		} ),
	} );
	clearInterval( spinnerId );

	if ( ! response.ok ) {
		spinner.stop( `Failed translating ${ targetLocale }.` );
		const errorText = await response.text();
		throw new Error(
			`AI request failed (${ response.status }): ${ errorText }`
		);
	}

	const data = await response.json();
	const content = data?.choices?.[ 0 ]?.message?.content || '';
	spinner.stop(
		`Translated ${ items.length } strings to ${ targetLocale }.`
	);
	return extractJson( content );
};

const collectEntries = ( translations ) => {
	const entries = [];
	let id = 1;

	Object.keys( translations ).forEach( ( context ) => {
		const group = translations[ context ];
		Object.keys( group ).forEach( ( msgid ) => {
			if ( ! msgid ) {
				return;
			}
			const entry = group[ msgid ];
			entries.push( {
				id: id++,
				context,
				msgid: entry.msgid,
				msgidPlural: entry.msgid_plural,
				entry,
			} );
		} );
	} );

	return entries;
};

const formatHeaderDate = () => {
	const date = new Date();
	const pad = ( value ) => String( value ).padStart( 2, '0' );
	return `${ date.getUTCFullYear() }-${ pad(
		date.getUTCMonth() + 1
	) }-${ pad( date.getUTCDate() ) } ${ pad( date.getUTCHours() ) }:${ pad(
		date.getUTCMinutes()
	) }+0000`;
};

const translateLocale = async ( targetLocale ) => {
	console.log( `\nStarting locale: ${ targetLocale }` );
	const potBuffer = fs.readFileSync( potPath );
	const pot = gettextParser.po.parse( potBuffer );
	const entries = collectEntries( pot.translations || {} );
	const totalBatches = Math.ceil( entries.length / batchSize ) || 1;
	console.log(
		`Found ${ entries.length } strings. Batch size: ${ batchSize }. Total batches: ${ totalBatches }.`
	);

	const items = entries.map( ( item ) => ( {
		id: item.id,
		context: item.context || undefined,
		msgid: item.msgid,
		msgidPlural: item.msgidPlural || undefined,
	} ) );

	let batchIndex = 1;
	for ( const batch of chunk( items, batchSize ) ) {
		console.log( `Batch ${ batchIndex }/${ totalBatches }...` );
		const result = await translateBatch( targetLocale, batch );
		const translated = result.translations || [];
		const map = new Map(
			translated.map( ( item ) => [ item.id, item.text ] )
		);

		for ( const item of batch ) {
			const value = map.get( item.id );
			if ( ! value ) {
				continue;
			}
			const entry = entries.find(
				( entryItem ) => entryItem.id === item.id
			)?.entry;
			if ( ! entry ) {
				continue;
			}

			if ( Array.isArray( value ) ) {
				entry.msgstr = value.map( ( text ) => String( text ) );
			} else {
				entry.msgstr = [ String( value ) ];
			}
		}
		batchIndex++;
	}

	const pluralForms = pluralFormsByLocale[ targetLocale ];
	pot.headers = {
		...pot.headers,
		Language: targetLocale,
		'PO-Revision-Date': formatHeaderDate(),
		'Last-Translator': 'AI Translation <noreply@example.com>',
		'Language-Team': `${ targetLocale } <noreply@example.com>`,
		'X-Generator': 'eamm-ai-i18n',
		...( pluralForms ? { 'Plural-Forms': pluralForms } : {} ),
	};

	const domain =
		pot.headers?.[ 'X-Domain' ] || path.basename( potPath, '.pot' );
	const outputPath = path.join( outDir, `${ domain }-${ targetLocale }.po` );
	fs.mkdirSync( outDir, { recursive: true } );
	fs.writeFileSync( outputPath, gettextParser.po.compile( pot ) );
	console.log( `Generated ${ outputPath }` );
};

const run = async () => {
	for ( const locale of locales ) {
		await translateLocale( locale );
	}
};

run().catch( ( error ) => {
	console.error( error );
	process.exit( 1 );
} );
