import { __, sprintf } from '@wordpress/i18n';
// import './style.scss';

export function newUserTour() {
	const STORAGE_KEY = 'szql_shipping_rules_nux_tour';
	const JS_SRC =
		'https://cdn.jsdelivr.net/npm/driver.js@latest/dist/driver.js.iife.js';
	const CSS_HREF =
		'https://cdn.jsdelivr.net/npm/driver.js@latest/dist/driver.css';

	if ( typeof window === 'undefined' || typeof document === 'undefined' ) {
		return;
	}

	if (
		window.localStorage &&
		localStorage.getItem( STORAGE_KEY ) === 'yes'
	) {
		return;
	}

	const getDriver = () => window?.driver?.js?.driver;

	const markTourComplete = () => {
		localStorage.setItem( STORAGE_KEY, 'yes' );
	};

	const ensureAssets = () =>
		new Promise( ( resolve, reject ) => {
			// Ensure CSS
			if ( ! document.querySelector( `link[href="${ CSS_HREF }"]` ) ) {
				const link = document.createElement( 'link' );
				link.rel = 'stylesheet';
				link.href = CSS_HREF;
				link.id = 'szql-driver-css';
				document.head.appendChild( link );
			}

			// If driver already present, resolve immediately
			if ( getDriver() ) {
				resolve();
				return;
			}

			// Ensure JS
			let script = document.querySelector( `script[src="${ JS_SRC }"]` );
			if ( ! script ) {
				script = document.createElement( 'script' );
				script.src = JS_SRC;
				script.async = true;
				script.defer = true;
				script.id = 'szql-driver-js';
				document.head.appendChild( script );
			}

			const onLoad = () => resolve();
			const onError = () =>
				reject( new Error( 'Failed to load driver.js' ) );

			// If script is already loaded (from cache), resolve on next tick
			if (
				script &&
				( script.readyState === 'complete' ||
					script.readyState === 'loaded' )
			) {
				resolve();
			} else {
				script.addEventListener( 'load', onLoad, { once: true } );
				script.addEventListener( 'error', onError, { once: true } );
			}
		} );

	const startTour = () => {
		const driver = getDriver();

		if ( ! driver ) {
			return;
		}

		const steps = [
			// Intro modal (no element) asking user if they want the tour
			{
				popover: {
					title: __(
						'Create your first Shipping Rule with WowShipping',
						'syzenlabs-quantity-limits'
					),
					description: __(
						'Take a quick guided tour to learn how to configure a shipping rule. Click Start to continue or Close to skip.',
						'syzenlabs-quantity-limits'
					),
					showButtons: [ 'next', 'close' ],
					nextBtnText: __( 'Start', 'syzenlabs-quantity-limits' ),
					popoverClass:
						'szql-driver-popover szql-driver-popover-intro',
					onCloseClick: ( el, step, opts ) => {
						markTourComplete();
						opts.driver.destroy();
					},
					onNextClick: ( el, step, opts ) => {
						opts.driver.moveNext();
					},
				},
			},
			{
				element: '#szql-shipping-zone-section',
				popover: {
					title: __( 'Add Shipping Zone', 'syzenlabs-quantity-limits' ),
					description: __(
						'Set your targeted zone for this shipping rule. You can either select an existing shipping zone or create a new one.',
						'syzenlabs-quantity-limits'
					),
					side: 'bottom',
					align: 'start',
				},
			},
			{
				element: '#szql-shipping-method-section',
				popover: {
					title: __(
						'Customized Shipping Method',
						'syzenlabs-quantity-limits'
					),
					description: __(
						'Create shipping methods using manual calculations or integrations with shipping carriers to streamline your shipping process. The manual calculation option allows you to select from flexible shipping, flat rate shipping, and free shipping.',
						'syzenlabs-quantity-limits'
					),
					side: 'bottom',
					align: 'start',
				},
			},
			{
				element: '#szql-shipping-method-rates-section-flexible',
				popover: {
					title: __(
						'Define Shipping Cost',
						'syzenlabs-quantity-limits'
					),
					description: __(
						'Based on your shipping type selection, you can set conditions and adjust shipping rates accordingly. For example, if you select flexible, you can set shipping rates based on specific or multiple conditions in table formats.',
						'syzenlabs-quantity-limits'
					),
					side: 'top',
					align: 'start',
				},
			},
			{
				element: '#szql-additional-settings-section',
				popover: {
					title: __(
						'Additional Setting',
						'syzenlabs-quantity-limits'
					),
					description: __(
						'Make additional configurations, including shipping tax and determining to whom this rule should be visible, between logged-in and logged-out users.',
						'syzenlabs-quantity-limits'
					),
					side: 'top',
					align: 'start',
				},
			},
			{
				element: '#szql-publish-section',
				popover: {
					title: __( 'Publish or Draft', 'syzenlabs-quantity-limits' ),
					description: __(
						"Once you're done with the configuration, you can publish the shipping rule to make it available for the shoppers. Alternatively, you can save it as a draft to continue the configuration at a later time.",
						'syzenlabs-quantity-limits'
					),
					side: 'bottom',
					align: 'end',
				},
			},
		];

		const tour = driver( {
			steps,
			showProgress: true,
			allowClose: true,
			smoothScroll: true,
			animate: true,
			popoverClass: 'szql-driver-popover',
			progressText: sprintf(
				/* translators: 1: current step number placeholder, 2: total steps placeholder */
				__( 'Step %1$s of %2$s', 'syzenlabs-quantity-limits' ),
				'{{current}}',
				'{{total}}'
			),
			nextBtnText: __( 'Next', 'syzenlabs-quantity-limits' ),
			prevBtnText: __( 'Back', 'syzenlabs-quantity-limits' ),
			doneBtnText: __( 'Done', 'syzenlabs-quantity-limits' ),
			onDestroyed: markTourComplete,
			onCloseClick: markTourComplete,
		} );
		tour.drive();
	};

	// Load assets then start tour (intro step handles opt-in)
	ensureAssets()
		.then( () => {
			if ( document.readyState === 'loading' ) {
				document.addEventListener( 'DOMContentLoaded', startTour, {
					once: true,
				} );
			} else {
				startTour();
			}
		} )
		.catch( () => {
			// Fail quietly if CDN blocked/unavailable
		} );
}
