import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';


import { useNav } from '@/context/NavContext';
import { useRuleStore } from '@/store/useRuleStore';

import { DataViews } from '@wordpress/dataviews/wp';
import { __, _n } from '@wordpress/i18n';

import {
    Button,
    __experimentalDivider as Divider,
    FormToggle,
    __experimentalHStack as HStack,
    Icon,
    Spinner,
    __experimentalText as Text,
    __experimentalVStack as VStack,
} from '@wordpress/components';

import { copy, pencil, trash } from '@wordpress/icons';

export default function RulesDataView( { state, setState, filteredRules } ) {
	const {
		state: ruleState,
		updateRule,
		updateBuilder,
		deleteRule,
		duplicateRule,
		getRules,
	} = useRuleStore();
	const { setCurrentNav } = useNav();

	const totalItems = filteredRules?.length || 0;
	const totalPages = Math.max( 1, Math.ceil( totalItems / state.perPage ) );
	const currentPage = Math.min(
		Math.max( 1, state.currentPage ),
		totalPages
	);

	useEffect( () => {
		// eslint-disable-next-line react-you-might-not-need-an-effect/no-pass-data-to-parent
		setState( ( prev ) => ( {
			...prev,
			totalItems,
		} ) );
	}, [ setState, totalItems ] );

	useEffect( () => {
		// Match legacy behavior: reset selection on mount.
		// eslint-disable-next-line react-you-might-not-need-an-effect/no-pass-data-to-parent
		setState( ( prev ) => ( {
			...prev,
			bulkAllSelected: false,
			bulkSelectedItems: [],
		} ) );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const pageData = useMemo( () => {
		if ( ! filteredRules?.length ) {
			return [];
		}

		const start = ( currentPage - 1 ) * state.perPage;
		const end = currentPage * state.perPage;

		return filteredRules.slice( start, end ).map( ( rule, index ) => ( {
			...rule,
			__pageIndex: index,
		} ) );
	}, [ currentPage, filteredRules, state.perPage ] );

	const redirectToEdit = useCallback(
		( id ) => {
			if ( ! id ) {
				return;
			}
			window.location.hash = `rule-edit/${ id }`;
			setCurrentNav( `rule-edit/${ id }` );
		},
		[ setCurrentNav ]
	);

	const handleStatusToggle = useCallback(
		async ( item ) => {
			// find the item and update the publishMode
			updateBuilder(
				'publishMode',
				item.publishMode === 'publish' ? 'draft' : 'publish'
			);

			await updateRule( {
				...item,
				publishMode:
					item.publishMode === 'publish' ? 'draft' : 'publish',
			} );

			getRules();
		},
		[ updateBuilder, updateRule, getRules ]
	);

	const fields = useMemo( () => {
		return [
			{
				id: 'name',
				type: 'text',
				label: __( 'Rule Name', 'syzenlabs-quantity-limits' ),
				enableSorting: false,
				enableHiding: false,
				filterBy: false,
				enableMoving: false,
				render: ( { item } ) => {
					const title = item?.generalSettings?.scenarioName
						? item.generalSettings.scenarioName
						: __( 'No Title', 'syzenlabs-quantity-limits' );

					return (
						<>
							<Button
								__next40pxDefaultSize
								variant="link"
								onClick={ () => redirectToEdit( item.id ) }
							>
								{ title }
							</Button>
						</>
					);
				},
			},
			{
				id: 'status',
				type: 'text',
				label: __( 'Status', 'syzenlabs-quantity-limits' ),
				enableSorting: false,
				enableHiding: false,
				filterBy: false,
				enableMoving: false,
				render: ( { item } ) => {
					return (
						<FormToggle
							checked={ item?.publishMode === 'publish' }
							onChange={ () => handleStatusToggle( item ) }
							aria-label={ __(
								'Toggle shipping method status',
								'syzenlabs-quantity-limits'
							) }
						/>
					);
				},
			},
		];
	}, [ redirectToEdit, handleStatusToggle ] );

	const view = useMemo( () => {
		return {
			type: 'table',
			page: currentPage,
			perPage: state.perPage,
			search: '',
			filters: [],
			fields: [ 'status', 'methodType', 'zoneName' ],
			titleField: 'name',
			layout: {
				density: 'balanced',
				enableMoving: false,
			},
		};
	}, [ currentPage, state.perPage ] );

	const paginationInfo = useMemo( () => {
		return {
			totalItems,
			totalPages,
		};
	}, [ totalItems, totalPages ] );

	const selection = useMemo( () => {
		return ( state.bulkSelectedItems || [] ).map( ( id ) => String( id ) );
	}, [ state.bulkSelectedItems ] );

	const actions = useMemo( () => {
		return [
			{
				id: 'edit',
				label: __( 'Edit Method', 'syzenlabs-quantity-limits' ),
				icon: <Icon icon={ pencil } />,
				callback: ( items ) => {
					redirectToEdit( items?.[ 0 ]?.id );
				},
			},
			{
				id: 'duplicate',
				label: __( 'Duplicate Method', 'syzenlabs-quantity-limits' ),
				icon: <Icon icon={ copy } />,

				modalHeader: __( 'Duplicate Shipping Method', 'syzenlabs-quantity-limits' ),

				RenderModal: ( { items, closeModal } ) => {
					const [ isDuplicating, setIsDuplicating ] =
						useState( false );

					const onSubmit = async ( event ) => {
						event.preventDefault();
						setIsDuplicating( true );
						const newId = await duplicateRule( items?.[ 0 ]?.id );
						closeModal();
						setIsDuplicating( false );
						if ( newId ) {
							redirectToEdit( newId );
						}
					};

					return (
						<form onSubmit={ onSubmit }>
							<VStack spacing={ 5 }>
								<Text>
									{ __(
										'Are you sure you want to duplicate this shipping method?',
										'syzenlabs-quantity-limits'
									) }
								</Text>
								<HStack
									expanded={ false }
									justify="end"
									spacing={ 4 }
								>
									<Button
										variant="tertiary"
										onClick={ closeModal }
										disabled={ isDuplicating }
									>
										{ __( 'Cancel', 'syzenlabs-quantity-limits' ) }
									</Button>
									<Button
										variant="primary"
										type="submit"
										isBusy={ isDuplicating }
									>
										{ isDuplicating
											? __(
													'Duplicating…',
													'syzenlabs-quantity-limits'
											  )
											: __(
													'Duplicate',
													'syzenlabs-quantity-limits'
											  ) }
									</Button>
								</HStack>
							</VStack>
						</form>
					);
				},
			},
			{
				id: 'delete',
				label: ( items ) =>
					items?.length > 1
						? __( 'Delete Methods', 'syzenlabs-quantity-limits' )
						: __( 'Delete Method', 'syzenlabs-quantity-limits' ),
				icon: <Icon icon={ trash } />,
				supportsBulk: true,
				modalHeader: ( items ) =>
					_n(
						'Delete Shipping Method',
						'Delete Shipping Methods',
						items.length,
						'syzenlabs-quantity-limits'
					),

				RenderModal: ( { items, closeModal } ) => {
					const [ isDeleting, setIsDeleting ] = useState( false );

					const onSubmit = async ( event ) => {
						event.preventDefault();
						setIsDeleting( true );
						await Promise.all(
							items.map( ( item ) => deleteRule( item.id ) )
						);
						closeModal();
						setIsDeleting( false );
					};
					return (
						<form onSubmit={ onSubmit }>
							<VStack spacing={ 5 }>
								<Text>
									{ _n(
										'Are you sure you want to delete this shipping method? This action cannot be undone.',
										'Are you sure you want to delete selected shipping methods? This action cannot be undone.',
										items.length,
										'syzenlabs-quantity-limits'
									) }
								</Text>
								<HStack
									expanded={ false }
									justify="end"
									spacing={ 4 }
								>
									<Button
										variant="tertiary"
										onClick={ closeModal }
										disabled={ isDeleting }
									>
										{ __( 'Cancel', 'syzenlabs-quantity-limits' ) }
									</Button>
									<Button
										variant="primary"
										type="submit"
										isDestructive
										isBusy={ isDeleting }
									>
										{ isDeleting
											? __( 'Deleting…', 'syzenlabs-quantity-limits' )
											: __( 'Delete', 'syzenlabs-quantity-limits' ) }
									</Button>
								</HStack>
							</VStack>
						</form>
					);
				},
			},
		];
	}, [ deleteRule, duplicateRule, redirectToEdit ] );

	if ( ruleState.initialLoading ) {
		return (
			<HStack alignment="center">
				<Spinner />
			</HStack>
		);
	}

	return (
		<DataViews
			data={ pageData }
			fields={ fields }
			view={ view }
			onChangeView={ ( nextView ) => {
				setState( ( prev ) => ( {
					...prev,
					currentPage: nextView.page,
					perPage: nextView.perPage,
					bulkAllSelected: false,
					bulkSelectedItems: [],
				} ) );
			} }
			defaultLayouts={ {
				table: {
					showMedia: true,
					enableMoving: false,
					density: 'comfortable',
				},
			} }
			actions={ actions }
			paginationInfo={ paginationInfo }
			selection={ selection }
			onChangeSelection={ ( nextSelection ) => {
				const selectedIds = ( nextSelection || [] ).map( ( id ) =>
					String( id )
				);

				const pageIds = pageData.map( ( r ) => String( r.id ) );
				const allSelectedOnPage =
					pageIds.length > 0 &&
					pageIds.every( ( id ) => selectedIds.includes( id ) );

				setState( ( prev ) => ( {
					...prev,
					bulkSelectedItems: selectedIds,
					bulkAllSelected: allSelectedOnPage,
				} ) );
			} }
			getItemId={ ( item ) => String( item.id ) }
			config={ { perPageSizes: [ 10, 20, 50, 100 ] } }
		>
			<DataViews.Layout />
			<Divider />
			<HStack className="px-8 py-3">
				<DataViews.BulkActionToolbar />
				<DataViews.Pagination />
			</HStack>
		</DataViews>
	);
}
