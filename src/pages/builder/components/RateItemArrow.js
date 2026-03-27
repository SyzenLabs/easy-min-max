import { useEffect, useState } from '@wordpress/element';
import { isRTL } from '@wordpress/i18n';

// Note: This could be mor accurate by measuring the actual DOM elements,
// but for simplicity, we use fixed values based on breakpoints.
// otherwise we need prop drilling.
const gapFromRowFirstItemsMap = {
	'after 1280': 569,
	'after 1150': 537,
	'after 1000': 450,
	'after 900': 400,
	'after 768': 359,
};

const gapThresholds = Object.keys( gapFromRowFirstItemsMap )
	.map( ( key ) => parseInt( key.split( ' ' )[ 1 ] ) )
	.sort( ( a, b ) => b - a );

const getGapFromWidth = ( width ) => {
	for ( const threshold of gapThresholds ) {
		if ( width >= threshold ) {
			return gapFromRowFirstItemsMap[ `after ${ threshold }` ];
		}
	}

	return gapFromRowFirstItemsMap[
		`after ${ gapThresholds[ gapThresholds.length - 1 ] }`
	];
};

const RateItemArrow = ( { rate, className = '' } ) => {
	const rtl = typeof isRTL === 'function' ? isRTL() : !! isRTL;

	const baseHeight = 30;
	const conditionGroupLength = rate?.conditions?.length || 0;
	const additionalHeight = Math.max( 0, conditionGroupLength - 1 ) * 80;
	const totalHeight = baseHeight + additionalHeight;

	const gapBetweenItems = 32;
	const [ gapFromRowFirstItems, setGapFromRowFirstItems ] = useState( () => {
		if ( typeof window === 'undefined' ) {
			return 537;
		}

		return getGapFromWidth( window.innerWidth );
	} );

	useEffect( () => {
		const updateGap = () => {
			setGapFromRowFirstItems( getGapFromWidth( window.innerWidth ) );
		};

		window.addEventListener( 'resize', updateGap );

		return () => window.removeEventListener( 'resize', updateGap );
	}, [] );

	const baseWidth = gapFromRowFirstItems + gapBetweenItems;

	const getItemWidth = ( index ) => {
		const selectedConditions =
			rate?.conditions?.find( ( c, idx ) => idx === index ) || {};
		const isAlways = selectedConditions?.field === 'always' ? true : false;

		return isAlways ? gapFromRowFirstItems : gapBetweenItems;
	};

	const pathCommonProps = {
		stroke: '#99A0AE',
		strokeWidth: 1,
		fill: 'none',
	};

	const generatePaths = () => {
		const paths = [];

		paths.push(
			<path
				key="arrow-head"
				{ ...pathCommonProps }
				d={ `M${ baseWidth - 5 } 5 q 0 0 5 5 q 0 0 -5 5` }
			/>
		);

		paths.push(
			<path
				key="horizontal-connector"
				{ ...pathCommonProps }
				d={ `M${ baseWidth } 10 h-${ getItemWidth( 0 ) }` }
			/>
		);

		for ( let i = 1; i < conditionGroupLength; i++ ) {
			if ( i === 1 ) {
				paths.push(
					<path
						key="connector-1"
						{ ...pathCommonProps }
						d={ `M${
							baseWidth - 5
						} 10 q -10 0 -10 10 v60 q 0 10 -10 10 h-${
							getItemWidth( 1 ) - 25
						}` }
					/>
				);
			} else {
				const startY = 80 + ( i - 2 ) * 80;
				paths.push(
					<path
						key={ `connector-${ i }` }
						{ ...pathCommonProps }
						d={ `M${
							baseWidth - 15
						} ${ startY } v80 q 0 10 -10 10 h-${
							getItemWidth( i ) - 25
						}` }
					/>
				);
			}
		}

		return paths;
	};

	return (
		<svg
			width={ baseWidth }
			height={ totalHeight }
			className={ `${ className }` }
		>
			<g
				transform={
					rtl ? `translate(${ baseWidth } 0) scale(-1 1)` : undefined
				}
			>
				{ generatePaths() }
			</g>
		</svg>
	);
};

export default RateItemArrow;
