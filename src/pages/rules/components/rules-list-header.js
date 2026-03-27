import { useCallback, useMemo, useState } from '@wordpress/element';

import { usePrompt } from '@/context/PromptContext';
import { useToast } from '@/context/ToastContext';
import { useRuleStore } from '@/store/useRuleStore';

import { downloadAsCSV } from '@/utils';
import apiFetch from '@wordpress/api-fetch';
import {
    Button,
    __experimentalHStack as HStack,
    Icon,
    __experimentalInputControl as InputControl,
    __experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
    SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { search } from '@wordpress/icons';

async function getExportRulesData( data ) {
	return apiFetch( {
		path:
			'/easy-min-max/v1/rules-export?' +
			new URLSearchParams( data ).toString(),
	} );
}

export function RulesListHeader( { state, setState, filteredRules } ) {
	const { showToast } = useToast();
	const { firePrompt } = usePrompt();
	const { getRules, state: ruleState } = useRuleStore();

	const countByStatus = useMemo( () => {
		const count = {
			all: 0,
			publish: 0,
			draft: 0,
		};

		const statusMap = {
			publish: 'publish',
			draft: 'draft',
			all: 'all',
		};

		const data = state.searchQuery ? filteredRules : ruleState.rules;

		data.forEach( ( rule ) => {
			count[ statusMap[ rule.status ] ]++;
			count.all++;
		} );
		return count;
	}, [ state.searchQuery, filteredRules, ruleState.rules ] );

	const [ bulkLoading, setBulkLoading ] = useState( false );

	const exportData = async () => {
		const removeFn = showToast(
			__( 'Exporting rules…', 'easy-min-max' ),
			'info',
			0
		);
		try {
			const data = await getExportRulesData( {
				status: state.filterStatus,
				search: state.searchQuery,
			} );
			if ( ! data.success ) {
				throw new Error(
					__( 'Error while exporting rules', 'easy-min-max' )
				);
			}
			const {
				data: { filename, data: csvData },
			} = data;

			if ( csvData.length > 0 ) {
				await downloadAsCSV( filename, csvData );
				showToast(
					__( 'Rules exported successfully', 'easy-min-max' ),
					'success'
				);
			} else {
				showToast(
					__( 'No rules found to export', 'easy-min-max' ),
					'warning'
				);
			}
		} catch ( err ) {
			// eslint-disable-next-line no-console
			console.log( err );
			showToast(
				__( 'Error while exporting rules', 'easy-min-max' ),
				'error'
			);
		} finally {
			removeFn();
		}
	};

	const handleBulkApply = useCallback(
		async ( action, items = [] ) => {
			if ( ! action || items.length === 0 ) {
				showToast(
					__(
						'Please select an action and at least one item.',
						'easy-min-max'
					),
					'error'
				);
				return;
			}

			const alertMap = {
				publish: {
					action: 'activate',
					message: `Are you sure you want to publish ${ items.length } selected rule(s)? This action cannot be undone.`,
					type: 'info',
					confirmButtonDesign: 'primary',
					confirmText: 'Publish',
				},
				draft: {
					action: 'deactivate',
					message: `Are you sure you want to draft ${ items.length } selected rule(s)? This action cannot be undone.`,
					type: 'info',
					confirmButtonDesign: 'primary',
					confirmText: 'Draft',
				},
				delete: {
					action: 'delete',
					message: `Are you sure you want to delete ${ items.length } selected rule(s)? This action cannot be undone.`,
					type: 'danger',
					confirmButtonDesign: 'error',
					confirmText: 'Delete',
				},
			};

			const confirmed = await firePrompt( {
				title: __( 'Bulk Apply', 'easy-min-max' ),
				message: alertMap[ action ].message,
				confirmButtonDesign: alertMap[ action ].confirmButtonDesign,
				type: alertMap[ action ].type,
				confirmText: alertMap[ action ].confirmText,
			} );

			if ( ! confirmed.ok ) {
				return;
			}
			setBulkLoading( true );
			try {
				const response = await apiFetch( {
					path: '/easy-min-max/v1/rules/bulk',
					method: 'POST',
					data: {
						action: alertMap[ action ].action,
						// eslint-disable-next-line camelcase
						rule_ids: items,
					},
				} );

				if ( ! response.success ) {
					throw new Error( response.message );
				}

				getRules();
				setState( ( prev ) => ( {
					...prev,
					bulkAllSelected: false,
					bulkSelectedItems: [],
				} ) );
				showToast(
					__(
						'Bulk operation completed successfully',
						'easy-min-max'
					),
					'success'
				);

				return response.data;
			} catch ( error ) {
				showToast(
					__( 'Error performing bulk operation', 'easy-min-max' ),
					'error'
				);
			} finally {
				setBulkLoading( false );
			}
		},
		[ showToast, firePrompt, getRules, setState ]
	);

	return (
		<HStack wrap={ true }>
			<HStack expanded={ false } wrap={ true } justify="start">
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					value={ state.bulkAction }
					label={ __( 'Bulk Actions', 'easy-min-max' ) }
					hideLabelFromVision={ true }
					options={ [
						{
							value: '',
							label: __( 'Bulk Actions', 'easy-min-max' ),
							disabled: true,
						},
						{
							value: 'publish',
							label: __( 'Publish', 'easy-min-max' ),
						},
						{
							value: 'draft',
							label: __( 'Draft', 'easy-min-max' ),
						},
						{
							value: 'delete',
							label: __( 'Delete', 'easy-min-max' ),
						},
					] }
					onChange={ ( value ) =>
						setState( ( prev ) => ( {
							...prev,
							bulkAction: value,
						} ) )
					}
				/>

				<Button
					__next40pxDefaultSize
					isBusy={ bulkLoading }
					disabled={
						! state.bulkSelectedItems.length ||
						! state.bulkAction ||
						bulkLoading
					}
					onClick={ () =>
						handleBulkApply(
							state.bulkAction,
							state.bulkSelectedItems
						)
					}
					variant="primary"
				>
					{ __( 'Apply', 'easy-min-max' ) }
				</Button>

				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					value={ state.filterStatus }
					label={ __( 'All Status', 'easy-min-max' ) }
					hideLabelFromVision={ true }
					options={ [
						{
							value: 'all',
							label: `${ __( 'All Status', 'easy-min-max' ) } (${
								countByStatus.all
							})`,
						},
						{
							value: 'publish',
							label: `${ __( 'Publish', 'easy-min-max' ) } (${
								countByStatus.publish
							})`,
						},
						{
							value: 'draft',
							label: `${ __( 'Draft', 'easy-min-max' ) } (${
								countByStatus.draft
							})`,
						},
					] }
					onChange={ ( value ) =>
						setState( ( prev ) => ( {
							...prev,
							filterStatus: value,
						} ) )
					}
				/>
			</HStack>

			<HStack expanded={ false } wrap={ true } justify="start">
				<InputControl
					__next40pxDefaultSize
					label={ __( 'Search', 'easy-min-max' ) }
					hideLabelFromVision={ true }
					value={ state.searchQuery }
					onChange={ ( value ) =>
						setState( ( prev ) => ( {
							...prev,
							searchQuery: value,
						} ) )
					}
					placeholder={ __( 'Search', 'easy-min-max' ) }
					prefix={
						<InputControlPrefixWrapper>
							<Icon icon={ search } />
						</InputControlPrefixWrapper>
					}
				/>

				{ /* <ImportRules>
					<Button
						__next40pxDefaultSize
						variant="secondary"
						icon={ <Icon icon={ download } /> }
						iconPosition="left"
					>
						{ __( 'Import', 'easy-min-max' ) }
					</Button>
				</ImportRules>

				<Button
					__next40pxDefaultSize
					variant="secondary"
					icon={ <Icon icon={ upload } /> }
					iconPosition="left"
					onClick={ exportData }
				>
					{ __( 'Export', 'easy-min-max' ) }
				</Button> */ }
			</HStack>
		</HStack>
	);
}
