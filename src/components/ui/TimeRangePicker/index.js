import { SelectCompact } from '@/components/ui';
import { TIMEZONES } from '@/utils/constants';
import { __ } from '@wordpress/i18n';

import {
    Button,
    Dropdown,
    __experimentalHStack as HStack,
    Icon,
    __experimentalInputControl as InputControl,
    __experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
    __experimentalVStack as VStack,
} from '@wordpress/components';
import { chevronDown, chevronUp } from '@wordpress/icons';

import { useCallback, useState } from '@wordpress/element';

// format HH:mm or HH:mm:ss to h:mm AM/PM for label
const formatTime12h = ( t ) => {
	if ( ! t ) {
		return '--:--';
	}
	const parts = t.split( ':' );
	let h = parseInt( parts[ 0 ] || '0', 10 );
	const m = parts[ 1 ] ?? '00';
	const suffix = h >= 12 ? 'PM' : 'AM';
	h = h % 12;
	if ( h === 0 ) {
		h = 12;
	}
	return `${ h }:${ m.padStart( 2, '0' ) } ${ suffix }`;
};

export function TimeRangePicker( {
	value,
	defaultValue,
	onChange,
	step = 60,
	disabled = false,
	showTimezone = true,
	startPlaceholder = __( 'Start time', 'syzenlabs-quantity-limits' ),
	endPlaceholder = __( 'End time', 'syzenlabs-quantity-limits' ),
	timezonePlaceholder = __( 'Select timezone…', 'syzenlabs-quantity-limits' ),
} ) {
	const isControlled = value !== undefined;
	const [ internal, setInternal ] = useState( () => ( {
		start: defaultValue?.start || '',
		end: defaultValue?.end || '',
		timezone: defaultValue?.timezone || '',
	} ) );

	// dropdown state and draft values
	const [ draft, setDraft ] = useState( () => ( {
		start: internal.start,
		end: internal.end,
		timezone: internal.timezone,
	} ) );

	let current;
	if ( isControlled ) {
		current = {
			start: value?.start || '',
			end: value?.end || '',
			timezone: value?.timezone || '',
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

	// open/close and draft handlers
	const prepareDraft = () => {
		setDraft( {
			start: current.start,
			end: current.end,
			timezone: current.timezone,
		} );
	};

	const handleStartChange = ( v ) =>
		setDraft( ( d ) => ( { ...d, start: v } ) );
	const handleEndChange = ( v ) => setDraft( ( d ) => ( { ...d, end: v } ) );
	const handleTzChange = ( tz ) =>
		setDraft( ( d ) => ( { ...d, timezone: tz } ) );
	const commit = useCallback( () => {
		const next = { ...current, ...draft };
		update( next );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		current.start,
		current.end,
		current.timezone,
		draft.start,
		draft.end,
		draft.timezone,
	] );

	const label = () => {
		if ( ! current.start && ! current.end ) {
			return __( 'Select time range…', 'syzenlabs-quantity-limits' );
		}
		const base = `${ formatTime12h( current.start ) } - ${ formatTime12h(
			current.end
		) }`;
		return current.timezone ? `${ base } (${ current.timezone })` : base;
	};

	return (
		<Dropdown
			className="w-full!"
			popoverProps={ { placement: 'bottom-start' } }
			renderToggle={ ( { isOpen, onToggle } ) => {
				const labelContent = label();

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
						label={ labelContent }
						showTooltip
					>
						<InputControl
							__next40pxDefaultSize
							className="w-full!"
							readOnly
							value={ labelContent }
							suffix={
								<InputControlSuffixWrapper>
									<Icon
										icon={
											isOpen ? chevronUp : chevronDown
										}
									/>
								</InputControlSuffixWrapper>
							}
						/>
					</Button>
				);
			} }
			renderContent={ ( { onClose } ) => (
				<VStack spacing={ 4 } className="min-w-62.5">
					<HStack spacing={ 4 }>
						<InputControl
							__next40pxDefaultSize
							label={ __(
								'Start Time',
								'syzenlabs-quantity-limits'
							) }
							type="time"
							value={ draft.start || '' }
							onChange={ handleStartChange }
							disabled={ disabled }
							step={ step }
							placeholder={ startPlaceholder }
						/>
						<InputControl
							__next40pxDefaultSize
							label={ __(
								'End Time',
								'syzenlabs-quantity-limits'
							) }
							type="time"
							value={ draft.end || '' }
							onChange={ handleEndChange }
							disabled={ disabled }
							step={ step }
							placeholder={ endPlaceholder }
						/>
					</HStack>

					{ showTimezone && (
						<SelectCompact
							search={ true }
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
					) }
					<HStack justify="flex-end">
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ () => {
								commit();
								onClose();
							} }
						>
							{ __( 'Save', 'syzenlabs-quantity-limits' ) }
						</Button>
					</HStack>
				</VStack>
			) }
		/>
	);
}
