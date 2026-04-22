/* eslint-disable camelcase */
import { useShippingOptions } from '@/context/OptionsContext';
import { createEmptyCondition, useRuleStore } from '@/store/useRuleStore';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    __experimentalHeading as Heading,
    __experimentalHStack as HStack,
    Icon,
    Tooltip,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ConditionItemOperationField from './components/ConditionItemOperationField';
import ConditionItemTypeField from './components/ConditionItemTypeField';
import ConditionItemValueField from './components/ConditionItemValueField';

export function Conditions() {
	const {
		state: { rulesForm },
		updateBuilder,
	} = useRuleStore();
	const { getDefaultOptions } = useShippingOptions();

	const conditionGroups =
		Array.isArray( rulesForm.conditionGroups ) &&
		rulesForm.conditionGroups.length > 0
			? rulesForm.conditionGroups
			: [ [ createEmptyCondition() ] ];
	const conditionOptions = getDefaultOptions();

	const getSelectedConditionOptions = ( type, field ) => {
		return conditionOptions
			.flatMap( ( item ) => item.children || [] )
			.find( ( item ) => item.value === field && ( ! type || item ) );
	};

	const updateConditionGroups = ( updater ) => {
		updateBuilder( ( prev ) => ( {
			...prev,
			conditionGroups: updater( prev.conditionGroups || [] ),
		} ) );
	};

	const handleConditionChange = ( groupIndex, conditionIndex, value ) => {
		updateConditionGroups( ( groups ) =>
			( groups.length > 0 ? groups : [ [ createEmptyCondition() ] ] ).map(
				( group, currentGroupIndex ) => {
					if ( currentGroupIndex !== groupIndex ) {
						return group;
					}

					return group.map( ( condition, currentConditionIndex ) =>
						currentConditionIndex === conditionIndex
							? { ...condition, ...value }
							: condition
					);
				}
			)
		);
	};

	const handleAddCondition = ( groupIndex ) => {
		updateConditionGroups( ( groups ) =>
			groups.map( ( group, currentGroupIndex ) =>
				currentGroupIndex === groupIndex
					? [ ...group, createEmptyCondition() ]
					: group
			)
		);
	};

	const handleRemoveCondition = ( groupIndex, conditionIndex ) => {
		updateConditionGroups( ( groups ) =>
			groups.map( ( group, currentGroupIndex ) => {
				if ( currentGroupIndex !== groupIndex || group.length === 1 ) {
					return group;
				}

				return group.filter(
					( _, currentConditionIndex ) =>
						currentConditionIndex !== conditionIndex
				);
			} )
		);
	};

	const handleAddGroup = () => {
		updateConditionGroups( ( groups ) => [
			...( groups.length > 0 ? groups : conditionGroups ),
			[ createEmptyCondition() ],
		] );
	};

	const handleRemoveGroup = ( groupIndex ) => {
		updateConditionGroups( ( groups ) => {
			if ( groups.length === 1 ) {
				return groups;
			}

			return groups.filter(
				( _, currentGroupIndex ) => currentGroupIndex !== groupIndex
			);
		} );
	};

	return (
		<Card>
			<CardHeader>
				<HStack spacing={ 2 } expanded={ false }>
					<Heading level={ 3 }>
						{ __( 'Conditions', 'syzenlabs-quantity-limits' ) }
					</Heading>
					<Tooltip
						text={ __(
							"Set conditions for when the rule should be applied. You can create multiple condition groups, and if any group's conditions are met, the rule will be applied.",
							'syzenlabs-quantity-limits'
						) }
					>
						<span>
							<Icon icon="info-outline" />
						</span>
					</Tooltip>
				</HStack>
			</CardHeader>
			<CardBody>
				<div>
					{ conditionGroups.map( ( group, groupIndex ) => (
						<div key={ `condition-group-${ groupIndex }` }>
							<div className="rounded-(--syzeql-border-radius-md) border border-[#DCDCDE] bg-white p-4">
								<Flex
									justify="space-between"
									align="start"
									gap={ 4 }
								>
									<div>
										<p className="m-0 font-medium text-(--syzeql-text-main)">
											{ __(
												'Condition Group',
												'syzenlabs-quantity-limits'
											) }{ ' ' }
											{ groupIndex + 1 }
										</p>
										<p className="mt-1 mb-0 text-sm text-(--syzeql-text-sub)">
											{ __(
												'All conditions in this group must be true.',
												'syzenlabs-quantity-limits'
											) }
										</p>
									</div>

									<Button
										__next40pxDefaultSize
										variant="secondary"
										isDestructive
										icon="trash"
										disabled={
											conditionGroups.length === 1
										}
										onClick={ () =>
											handleRemoveGroup( groupIndex )
										}
									>
										{ __( 'Remove Group', 'syzenlabs-quantity-limits' ) }
									</Button>
								</Flex>

								<div className="flex flex-col gap-3 mt-4">
									{ group.map(
										( condition, conditionIndex ) => {
											const selectedOptions =
												getSelectedConditionOptions(
													condition.type,
													condition.field
												);

											return (
												<div
													key={ `condition-${ groupIndex }-${ conditionIndex }` }
													className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]"
												>
													<ConditionItemTypeField
														options={
															conditionOptions
														}
														selected={ condition }
														onChange={ ( value ) =>
															handleConditionChange(
																groupIndex,
																conditionIndex,
																value
															)
														}
													/>
													<div>
														<ConditionItemOperationField
															selected={
																condition
															}
															selectedOptions={
																selectedOptions
															}
															onChange={ (
																value
															) =>
																handleConditionChange(
																	groupIndex,
																	conditionIndex,
																	value
																)
															}
														/>
													</div>
													<div>
														<ConditionItemValueField
															selected={
																condition
															}
															selectedOptions={
																selectedOptions
															}
															onChange={ (
																value
															) =>
																handleConditionChange(
																	groupIndex,
																	conditionIndex,
																	value
																)
															}
														/>
													</div>
													<Button
														__next40pxDefaultSize
														variant="secondary"
														isDestructive
														icon="trash"
														disabled={
															group.length === 1
														}
														onClick={ () =>
															handleRemoveCondition(
																groupIndex,
																conditionIndex
															)
														}
													/>
												</div>
											);
										}
									) }
								</div>

								<Button
									__next40pxDefaultSize
									className="mt-4!"
									variant="primary"
									icon="plus-alt2"
									onClick={ () =>
										handleAddCondition( groupIndex )
									}
								>
									{ __( 'Add Condition', 'syzenlabs-quantity-limits' ) }
								</Button>
							</div>

							{ groupIndex < conditionGroups.length - 1 && (
								<div className="my-3 text-center text-xl font-bold tracking-wide text-(--syzeql-text-sub) uppercase">
									{ __( 'Or', 'syzenlabs-quantity-limits' ) }
								</div>
							) }
						</div>
					) ) }

					<Button
						__next40pxDefaultSize
						variant="secondary"
						icon="plus-alt2"
						className="mt-4!"
						onClick={ handleAddGroup }
					>
						{ __( 'Add Condition Group', 'syzenlabs-quantity-limits' ) }
					</Button>
				</div>
			</CardBody>
		</Card>
	);
}
