import './style.scss';

const settings = window.syzeqlSettings || {};
const quantitySelector = 'input.qty, select.qty, select.syzeql-qty-select';
const contextState = new WeakMap();

const parseNumber = ( value ) => {
	if ( value === null || value === undefined || value === '' ) {
		return null;
	}

	const parsedValue = Number.parseFloat( value );

	return Number.isFinite( parsedValue ) ? parsedValue : null;
};

const sanitizeStep = ( value ) => {
	const step = parseNumber( value );

	return step && step > 0 ? step : 1;
};

const getQuantityField = ( context ) =>
	context?.querySelector( quantitySelector ) || null;

const getContext = ( element ) => {
	if ( ! element ) {
		return null;
	}

	return (
		element.closest( 'form.cart' ) ||
		element.closest( '.product' ) ||
		element.closest( '.woocommerce' ) ||
		document
	);
};

const getTotalElement = ( context ) =>
	context?.querySelector( '.syzeql-total-price' ) || null;

const captureSelectOptions = ( field ) => {
	if ( ! field || field.tagName !== 'SELECT' ) {
		return [];
	}

	return Array.from( field.options ).map( ( option ) => ( {
		value: option.value,
		label: option.textContent,
	} ) );
};

const captureLimits = ( field ) => ( {
	minQty: parseNumber( field?.getAttribute( 'min' ) ),
	maxQty: parseNumber( field?.getAttribute( 'max' ) ),
	stepQty: sanitizeStep( field?.getAttribute( 'step' ) ),
	initialQty: parseNumber( field?.value ),
	dropdownValues:
		field?.tagName === 'SELECT'
			? captureSelectOptions( field ).map( ( option ) => option.value )
			: [],
} );

const getState = ( context ) => {
	if ( ! contextState.has( context ) ) {
		const field = getQuantityField( context );
		const totalElement = getTotalElement( context );

		contextState.set( context, {
			defaultLimits: field ? captureLimits( field ) : null,
			defaultOptions: captureSelectOptions( field ),
			defaultPrice: parseNumber( totalElement?.dataset.price ),
			activePrice: parseNumber( totalElement?.dataset.price ),
		} );
	}

	return contextState.get( context );
};

const roundToStep = ( value, minQty, stepQty ) => {
	const safeStep = sanitizeStep( stepQty );
	const baseValue = minQty ?? 0;
	const steppedValue =
		baseValue + Math.round( ( value - baseValue ) / safeStep ) * safeStep;

	return Number( steppedValue.toFixed( 5 ) );
};

const normalizeQuantity = ( value, limits ) => {
	let nextValue = parseNumber( value );
	const minQty = parseNumber( limits?.minQty );
	const maxQty = parseNumber( limits?.maxQty );
	const initialQty = parseNumber( limits?.initialQty );
	const stepQty = sanitizeStep( limits?.stepQty );

	if ( nextValue === null ) {
		nextValue = initialQty ?? minQty ?? stepQty;
	}

	if ( minQty !== null && nextValue < minQty ) {
		nextValue = minQty;
	}

	if ( maxQty !== null && nextValue > maxQty ) {
		nextValue = maxQty;
	}

	nextValue = roundToStep( nextValue, minQty, stepQty );

	if ( minQty !== null && nextValue < minQty ) {
		nextValue = minQty;
	}

	if ( maxQty !== null && nextValue > maxQty ) {
		nextValue = maxQty;
	}

	return Number( nextValue.toFixed( 5 ) );
};

const buildRangeValues = ( limits ) => {
	const minQty = parseNumber( limits?.minQty );
	const maxQty = parseNumber( limits?.maxQty );
	const stepQty = sanitizeStep( limits?.stepQty );

	if ( minQty === null || maxQty === null || maxQty < minQty ) {
		return [];
	}

	const values = [];
	for ( let qty = minQty; qty <= maxQty + 0.00001; qty += stepQty ) {
		values.push( Number( qty.toFixed( 5 ) ).toString() );

		if ( values.length >= 200 ) {
			break;
		}
	}

	return values;
};

const normalizeDropdownValues = ( values ) => {
	if ( ! Array.isArray( values ) ) {
		return [];
	}

	return Array.from(
		new Set(
			values
				.map( ( value ) => parseNumber( value ) )
				.filter( ( value ) => value !== null )
				.map( ( value ) => Number( value.toFixed( 5 ) ).toString() )
		)
	);
};

const syncInputLimits = ( field, limits ) => {
	const minQty = parseNumber( limits?.minQty );
	const maxQty = parseNumber( limits?.maxQty );
	const stepQty = sanitizeStep( limits?.stepQty );
	const nextValue = normalizeQuantity( field.value, limits );

	if ( minQty !== null ) {
		field.setAttribute( 'min', String( minQty ) );
	} else {
		field.removeAttribute( 'min' );
	}

	if ( maxQty !== null ) {
		field.setAttribute( 'max', String( maxQty ) );
	} else {
		field.removeAttribute( 'max' );
	}

	field.setAttribute( 'step', String( stepQty ) );

	if ( String( field.value ) !== String( nextValue ) ) {
		field.value = String( nextValue );
	}
};

const syncSelectOptions = ( field, limits, state ) => {
	const currentValue = String( field.value || '' );
	const normalizedOptions = normalizeDropdownValues( limits?.dropdownValues );
	const fallbackOptions = state.defaultOptions.map(
		( option ) => option.value
	);
	const optionValues = normalizedOptions.length
		? normalizedOptions
		: buildRangeValues( limits ).length
		? buildRangeValues( limits )
		: fallbackOptions;
	const preferredValue = String( normalizeQuantity( currentValue, limits ) );

	field.innerHTML = optionValues
		.map( ( value ) => `<option value="${ value }">${ value }</option>` )
		.join( '' );

	field.value = optionValues.includes( currentValue )
		? currentValue
		: optionValues.includes( preferredValue )
		? preferredValue
		: optionValues[ 0 ] || '';
};

const formatAmount = ( amount ) => {
	const currency = settings.currency || {};
	const decimals = Number.isInteger( currency.decimals )
		? currency.decimals
		: 2;
	const decimalSeparator = currency.decimalSeparator || '.';
	const thousandSeparator = currency.thousandSeparator || ',';
	const format = currency.format || '%1$s%2$s';
	let formattedAmount = Number( amount || 0 ).toFixed( decimals );

	if ( currency.trimZeros && decimals > 0 ) {
		formattedAmount = formattedAmount
			.replace( /(\.[0-9]*?)0+$/, '$1' )
			.replace( /\.$/, '' );
	}

	const parts = formattedAmount.split( '.' );
	parts[ 0 ] = parts[ 0 ].replace(
		/\B(?=(\d{3})+(?!\d))/g,
		thousandSeparator
	);
	formattedAmount = parts.join( parts[ 1 ] ? decimalSeparator : '' );

	return format
		.replace( '%1$s', currency.symbol || '' )
		.replace( '%2$s', formattedAmount );
};

const updateTotalPrice = ( context ) => {
	const totalElement = getTotalElement( context );

	if ( ! totalElement || settings.totalPriceEnabled === false ) {
		return;
	}

	const quantityField = getQuantityField( context );
	const quantity = parseNumber( quantityField?.value );
	const state = getState( context );
	const activePrice = parseNumber( state.activePrice ?? state.defaultPrice );

	if ( quantity === null || activePrice === null ) {
		totalElement.hidden = true;
		return;
	}

	totalElement.hidden = false;
	totalElement.textContent = `${
		settings.i18n?.totalLabel || 'Total:'
	} ${ formatAmount( quantity * activePrice ) }`;
};

const applyLimits = ( context, limits ) => {
	const field = getQuantityField( context );

	if ( ! field || ! limits ) {
		return;
	}

	const state = getState( context );

	if ( field.tagName === 'SELECT' ) {
		syncSelectOptions( field, limits, state );
	} else {
		syncInputLimits( field, limits );
	}

	updateTotalPrice( context );
	field.dispatchEvent( new Event( 'change', { bubbles: true } ) );
};

const updateActivePrice = ( context, price ) => {
	const state = getState( context );
	state.activePrice = parseNumber( price ) ?? state.defaultPrice;
	updateTotalPrice( context );
};

const resetContext = ( context ) => {
	const state = getState( context );

	if ( ! state.defaultLimits ) {
		return;
	}

	applyLimits( context, state.defaultLimits );
	updateActivePrice( context, state.defaultPrice );
};

const bindVariationEvents = () => {
	if ( ! window.jQuery ) {
		return;
	}

	window.jQuery( '.variations_form' ).each( ( index, formElement ) => {
		const variationForm = window.jQuery( formElement );
		const context = getContext( formElement );

		getState( context );

		variationForm.on( 'found_variation.syzeql', ( event, variation ) => {
			applyLimits( context, {
				minQty: variation?.syzeql_min_qty,
				maxQty: variation?.syzeql_max_qty,
				stepQty: variation?.syzeql_step_qty,
				initialQty: variation?.syzeql_initial_qty,
				dropdownValues: variation?.syzeql_dropdown_values,
			} );

			if (
				variation &&
				Object.prototype.hasOwnProperty.call(
					variation,
					'display_price'
				)
			) {
				updateActivePrice( context, variation.display_price );
			}
		} );

		variationForm.on( 'reset_data.syzeql hide_variation.syzeql', () => {
			resetContext( context );
		} );
	} );
};

const initContext = ( context ) => {
	if ( ! context ) {
		return;
	}

	getState( context );
	updateTotalPrice( context );
};

const init = () => {
	document.querySelectorAll( quantitySelector ).forEach( ( field ) => {
		initContext( getContext( field ) );
	} );

	document.querySelectorAll( '.syzeql-total-price' ).forEach( ( element ) => {
		initContext( getContext( element ) );
	} );

	document.addEventListener( 'input', ( event ) => {
		if ( ! event.target.matches( quantitySelector ) ) {
			return;
		}

		updateTotalPrice( getContext( event.target ) );
	} );

	document.addEventListener( 'change', ( event ) => {
		if ( ! event.target.matches( quantitySelector ) ) {
			return;
		}

		updateTotalPrice( getContext( event.target ) );
	} );

	bindVariationEvents();
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
