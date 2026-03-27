import { MultiSelect, SelectCompact } from '@/components/ui';
import { cn } from '@/utils';
import { DAYS_OF_WEEK, TIMEZONES } from '@/utils/constants';
import {
    Button,
    Dropdown,
    __experimentalHStack as HStack,
    Icon,
    __experimentalVStack as VStack,
} from '@wordpress/components';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';

export function WeekdayPicker( {
	value,
	defaultValue,
	onChange,
	disabled = false,
	weekdayPlaceholder = __( 'Select Weekdays', 'easy-min-max' ),
	timezonePlaceholder = __( 'Select Timezone', 'easy-min-max' ),
} ) {
	const isControlled = value !== undefined;
	const [ internal, setInternal ] = useState( () => ( {
		weekdays: defaultValue?.weekdays || [],
		timezone:
			defaultValue?.timezone ||
			Intl.DateTimeFormat().resolvedOptions().timeZone,
	} ) );

	let current;
	if ( isControlled ) {
		current = {
			weekdays: value?.weekdays || [],
			timezone:
				value?.timezone ||
				Intl.DateTimeFormat().resolvedOptions().timeZone,
		};
	} else {
		current = internal;
	}

	const update = ( next ) => {
		if ( ! isControlled ) {
			setInternal( next );
		}
		onChange?.( next );
	};

	// dropdown state + draft
	const [ draft, setDraft ] = useState( () => ( {
		weekdays: current.weekdays,
		timezone: current.timezone,
	} ) );

	const prepareDraft = () => {
		setDraft( { weekdays: current.weekdays, timezone: current.timezone } );
	};

	const handleWeekdaysChange = ( list ) =>
		setDraft( ( d ) => ( { ...d, weekdays: list } ) );
	const handleTzChange = ( tz ) =>
		setDraft( ( d ) => ( { ...d, timezone: tz } ) );

	const commit = useCallback( () => {
		update( { ...current, ...draft } );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ current.weekdays, current.timezone, draft.weekdays, draft.timezone ] );

	const isAllSelected = current.weekdays.includes( 'all' );

	return (
		<Dropdown
			className="w-full!"
			popoverProps={ { placement: 'bottom-start' } }
			renderToggle={ ( { isOpen, onToggle } ) => {
				return (
					<Button
						__next40pxDefaultSize
						className="w-full! p-0!"
						onClick={ () => {
							if ( ! isOpen ) {
								prepareDraft();
							}
							onToggle();
						} }
					>
						<HStack
							justify="space-between"
							className="h-full px-3 min-h-40px"
							style={ {
								backgroundColor:
									'var(--wp-components-color-background, #fff)',
								border: '1px solid var(--wp-components-color-gray-600, #949494)',
							} }
						>
							<HStack align="center">
								<HStack spacing={ 0.5 }>
									{ DAYS_OF_WEEK.map( ( d ) => {
										const abbr = String( d.label )
											.slice( 0, 2 )
											.toUpperCase();
										const selected =
											isAllSelected ||
											current.weekdays.includes(
												d.value
											);
										return (
											<span
												key={ d.value }
												className={ cn( 'font-mono', {
													'text-(--wp-admin-theme-color)':
														selected,
													'text-slate-400':
														! selected,
												} ) }
											>
												{ abbr }
											</span>
										);
									} ) }
								</HStack>
							</HStack>
							<Icon icon={ isOpen ? chevronUp : chevronDown } />
						</HStack>
					</Button>
				);
			} }
			renderContent={ ( { onClose } ) => (
				<VStack spacing={ 4 } className="min-w-62.5">
					<MultiSelect
						selected={ draft.weekdays }
						fullWidth
						selectAll={ true }
						options={ DAYS_OF_WEEK }
						placeholder={ weekdayPlaceholder }
						onChange={ handleWeekdaysChange }
					/>
					<SelectCompact
						selected={ draft.timezone }
						onChange={ handleTzChange }
						disabled={ disabled }
						fullWidth
						placeholder={ timezonePlaceholder }
						options={ TIMEZONES?.map( ( tz ) => ( {
							label: tz,
							value: tz,
						} ) ) }
					/>
					<HStack justify="flex-end">
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ () => {
								commit();
								onClose();
							} }
						>
							{ __( 'Save', 'easy-min-max' ) }
						</Button>
					</HStack>
				</VStack>
			) }
		/>
	);
}
