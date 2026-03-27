import { Pro } from '@/components/ui';
import { ButtonProBadge } from '@/components/ui/Pro';
import { useShippingOptions } from '@/context/OptionsContext';
import { useEventCallback } from '@/hooks/use-event-callback';
import { cn, getFlags, getUuid, isFreeUser } from '@/utils';
import { wpConfig } from '@/utils/wpc-config';
import {
	Button,
	Flex,
	Icon,
	__experimentalText as Text,
	Tooltip
} from '@wordpress/components';
import { memo, useLayoutEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import ConditionItemOperationField from './ConditionItemOperationField';
import ConditionItemTypeField from './ConditionItemTypeField';
import ConditionItemValueField from './ConditionItemValueField';
import { ShippingCostField } from './ShippingCostField';

const selectControlNextDefaults = {
	__next40pxDefaultSize: true,
	__nextHasNoMarginBottom: true,
};

export const FlexibleAmountMethod = memo( function FlexibleAmountMethod( {
	method,
	handleMethodItemChange,
} ) {
	const { getDefaultOptions } = useShippingOptions();

	const rateConditionLeftRef = useRef( null );

	const [ openPopupId, setOpenPopupId ] = useState( null );

	const handleConditionChange = ( rateIndex, conditionId, value ) => {
		const updatedRates = method.rates.map( ( r, idx ) =>
			idx === rateIndex
				? {
						...r,
						conditions: r.conditions.map( ( c ) =>
							c.id === conditionId ? { ...c, ...value } : c
						),
				  }
				: r
		);
		handleMethodItemChange( { rates: updatedRates } );
	};

	const handleAddCondition = ( rateIndex, conditionId ) => {
		const rate = method.rates[ rateIndex ];
		const conditions = rate.conditions || [];
		const index = conditions.findIndex( ( c ) => c.id === conditionId );
		const newCondition = {
			id: getUuid(),
			type: 'Cart',
			field: 'cart_total',
			operator: 'between',
			value: '',
			// eslint-disable-next-line camelcase
			min_range: '',
			// eslint-disable-next-line camelcase
			max_range: '',
		};
		const updatedConditions = [
			...conditions.slice( 0, index + 1 ),
			newCondition,
			...conditions.slice( index + 1 ),
		];
		const updatedRates = method.rates.map( ( r, idx ) =>
			idx === rateIndex ? { ...r, conditions: updatedConditions } : r
		);
		handleMethodItemChange( { rates: updatedRates } );
	};

	const handleRemoveCondition = ( rateIndex, conditionId ) => {
		const updatedRates = method.rates.map( ( r, idx ) =>
			idx === rateIndex
				? {
						...r,
						conditions: r.conditions.filter(
							( c ) => c.id !== conditionId
						),
				  }
				: r
		);
		handleMethodItemChange( { rates: updatedRates } );
	};

	const handleRemoveRate = ( rateIndex ) => {
		const updatedRates = method.rates.filter(
			( _, idx ) => idx !== rateIndex
		);
		handleMethodItemChange( { rates: updatedRates } );
	};

	const handleCopyRate = ( rateIndex ) => {
		const originalRate = method.rates[ rateIndex ];
		const copiedRate = {
			...originalRate,
			id: getUuid(),
			conditions: originalRate.conditions.map( ( condition ) => ( {
				...condition,
				id: getUuid(),
			} ) ),
		};
		const updatedRates = [
			...method.rates.slice( 0, rateIndex + 1 ),
			copiedRate,
			...method.rates.slice( rateIndex + 1 ),
		];
		handleMethodItemChange( { rates: updatedRates } );
	};
	const handleAddRate = () => {
		const lastRate = method.rates[ method.rates.length - 1 ];
		let newRate;
		if ( lastRate ) {
			newRate = {
				...lastRate,
				id: getUuid(),
				initialValue: 0,
				everyValue: 0,
				thenValue: 0,
				firstValue: 0,
				basedOn: '',
				conditions: lastRate.conditions.map( ( condition ) => ( {
					id: getUuid(),
					type: condition.type,
					field: condition.field,
					operator: '',
					value: '',
					// eslint-disable-next-line camelcase
					min_range: '',
					// eslint-disable-next-line camelcase
					max_range: '',
				} ) ),
			};
		} else {
			newRate = {
				id: getUuid(),
				type: 'fixed', // fixed | incremental | fixed_incremental
				initialValue: 0,
				everyValue: 0,
				thenValue: 0,
				firstValue: 0,
				// finalValue: 0, // final value after calculations
				basedOn: '',
				conditions: [
					{
						id: getUuid(),
						type: 'Cart',
						field: 'cart_total',
						operator: 'between',
						value: '',
						// eslint-disable-next-line camelcase
						min_range: '',
						// eslint-disable-next-line camelcase
						max_range: '',
					},
				],
			};
		}
		handleMethodItemChange( {
			rates: [ ...method.rates, newRate ],
		} );
	};

	const optionsData = getDefaultOptions();

	const getSelectedConditionOptions = ( type, field ) => {
		return optionsData
			.flatMap( ( item ) => item.children || [] )
			.find( ( item ) => item.value === field );
	};

	const [ tableWidths, setTableWidths ] = useState( { leftWidth: 0 } );

	useLayoutEffect( () => {
		const computeWidths = () => {
			const leftWidth = rateConditionLeftRef.current?.offsetWidth || 0;
			setTableWidths( { leftWidth } );
		};
		computeWidths();
		window.addEventListener( 'resize', computeWidths );
		return () => window.removeEventListener( 'resize', computeWidths );
	}, [ rateConditionLeftRef, method.isEnabled ] );

	const onRateChangeHandler = useEventCallback( ( { value, rate } ) => {
		const updatedRates = method.rates.map( ( r ) =>
			r.id === rate.id ? { ...r, ...value } : r
		);
		handleMethodItemChange( {
			rates: updatedRates,
		} );
	} );

	return (
		<>
			<Flex
				gap={ 0 }
				id="eamm-shipping-method-rates-section-flexible"
				className="w-full! max-w-full! mt-4!"
				direction="column"
			>
				<div className="w-full overflow-x-auto lg:overflow-visible">
					<div className="min-w-max">
						<div
							className="grid items-end gap-8 px-6 py-4 text-(--eamm-text-sub) font-medium bg-[#E0E0E0] border border-[#CCCCCC] rounded-t-(--eamm-border-radius-md) border-b-0"
							style={ {
								gridTemplateColumns: `${ tableWidths.leftWidth }px auto`,
							} }
						>
							<div className="ml-12.5">Conditions</div>
							<div>Cost</div>
						</div>
						{ method.rates.map( ( rate, rateIndex ) => (
							<div
								key={ rate.id }
								className={ cn(
									'border-x border-[#CCCCCC] relative px-6 py-7 flex flex-col gap-4',
									{
										'bg-[#F0F0F0]': rateIndex % 2 === 0,
										'bg-(--eamm-neutral-0)':
											rateIndex % 2 !== 0,
									}
								) }
							>
								{ rateIndex + 1 >
									getFlags().MAX_FLEXIBLE_SEGMENTS && (
									<Pro
										text={ false }
										className="absolute -left-2.25 top-1/2"
									/>
								) }
								{ ( rate.conditions || [] ).map(
									( conditionGroup, cIndex ) => (
										<div
											key={ conditionGroup.id }
											className="grid gap-8"
											style={ {
												gridTemplateColumns:
													'auto 300px',
											} }
										>
											{ /* Arrow Start */ }
											<div
												ref={ rateConditionLeftRef }
												className="z-10 grid items-end gap-2"
												style={ {
													gridTemplateColumns:
														'auto 1fr 1fr 240px',
												} }
											>
												{ cIndex === 0 ? (
													<Tooltip
														text={ __(
															'Add “AND” Condition',
															'easy-min-max'
														) }
													>
														<ButtonProBadge
															showPro={
																isFreeUser() &&
																getFlags()
																	.MAX_RATE_TIER_CONDITION >=
																	1
															}
															dir="left"
														>
															<Button
																__next40pxDefaultSize
																variant="secondary"
																label={ __(
																	'Add “AND” Condition',
																	'easy-min-max'
																) }
																icon="plus-alt2"
																disabled={
																	rate
																		.conditions
																		.length >=
																	getFlags()
																		.RATE_TIER_CONDITION_LIMIT
																}
																onClick={ () =>
																	handleAddCondition(
																		rateIndex,
																		conditionGroup.id
																	)
																}
															></Button>
														</ButtonProBadge>
													</Tooltip>
												) : (
													<Button
														__next40pxDefaultSize
														variant="secondary"
														icon={
															<Icon icon="no-alt" />
														}
														isDestructive={ true }
														onClick={ () =>
															handleRemoveCondition(
																rateIndex,
																conditionGroup.id
															)
														}
													></Button>
												) }

												<div>
													<Text
														as="p"
														weight={
															wpConfig.weight
																.regular
														}
														size={
															wpConfig.size.xs
														}
														className="mb-2! uppercase"
													>
														{ cIndex === 0
															? __(
																	'WHEN',
																	'easy-min-max'
															  )
															: __(
																	'AND',
																	'easy-min-max'
															  ) }
													</Text>
													<ConditionItemTypeField
														options={ optionsData }
														selected={
															conditionGroup
														}
														onChange={ (
															value
														) => {
															handleConditionChange(
																rateIndex,
																conditionGroup.id,
																value
															);
														} }
													></ConditionItemTypeField>
												</div>
												<ConditionItemOperationField
													options={ optionsData }
													selected={ conditionGroup }
													selectedOptions={ getSelectedConditionOptions(
														conditionGroup.type,
														conditionGroup.field
													) }
													onChange={ ( value ) => {
														handleConditionChange(
															rateIndex,
															conditionGroup.id,
															value
														);
													} }
												></ConditionItemOperationField>
												{ /* Arrow Starting Point */ }
												<ConditionItemValueField
													selected={ conditionGroup }
													selectedOptions={ getSelectedConditionOptions(
														conditionGroup.type,
														conditionGroup.field
													) }
													onChange={ ( value ) => {
														handleConditionChange(
															rateIndex,
															conditionGroup.id,
															value
														);
													} }
												></ConditionItemValueField>
											</div>

											{ cIndex === 0 && (
												// Arrow End
												<ShippingCostField
													rate={ rate }
													isFree={ false }
													openPopupId={ openPopupId }
													setOpenPopupId={
														setOpenPopupId
													}
													optionsData={ optionsData }
													onRateChange={ ( value ) =>
														onRateChangeHandler( {
															value,
															rate,
														} )
													}
													onRemoveRate={
														handleRemoveRate
													}
													rateIndex={ rateIndex }
													totalRates={
														method.rates.length
													}
													onCopyRate={
														handleCopyRate
													}
												/>
											) }
										</div>
									)
								) }
							</div>
						) ) }
						<div
							className={ cn(
								'gap-8 py-4 px-6 pl-18 bg-[#F0F0F0] border border-[#CCCCCC] rounded-b-(--eamm-border-radius-md) flex items-center justify-between',
								method.methodType === 'free_shipping' &&
									'hidden'
							) }
						>
							<div className="flex items-center gap-4">
								<ButtonProBadge
									showPro={
										method.rates.length >=
										getFlags().MAX_FLEXIBLE_SEGMENTS
									}
								>
									<Button
										__next40pxDefaultSize
										variant="primary"
										icon="plus-alt2"
										onClick={ handleAddRate }
									>
										{ __(
											'Add Rate Tier',
											'easy-min-max'
										) }
									</Button>
								</ButtonProBadge>
							</div>
						</div>
					</div>
				</div>
			</Flex>
		</>
	);
} );
