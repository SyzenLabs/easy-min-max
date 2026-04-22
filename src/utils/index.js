export const GPT_LINK =
	'https://gemini.google.com/gem/1mZmX9P2hdmWJkEVzO89-Ki6nyw9OcaS9?usp=sharing';

export const GAPS = {
	sm: '4px',
	md: '8px',
	lg: '12px',
	xl: '16px',
	'2xl': '20px',
	'3xl': '24px',
	'4xl': '28px',
	'5xl': '32px',
	'6xl': '36px',
};

export function getUuid() {
	return (
		Date.now().toString( 36 ) +
		Math.random().toString( 36 ).substring( 2, 12 ).padStart( 12, '0' )
	);
}

export function waitForAnimationEnd( element, once = false ) {
	return new Promise( ( resolve ) => {
		// eslint-disable-next-line prefer-const
		let timeout;
		const controller = new AbortController();

		if (
			! getComputedStyle( element ).getPropertyValue( '--animation-exit' )
		) {
			resolve();
			return;
		}

		const onAnimationEnd = () => {
			clearTimeout( timeout );
			resolve();
		};

		element.addEventListener( 'animationend', onAnimationEnd, {
			once,
			signal: controller.signal,
		} );

		element.addEventListener( 'animationcancel', onAnimationEnd, {
			once,
			signal: controller.signal,
		} );

		timeout = setTimeout( () => {
			controller.abort();
			resolve();
		}, 2000 );
	} );
}

/**
 * Get settings
 *
 * @return {Object} plugin settings object.
 */
export function getSettings() {
	return syzeqlAdmin.settings;
}

/**
 * Checks if should show license page
 *
 * @return {boolean} true if the license is active, false otherwise.
 */
export function showLicensePage() {
	return syzeqlAdmin.show_lic_page === 'true';
}

/**
 * Checks if the user is a pro user
 *
 * @return {boolean} true if current user is pro, false otherwise.
 */
export function isProUser() {
	return !! syzeqlAdmin.isActive;
}

/**
 * Checks if the user is a free user
 *
 * @return {boolean} true if current user is free, false otherwise.
 */
export function isFreeUser() {
	return ! isProUser();
}

/**
 * Get base URL
 *
 * @param {string} path
 *
 * @return {string} base URL
 */
export function getBaseUrl( path = '' ) {
	return syzeqlAdmin.url + path;
}

/**
 * Get ajax URL
 *
 * @return {string} ajax URL
 */
export function getAjaxUrl() {
	return syzeqlAdmin.ajax;
}

/**
 * Get currency code
 *
 * @return {string} currency code - e.g. USD, EUR, GBP
 */
export function getCurrencyCode() {
	return syzeqlAdmin.currencyCode;
}

/**
 * Get currency symbol
 *
 * @return {string} currency symbol - e.g. $, €, £
 */
export function getCurrencySymbol() {
	return String( syzeqlAdmin.currencySymbol ).trim();
}

/**
 * Get dimension unit
 *
 * @param {boolean} cubic
 *
 * @return {string} dimension unit - e.g. cm, m, in, ft
 */
export function getDimensionUnit( cubic = false ) {
	return syzeqlAdmin.dimensionUnit + ( cubic ? '³' : '' );
}

/**
 * Get measurement unit
 *
 * @return {string} measurement unit - e.g. g, kg, lb, oz
 */
export function getWeightUnit() {
	return syzeqlAdmin.weightUnit;
}

/**
 * Get installed plugins
 *
 * @return {Object} installed plugins
 */
export function getInstalledPlugins() {
	return syzeqlAdmin.products || {};
}

/**
 * Get nonce
 *
 * @return {string} nonce
 */
export function getNonce() {
	return syzeqlAdmin.nonce;
}

/**
 * Get Feature flags
 *
 * @return {Object} flags
 */
export function getFlags() {
	return syzeqlAdmin.flags;
}

export function getLicense() {
	return syzeqlAdmin.license;
}

/**
 * Get version
 *
 * @return {string} version
 */
export function getVersion() {
	return syzeqlAdmin.version;
}

/**
 * Get active plugins
 *
 * @return {Object} active plugins
 */
export function getActivePlugins() {
	return syzeqlAdmin.products_active || {};
}

/**
 * Get current zone id
 *
 * @return {number | null} current zone id
 */
export function getCurrentZoneId() {
	if ( syzeqlAdmin.currentZoneId === null ) {
		return null;
	}

	const zoneId = +syzeqlAdmin.currentZoneId;
	return isNaN( zoneId ) ? null : zoneId;
}

/**
 * Fetches data from the server and triggers a CSV file download.
 *
 * @param {string} filename - The name of the file to be downloaded.
 * @param {Array}  data     - The data to be downloaded.
 *
 * @return {Promise<void>} Promise that resolves when the download is complete.
 */
export async function downloadAsCSV( filename, data ) {
	const headers = Object.keys( data[ 0 ] );

	const formatCSVCell = ( cell ) => {
		const cellString =
			cell === null || cell === undefined ? '' : String( cell );
		// If the cell contains a comma, double quote, or newline, wrap it in double quotes
		// if (
		// 	cellString.includes( ',' ) ||
		// 	cellString.includes( '"' ) ||
		// 	cellString.includes( '\n' )
		// ) {
		// 	// Escape existing double quotes by doubling them
		// 	cellString = '"' + cellString.replace( /"/g, '""' ) + '"';
		// }
		return cellString;
	};

	const headerRow = headers.map( formatCSVCell ).join( ',' );

	const dataRows = data.map( ( row ) =>
		headers.map( ( header ) => formatCSVCell( row[ header ] ) ).join( ',' )
	);

	const csvContent = [ headerRow, ...dataRows ].join( '\n' );

	const blob = new Blob( [ csvContent ], {
		type: 'text/csv;charset=utf-8;',
	} );

	const link = document.createElement( 'a' );
	if ( link.download !== undefined ) {
		const url = URL.createObjectURL( blob );
		link.setAttribute( 'href', url );
		link.setAttribute( 'download', filename );
		link.style.visibility = 'hidden';
		document.body.appendChild( link );
		link.click();
		document.body.removeChild( link );
		URL.revokeObjectURL( url ); // Clean up
	}
}

/**
 * Converts a CSV string to a JSON object.
 *
 * @param {string} text
 * @param {string} quoteChar
 * @param {string} delimiter
 * @return {Object} JSON object
 */
export function csvToJson( text, quoteChar = '"', delimiter = ',' ) {
	text = text.trim();
	const rows = text.split( '\n' );
	const headers = rows[ 0 ].split( ',' );

	const regex = new RegExp(
		`\\s*(${ quoteChar })?(.*?)\\1\\s*(?:${ delimiter }|$)`,
		'gs'
	);

	const match = ( line ) => {
		const matches = [ ...line.matchAll( regex ) ].map( ( m ) => m[ 2 ] );
		// Ensure matches length matches headers length by padding with null values
		const paddedMatches = Array.from(
			{ length: headers.length },
			( _, i ) => matches[ i ] ?? null
		);
		return paddedMatches;
	};

	let lines = text.split( '\n' );
	const heads = headers ?? match( lines.shift() );
	lines = lines.slice( 1 );

	return lines.map( ( line ) => {
		return match( line ).reduce( ( acc, cur, i ) => {
			// replace blank matches with `null`
			const val =
				cur === null || cur.length <= 0 ? null : Number( cur ) || cur;
			const key = heads[ i ] ?? `{i}`;
			return { ...acc, [ key ]: val };
		}, {} );
	} );
}

/**
 * Get search params
 *
 * @param {string} key
 *
 * @return {string} search params
 */
export function getSearchParams( key ) {
	return new URLSearchParams( window.location.search ).get( key );
}

/**
 * Remove search params
 *
 * @param {string} key
 */
export function removeSearchParams( key ) {
	const url = new URL( window.location.href );
	url.searchParams.delete( key );
	window.history.replaceState( null, '', url );
}

/**
 * Check if dark mode is enabled
 *
 * @return {boolean} dark mode
 */
export function isDarkMode() {
	return localStorage.getItem( 'syzeql-theme' ) === 'dark' ? true : false;
}

function toVal( mix ) {
	let k,
		y,
		str = '';

	if ( typeof mix === 'string' || typeof mix === 'number' ) {
		str += mix;
	} else if ( typeof mix === 'object' ) {
		if ( Array.isArray( mix ) ) {
			const len = mix.length;
			for ( k = 0; k < len; k++ ) {
				if ( mix[ k ] ) {
					if ( ( y = toVal( mix[ k ] ) ) ) {
						str && ( str += ' ' );
						str += y;
					}
				}
			}
		} else {
			for ( y in mix ) {
				if ( mix[ y ] ) {
					str && ( str += ' ' );
					str += y;
				}
			}
		}
	}

	return str;
}

export function cn() {
	let i = 0,
		tmp,
		x,
		str = '',
		// eslint-disable-next-line prefer-const
		len = arguments.length;
	for ( ; i < len; i++ ) {
		if ( ( tmp = arguments[ i ] ) ) {
			if ( ( x = toVal( tmp ) ) ) {
				str && ( str += ' ' );
				str += x;
			}
		}
	}
	return str;
}

export function validation( conditions, showToast ) {
	let hasError = false;
	conditions.forEach( ( { condition, message } ) => {
		if ( typeof condition === 'function' ) {
			condition = condition();
		}

		if ( ! condition ) {
			return;
		}
		showToast( message, 'warning', 5000 );
		hasError = true;
	} );
	return ! hasError;
}
