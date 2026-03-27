import { TimeRangePicker } from '@/components/ui';
import { useMemo } from '@wordpress/element';

function TimeFields( { value, onChange } ) {
	const { fromValue, toValue, timeZoneValue } = useMemo( () => {
		const _val = String( value ?? '' );
		const [ timeRange = '', tz ] = _val.split( '|#|' );
		const [ from = '', to = '' ] = timeRange ? timeRange.split( ',' ) : [];
		return {
			fromValue: from || '',
			toValue: to || '',
			timeZoneValue:
				tz || Intl.DateTimeFormat().resolvedOptions().timeZone,
		};
	}, [ value ] );

	const handleOnChange = ( from, to, tz ) => {
		const timePart = [ from || '', to || '' ].join( ',' );
		onChange( [ timePart, tz ].join( '|#|' ) );
	};

	return (
		<TimeRangePicker
			value={ {
				start: fromValue,
				end: toValue,
				timezone: timeZoneValue,
			} }
			onChange={ ( v ) => handleOnChange( v.start, v.end, v.timezone ) }
			fullWidth
		/>
	);
}

export { TimeFields };
