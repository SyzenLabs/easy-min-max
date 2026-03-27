import { useRuleStore } from '@/store/useRuleStore';
import { Flex } from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { FlexibleAmountMethod } from './FlexibleAmountMethod';

const baseControlNextDefaults = {
	__nextHasNoMarginBottom: true,
	__next40pxDefaultSize: true,
};

export function ShippingMethodItem( { condition, disableRemove, index } ) {
	const { setState, updateBuilder } = useRuleStore();

	const handleMethodItemChange = useCallback(
		( value = {} ) => {
			updateBuilder( ( prev ) => {
				const updated = prev.conditionGroups.map( ( m, i ) =>
					i === index ? { ...m, ...value } : m
				);
				return {
					...prev,
					conditionGroups: updated,
				};
			} );
		},
		[ index, updateBuilder ]
	);

	return (
		<div>
			<Flex direction="column" gap={ 4 }>
				{ /* <ToggleGroupControl
					{ ...baseControlNextDefaults }
					label={ __(
						'Select How You Want to Calculate Shipping Rates',
						'easy-min-max'
					) }
					isBlock
					value={ condition.type ?? 'general' }
					onChange={ ( value ) =>
						handleMethodItemChange( {
							type: value,
						} )
					}
				>
					{ CALCULATION_METHOD_OPTIONS.map( ( option ) => (
						<ToggleGroupControlOption
							showTooltip
							key={ option.value }
							value={ option.value }
							aria-label={ option.help }
							label={
								<div className="flex items-center gap-2!">
									{ option.label }
									{ option.pro && isFreeUser() && <Pro /> }
								</div>
							}
						/>
					) ) }
				</ToggleGroupControl> */ }

				{ /* <ManualRates
					method={ condition }
					handleMethodItemChange={ handleMethodItemChange }
				/> */ }

				<FlexibleAmountMethod
					method={ condition }
					handleMethodItemChange={ handleMethodItemChange }
				/>

				{ /* <Divider className="my-2!" />

				<ToggleControl
					{ ...baseControlNextDefaults }
					label={ __( 'Advanced Display Rules', 'easy-min-max' ) }
					help={ __(
						'Add one or more display rules. The current shipping method will not be displayed unless all these rules are met.',
						'easy-min-max'
					) }
					checked={ condition.drEnabled }
					onChange={ ( value ) =>
						handleMethodItemChange( {
							drEnabled: value,
						} )
					}
				/> */ }

				{ /* { condition.drEnabled && (
					<AdvanceDisplayRules
						method={ condition }
						handleMethodItemChange={ handleMethodItemChange }
					/>
				) } */ }
			</Flex>
		</div>
	);
}
