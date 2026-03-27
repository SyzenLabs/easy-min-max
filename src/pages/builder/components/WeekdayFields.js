import { WeekdayPicker } from '@/components/ui';
import { useCallback, useMemo } from '@wordpress/element';

function WeekdayFields( { value, onChange } ) {
	const { weekdaysValue, timeZoneValue } = useMemo( () => {
		const _val = String( value ?? '' );
		const [ wd, tz ] = _val.split( '|#|' );
		return {
			weekdaysValue: wd ? wd.split( ',' ) : [],
			timeZoneValue:
				tz || Intl.DateTimeFormat().resolvedOptions().timeZone,
		};
	}, [ value ] );

	const handleOnChange = useCallback(
		( { weekdays, timezone } ) => {
			onChange( [ weekdays.join( ',' ), timezone ].join( '|#|' ) );
		},
		[ onChange ]
	);

	return (
		<WeekdayPicker
			fullWidth
			value={ { weekdays: weekdaysValue, timezone: timeZoneValue } }
			onChange={ handleOnChange }
		/>
	);
}

export { WeekdayFields };
