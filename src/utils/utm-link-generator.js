const configObj = {
	example: {
		source: 'db-wowshipping-featurename', // feature location
		medium: 'block-feature', // feature name
		campaign: 'wowshipping-dashboard', // Plugin Identifier
	},
	// eslint-disable-next-line camelcase
	db_hellobar: {
		source: 'db-wowshipping-hellobar', // feature location
		medium: 'new-year-sale', // feature name
		campaign: 'wowshipping-dashboard', // Plugin Identifier
	},
};

const DEFAULT_URL = 'https://www.wpxpo.com/table-rate-shipping-for-woocommerce';

/**
 * @typedef {Object} UTMLinkGeneratorParams
 * @property {string}  utmKey    - UTM Key to use.
 * @property {string?} url       - URL to generate UTM link for (Optional).
 * @property {string?} affiliate - Affiliate ID to use (Optional).
 * @property {string?} hash      - Hash to use (Optional).
 */

/**
 *
 * @param {UTMLinkGeneratorParams} params - Parameters for UTM link generation.
 * @return {string} link with UTM parameters.
 */
const UTMLinkGenerator = ( params ) => {
	const { url, utmKey, affiliate, hash } = params;

	const baseUrl = new URL( url || DEFAULT_URL );

	const utmConfig = configObj[ utmKey ];

	if ( utmConfig ) {
		baseUrl.searchParams.set( 'utm_source', utmConfig.source );
		baseUrl.searchParams.set( 'utm_medium', utmConfig.medium );
		baseUrl.searchParams.set( 'utm_campaign', utmConfig.campaign );
	}

	if ( affiliate ) {
		baseUrl.searchParams.set( 'ref', affiliate );
	}

	if ( hash ) {
		baseUrl.hash = hash.startsWith( '#' ) ? hash : `#${ hash }`;
	} else {
		baseUrl.hash = '#pricing';
	}

	return baseUrl.toString();
};

export default UTMLinkGenerator;
