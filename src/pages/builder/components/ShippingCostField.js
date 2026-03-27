import { cn, getCurrencySymbol } from '@/utils';
import { wpConfig } from '@/utils/wpc-config';
import {
    Button,
    Icon,
    __experimentalText as Text,
} from '@wordpress/components';
import { useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import RateItemArrow from './RateItemArrow';
import { ShippingCostPopup } from './ShippingCostPopup';

const ShippingCostField = ( {
	rate,
	isFree,
	openPopupId,
	setOpenPopupId,
	optionsData,
	onRateChange,
	onRemoveRate,
	rateIndex,
	totalRates,
	onCopyRate,
} ) => {
	const getUnitForRate = ( r ) => {
		let effectiveBasedOn = String( r.basedOn ).split( ':' )[ 1 ];
		if ( ! effectiveBasedOn && r.conditions && r.conditions.length > 0 ) {
			effectiveBasedOn = r.conditions[ 0 ].field;
		}
		const allOptions = optionsData.flatMap(
			( item ) => item.children || []
		);
		const option = allOptions.find( ( o ) => o.value === effectiveBasedOn );
		return option?.inputProps?.unit || '';
	};

	const formatCurrencyValue = ( value ) => {
		const num = parseFloat( value );
		if ( isNaN( num ) ) {
			return { isNegative: false, absValue: 0 };
		}
		const isNegative = num < 0;
		const absValue = Math.abs( num );
		return { isNegative, absValue };
	};

	const showShippingCostText = ( r ) => {
		if ( isFree ) {
			return 'Free';
		}

		const symbol = getCurrencySymbol();
		const unit = getUnitForRate( r ) || '';

		switch ( r.type ) {
			case 'fixed': {
				const { isNegative, absValue } = formatCurrencyValue(
					r.initialValue || '0'
				);
				return isNegative
					? `-${ symbol }${ absValue }`
					: `${ symbol }${ absValue }`;
			}
			case 'incremental': {
				const { isNegative, absValue } = formatCurrencyValue(
					r.initialValue || '0'
				);
				const everyVal = r.everyValue;
				return `${ isNegative ? '-' : '' }${ symbol }${ absValue }${
					+everyVal ? ` for every ${ everyVal } ${ unit }` : ''
				}`;
			}
			case 'fixed_incremental': {
				const initialData = formatCurrencyValue(
					r.initialValue || '0'
				);
				const thenData = formatCurrencyValue( r.thenValue || '0' );
				const initialPart = initialData.isNegative
					? `-${ symbol }${ initialData.absValue }`
					: `${ symbol }${ initialData.absValue }`;
				const thenPart = thenData.isNegative
					? `-${ symbol }${ thenData.absValue }`
					: `${ symbol }${ thenData.absValue }`;
				const firstVal = r.firstValue;
				const everyVal = r.everyValue || '1';
				return `${ initialPart } ${
					+firstVal
						? `for the first ${ firstVal } ${ unit }, then`
						: '+'
				} ${ thenPart } per ${ everyVal } ${ unit }`;
			}
			default:
				return '';
		}
	};

	const value = showShippingCostText( rate );

	const handleClick = isFree
		? undefined
		: () => setOpenPopupId( openPopupId === rate.id ? null : rate.id );

	const shippingCostPopupTrigger = useRef( null );

	return (
		<div className="flex items-end gap-8">
			<div className="w-full">
				<Text
					weight={ wpConfig.weight.regular }
					size={ wpConfig.size.xs }
					as="p"
					className="mb-2! uppercase"
				>
					{ __( 'The shipping cost is', 'easy-min-max' ) }
				</Text>
				<div className="relative">
					<RateItemArrow
						rate={ rate }
						className="absolute z-0 right-full top-2"
					/>
					<div
						className={ cn(
							'focus:ring-2 focus:ring-(--wp-admin-theme-color) focus:outline-none text-nowrap p-[7px_12px] flex items-center border border-(--eamm-stroke-sub) bg-(--eamm-bg-white) min-h-10',
							isFree ? 'cursor-default' : 'cursor-pointer'
						) }
						role="button"
						tabIndex={ 0 }
						ref={ shippingCostPopupTrigger }
						title={ value }
						onClick={ handleClick }
						onKeyDown={ ( e ) => {
							if ( e.key === 'Enter' || e.key === ' ' ) {
								handleClick?.();
							}
						} }
					>
						<span className="max-w-30.5 inline-block truncate">
							{ value }
						</span>
						{ ! isFree && (
							<Icon
								icon="plus-alt2"
								className="inline-block ml-auto"
							/>
						) }
					</div>
					{ ! isFree && openPopupId === rate.id && (
						<ShippingCostPopup
							optionsData={ optionsData }
							rate={ rate }
							onRateChange={ onRateChange }
							setOpenPopupId={ setOpenPopupId }
						/>
					) }
				</div>
			</div>
			<div className="flex gap-2">
				{ ! isFree && (
					<>
						<Button
							__next40pxDefaultSize
							variant={ 'secondary' }
							icon="admin-page"
							onClick={ () => onCopyRate( rateIndex ) }
							label={ __( 'Copy', 'easy-min-max' ) }
							showTooltip
						></Button>

						<Button
							__next40pxDefaultSize
							variant={ 'secondary' }
							icon="trash"
							isDestructive
							disabled={ totalRates === 1 }
							onClick={ () => onRemoveRate( rateIndex ) }
							label={ __( 'Delete', 'easy-min-max' ) }
							showTooltip
						></Button>
					</>
				) }
			</div>
		</div>
	);
};

export { ShippingCostField };
