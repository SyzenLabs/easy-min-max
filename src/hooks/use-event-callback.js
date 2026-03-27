import { useRef } from '@wordpress/element';

export function useEventCallback( handler ) {
	const callbackRef = useRef( handler );
	const fn = useRef( ( value ) => {
		callbackRef.current && callbackRef.current( value );
	} );
	callbackRef.current = handler;

	return fn.current;
}
