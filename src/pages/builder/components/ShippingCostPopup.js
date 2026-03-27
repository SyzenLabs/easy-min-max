import { useEventCallback } from '@/hooks/use-event-callback';
import { cn, getCurrencyCode, getFlags } from '@/utils';
import icons from '@/utils/icons';
import { wpConfig } from '@/utils/wpc-config';
import {
    Button,
    __experimentalHStack as HStack,
    Icon,
    __experimentalInputControl as InputControl,
    __experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
    Modal,
    SelectControl,
    __experimentalText as Text,
    __experimentalVStack as VStack,
} from '@wordpress/components';
import { memo, useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

// import './ShippingCostPopup.scss';

// Helper component for rate inputs
const RateInput = memo(
	( { label, value, onValueChange, suffix = getCurrencyCode() } ) => {
		const [ localValue, setLocalValue ] = useState( value );

		// eslint-disable-next-line react-you-might-not-need-an-effect/no-reset-all-state-on-prop-change
		useEffect( () => {
			// eslint-disable-next-line react-you-might-not-need-an-effect/no-derived-state
			setLocalValue( value );
		}, [ value ] );

		const handleChange = ( newValue ) => {
			setLocalValue( newValue );
			onValueChange( newValue );
		};

		const handleBlur = () => {
			// Data is already updated on change, no need to update again
		};

		const handleKeyDown = ( e ) => {
			if ( e.key === 'Enter' ) {
				handleBlur();
			}
		};

		return (
			<InputControl
				className="w-full!"
				__next40pxDefaultSize
				label={ label }
				suffix={
					<InputControlSuffixWrapper>
						{ suffix }
					</InputControlSuffixWrapper>
				}
				type="number"
				value={ localValue }
				onChange={ handleChange }
				onBlur={ handleBlur }
				onKeyDown={ handleKeyDown }
			/>
		);
	}
);

// Reusable component for rate sections
const RateSection = ( {
	type,
	label,
	icon,
	exampleText = '',
	isOpen,
	onToggle,
	children,
} ) => {
	const rateSectionRef = useRef( null );

	return (
		<div
			className={ cn(
				'transition border rounded-(--eamm-border-radius-sm)',
				isOpen
					? 'border-(--wp-admin-theme-color)'
					: 'border-(--eamm-bg-sub)'
			) }
		>
			<button
				className={ cn(
					'w-full text-left cursor-pointer p-3 rounded-t-(--eamm-border-radius-sm) focus:outline-none',
					isOpen &&
						'bg-[color-mix(in_srgb,var(--wp-admin-theme-color)_10%,transparent)]'
				) }
				onClick={ () => onToggle( type ) }
				type="button"
				ref={ rateSectionRef }
				data-type={ type }
			>
				<div className="flex items-center gap-3">
					<span
						aria-hidden="true"
						className={ cn(
							'flex items-center justify-center w-4 h-4 rounded-(--eamm-border-radius-full) border transition-colors',
							{
								'bg-(--wp-admin-theme-color) border-(--wp-admin-theme-color)':
									isOpen,
								'border-[#8c8f94] bg-white': ! isOpen,
							}
						) }
					>
						{ isOpen && (
							<span className="w-2 h-2 bg-white rounded-(--eamm-border-radius-full)" />
						) }
					</span>
					<Icon icon={ icon } className="size-6" />
					<Text size={ wpConfig.size.l }>{ label }</Text>
					<Text
						size={ wpConfig.size.s }
						variant="muted"
						className="ml-auto!"
					>
						{ exampleText }
					</Text>
				</div>
			</button>
			{ isOpen && (
				<div className="p-3 rounded-b-(--eamm-border-radius-sm) ">
					{ children }
				</div>
			) }
		</div>
	);
};

const BasedOnSelector = ( {
	localRate,
	setLocalRate,
	onRateChange,
	optionsData,
	computeBasedOnOptions,
} ) => {
	return (
		<SelectControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			className="w-full!"
			label={ __( 'Based on', 'easy-min-max' ) }
			key={ localRate.basedOn }
			options={ computeBasedOnOptions( localRate, optionsData ) }
			selected={ localRate.basedOn }
			onChange={ ( value ) => {
				const newRate = {
					...localRate,
					basedOn: value,
				};
				setLocalRate( newRate );
				onRateChange( newRate );
			} }
		/>
	);
};

export const ShippingCostPopup = ( {
	rate,
	optionsData,
	onRateChange,
	setOpenPopupId,
} ) => {
	const [ localRate, setLocalRate ] = useState( { ...rate } );
	const [ openSection, setOpenSection ] = useState( rate.type || null );

	// eslint-disable-next-line react-you-might-not-need-an-effect/no-reset-all-state-on-prop-change
	useEffect( () => {
		// eslint-disable-next-line react-you-might-not-need-an-effect/no-derived-state
		setLocalRate( { ...rate } );
		// eslint-disable-next-line react-you-might-not-need-an-effect/no-derived-state
		setOpenSection( rate.type || null );
	}, [ rate ] );

	const handleRateChange = useEventCallback( () => {
		const options = computeBasedOnOptions( localRate, optionsData );
		if (
			options.length > 0 &&
			( ! localRate.basedOn ||
				! options.some( ( o ) => o.value === localRate.basedOn ) )
		) {
			setLocalRate( ( prev ) => ( {
				...prev,
				basedOn: options[ 0 ].value,
			} ) );
			onRateChange( { ...localRate, basedOn: options[ 0 ].value } );
		}
	} );

	useEffect( () => {
		handleRateChange();
	}, [ handleRateChange ] );

	const handleHeaderClick = ( type ) => {
		if ( openSection === type ) {
			return;
		}
		setLocalRate( ( prev ) => ( { ...prev, type } ) );
		setOpenSection( type );
	};

	const computeBasedOnOptions = ( r, opts ) => {
		// add groupvalue:value
		const modifiedOptions = opts.map( ( item ) => {
			return {
				...item,
				children: item.children?.map( ( child ) => ( {
					...child,
					value: `${ item.value }:${ child.value }`,
					unit: child?.inputProps?.unit || '',
					pro: ! getFlags().CONDITION_FREE_OPTIONS.includes(
						child.value
					),
				} ) ),
			};
		} );

		const allOptions = modifiedOptions.flatMap(
			( item ) => item.children || []
		);

		return allOptions
			.filter( ( option ) => option.unit )
			.map( ( option ) => ( {
				label: option.label,
				value: option.value,
				pro: option.pro,
			} ) );
	};

	const getUnitForBasedOn = ( basedOn = localRate.basedOn ) => {
		const allOptions = optionsData.flatMap(
			( item ) => item.children || []
		);
		const option = allOptions.find(
			( o ) => o.value === String( basedOn ).split( ':' )[ 1 ]
		);

		return option?.inputProps?.unit || '';
	};

	const getSummaryText = () => {
		if ( openSection === 'fixed_incremental' ) {
			if ( Number( localRate.firstValue ) === 0 ) {
				return sprintf(
					// translators: 1: initial value, 2: currency, 3: then value, 4: currency, 5: every value, 6: unit.
					__(
						'The customer pays base cost of %1$s %2$s with addition of %3$s %4$s for every %5$s %6$s.',
						'easy-min-max'
					),
					localRate.initialValue,
					getCurrencyCode(),
					localRate.thenValue,
					getCurrencyCode(),
					localRate.everyValue,
					getUnitForBasedOn()
				);
			}
			return sprintf(
				// translators: 1: initial value with currency, 2: unit, 3: first value 4: unit, 5: then value, 6: currency, 7: every value, 8: unit.
				__(
					'The customer pays %1$s %2$s for the first %3$s %4$s, then %5$s %6$s for every additional %7$s %8$s.',
					'easy-min-max'
				),
				localRate.initialValue,
				getCurrencyCode(),
				localRate.firstValue,
				getUnitForBasedOn(),
				localRate.thenValue,
				getCurrencyCode(),
				localRate.everyValue,
				getUnitForBasedOn()
			);
		}

		if ( openSection === 'incremental' ) {
			return sprintf(
				// translators: 1: initial value, 2: currecy code, 3: every value, 4: unit.
				__(
					'The customer pays %1$s %2$s for every %3$s %4$s.',
					'easy-min-max'
				),
				localRate.initialValue,
				getCurrencyCode(),
				localRate.everyValue,
				getUnitForBasedOn()
			);
		}

		return '';
	};

	const content = (
		<VStack spacing={ 6 }>
			<VStack spacing={ 3 }>
				<RateSection
					type="fixed"
					label={ __( 'Fixed Rate', 'easy-min-max' ) }
					icon={ icons.equal }
					isOpen={ openSection === 'fixed' }
					onToggle={ handleHeaderClick }
				>
					<RateInput
						label={ __( 'Cost', 'easy-min-max' ) }
						suffix={ getCurrencyCode() }
						value={ localRate.initialValue }
						onValueChange={ ( value ) =>
							setLocalRate( ( prev ) => ( {
								...prev,
								initialValue: value,
							} ) )
						}
					/>
				</RateSection>
				<RateSection
					type="incremental"
					label={ __(
						'Incremental Rate',
						'easy-min-max'
					) }
					icon={ icons.grow }
					isOpen={ openSection === 'incremental' }
					onToggle={ handleHeaderClick }
				>
					<HStack spacing={ 3 }>
						<BasedOnSelector
							localRate={ localRate }
							setLocalRate={ setLocalRate }
							onRateChange={ onRateChange }
							optionsData={ optionsData }
							computeBasedOnOptions={ computeBasedOnOptions }
						/>
						<RateInput
							label={ __( 'Cost', 'easy-min-max' ) }
							suffix={ getCurrencyCode() }
							value={ localRate.initialValue }
							onValueChange={ ( value ) =>
								setLocalRate( ( prev ) => ( {
									...prev,
									initialValue: value,
								} ) )
							}
						/>
						<RateInput
							label={ __(
								'For Every',
								'easy-min-max'
							) }
							suffix={ getUnitForBasedOn() }
							value={ localRate.everyValue }
							onValueChange={ ( value ) =>
								setLocalRate( ( prev ) => ( {
									...prev,
									everyValue: value,
								} ) )
							}
						/>
					</HStack>
					<SummaryText>{ getSummaryText() }</SummaryText>
				</RateSection>
				<RateSection
					type="fixed_incremental"
					label={ __(
						'Base Cost + Additional Charge',
						'easy-min-max'
					) }
					icon={ icons[ 'grow-equal' ] }
					isOpen={ openSection === 'fixed_incremental' }
					onToggle={ handleHeaderClick }
				>
					<VStack spacing={ 6 }>
						<HStack spacing={ 6 }>
							<BasedOnSelector
								localRate={ localRate }
								setLocalRate={ setLocalRate }
								onRateChange={ onRateChange }
								optionsData={ optionsData }
								computeBasedOnOptions={ computeBasedOnOptions }
							/>
							<RateInput
								label={ __(
									'Base Cost',
									'easy-min-max'
								) }
								suffix={ getCurrencyCode() }
								value={ localRate.initialValue }
								onValueChange={ ( value ) =>
									setLocalRate( ( prev ) => ( {
										...prev,
										initialValue: value,
									} ) )
								}
							/>
							<RateInput
								label={ __(
									'For the First',
									'easy-min-max'
								) }
								suffix={ getUnitForBasedOn() }
								value={ localRate.firstValue }
								onValueChange={ ( value ) =>
									setLocalRate( ( prev ) => ( {
										...prev,
										firstValue: value,
									} ) )
								}
							/>
						</HStack>
						<HStack spacing={ 6 }>
							<RateInput
								label={ __(
									'Then',
									'easy-min-max'
								) }
								suffix={ getCurrencyCode() }
								value={ localRate.thenValue }
								onValueChange={ ( value ) =>
									setLocalRate( ( prev ) => ( {
										...prev,
										thenValue: value,
									} ) )
								}
							/>
							<RateInput
								label={ __(
									'For Every Additional',
									'easy-min-max'
								) }
								suffix={ getUnitForBasedOn() }
								value={ localRate.everyValue }
								onValueChange={ ( value ) =>
									setLocalRate( ( prev ) => ( {
										...prev,
										everyValue: value,
									} ) )
								}
							/>
						</HStack>
					</VStack>
					<SummaryText>{ getSummaryText() }</SummaryText>
				</RateSection>
			</VStack>
			<HStack justify="end">
				<Button
					__next40pxDefaultSize
					variant="secondary"
					onClick={ () => setOpenPopupId( null ) }
				>
					{ __( 'Cancel', 'easy-min-max' ) }
				</Button>

				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ () => {
						onRateChange( localRate );
						setOpenPopupId( null );
					} }
				>
					{ __( 'Save', 'easy-min-max' ) }
				</Button>
			</HStack>
		</VStack>
	);

	return (
		<Modal
			title={ __( 'Define Shipping Cost', 'easy-min-max' ) }
			onRequestClose={ () => {
				setOpenPopupId( null );
			} }
			size="large"
		>
			{ content }
		</Modal>
	);
};

function SummaryText( { children } ) {
	return (
		<Text
			as="p"
			className="p-4 mt-3! rounded-(--eamm-border-radius-xs) bg-[color-mix(in_srgb,var(--wp-admin-theme-color)_10%,transparent)]"
		>
			<strong>{ __( 'Summary:', 'easy-min-max' ) }</strong>{ ' ' }
			{ children }
		</Text>
	);
}
