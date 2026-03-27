import { Pro } from '@/components/ui';
import { getFlags, getUuid } from '@/utils';
import { __ } from '@wordpress/i18n';

import {
	Button,
	Card,
	CardBody,
	__experimentalGrid as Grid,
} from '@wordpress/components';

import { ConditionGroup } from './ConditionGroup';
import ConditionItemOperationField from './ConditionItemOperationField';
import ConditionItemTypeField from './ConditionItemTypeField';
import ConditionItemValueField from './ConditionItemValueField';

import { ButtonProBadge } from '@/components/ui/Pro';
import { useShippingOptions } from '@/context/OptionsContext';

const AdvanceDisplayRules = ( { method, handleMethodItemChange } ) => {
	const { getDefaultOptions } = useShippingOptions();

	const handleConditionChange = ( groupIndex, conditionId, value ) => {
		const updatedGroups = method.drGroups.map( ( group, gIdx ) =>
			gIdx === groupIndex
				? {
						...group,
						conditions: group.conditions.map( ( c ) =>
							c.id === conditionId ? { ...c, ...value } : c
						),
				  }
				: group
		);
		handleMethodItemChange( { drGroups: updatedGroups } );
	};

	const handleAddCondition = ( groupIndex ) => {
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
		const updatedGroups = method.drGroups.map( ( group, idx ) =>
			idx === groupIndex
				? {
						...group,
						conditions: [ ...group.conditions, newCondition ],
				  }
				: group
		);
		handleMethodItemChange( { drGroups: updatedGroups } );
	};

	const handleRemoveCondition = ( groupIndex, conditionId ) => {
		const updatedGroups = method.drGroups.map( ( group, idx ) =>
			idx === groupIndex
				? {
						...group,
						conditions: group.conditions.filter(
							( c ) => c.id !== conditionId
						),
				  }
				: group
		);
		handleMethodItemChange( { drGroups: updatedGroups } );
	};

	const optionsData = getDefaultOptions()?.filter(
		( option ) => ! [ 'General' ].includes( option.value )
	);

	const getSelectedConditionOptions = ( type, field ) => {
		return optionsData
			.flatMap( ( item ) => item.children || [] )
			.find( ( item ) => item.value === field );
	};

	return (
		<Card>
			<CardBody>
				{ method.drGroups?.map( ( group, gIndex ) => (
					<ConditionGroup key={ gIndex }>
						{ /* <ConditionType
                        selected={ group.globalLogic }
                        design="secondary"
                        onChange={ ( value ) =>
                            handleGroupLogicChange( gIndex, value )
                        }
                    /> */ }
						{ group.conditions.length > 0 &&
							group.conditions.map( ( condition, cIndex ) => (
								<Grid
									className="mb-4"
									templateColumns="1fr 1fr 1fr auto"
									key={ condition.id }
								>
									{ cIndex >=
										getFlags().MAX_NESTED_CONDITIONS && (
										<Pro
											text={ false }
											className="absolute -left-2.25 top-2.25 z-10"
										/>
									) }
									<ConditionItemTypeField
										options={ optionsData }
										selected={ condition }
										onChange={ ( value ) => {
											handleConditionChange(
												gIndex,
												condition.id,
												value
											);
										} }
									/>
									<ConditionItemOperationField
										options={ optionsData }
										selected={ condition }
										selectedOptions={ getSelectedConditionOptions(
											condition.type,
											condition.field
										) }
										onChange={ ( value ) => {
											handleConditionChange(
												gIndex,
												condition.id,
												value
											);
										} }
									/>
									<div>
										<ConditionItemValueField
											selected={ condition }
											selectedOptions={ getSelectedConditionOptions(
												condition.type,
												condition.field
											) }
											onChange={ ( value ) => {
												handleConditionChange(
													gIndex,
													condition.id,
													value
												);
											} }
										/>
									</div>
									<Button
										__next40pxDefaultSize
										variant="secondary"
										isDestructive
										icon="trash"
										disabled={
											group.conditions.length === 1
										}
										onClick={ () =>
											handleRemoveCondition(
												gIndex,
												condition.id
											)
										}
									/>
								</Grid>
							) ) }

						<ButtonProBadge
							showPro={
								group.conditions.length >=
								getFlags().MAX_NESTED_CONDITIONS
							}
						>
							<Button
								__next40pxDefaultSize
								className="mt-2 w-fit"
								variant="primary"
								icon="plus-alt2"
								onClick={ () => handleAddCondition( gIndex ) }
							>
								{ __( 'Add Display Rule', 'easy-min-max' ) }
							</Button>
						</ButtonProBadge>
					</ConditionGroup>
				) ) }
			</CardBody>
		</Card>
	);
};

export { AdvanceDisplayRules };
