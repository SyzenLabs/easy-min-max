import { Skeleton } from '@/components/ui';
import { useEffect, useMemo, useState } from '@wordpress/element';

import { RulesListEmpty } from './components/rules-list-empty';
import { RulesListHeader } from './components/rules-list-header';

import {
    Button,
    Card,
    CardBody,
    CardHeader,
    __experimentalHStack as HStack,
    Spinner,
    __experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { useRuleStore } from '@/store/useRuleStore';
import { wpConfig } from '@/utils/wpc-config';
import RulesDataView from './components/rules-dataview';

function RulesListHeaderSkeleton() {
	return (
		<HStack wrap={ true }>
			<HStack
				spacing={ 2 }
				wrap={ true }
				justify="start"
				expanded={ false }
			>
				<Skeleton width="160px" height="38px" />
				<Skeleton width="58px" height="38px" />
				<Skeleton width="160px" height="38px" />
			</HStack>
			<HStack
				spacing={ 2 }
				justify="start"
				expanded={ false }
				wrap={ true }
			>
				<Skeleton width="253px" height="38px" />
				<Skeleton width="92px" height="38px" />
				<Skeleton width="92px" height="38px" />
			</HStack>
		</HStack>
	);
}

export default function ShippingRules() {
	const { getRules, state: ruleState, setInitialLoading } = useRuleStore();

	const [ state, setState ] = useState( {
		currentPage: 1,
		perPage: 10,
		totalItems: 0,
		searchQuery: '',
		filterStatus: 'all',
		filterDate: '',
		bulkAction: '',
		bulkAllSelected: false,
		bulkSelectedItems: [],
		showImportPopup: false,
	} );

	useEffect( () => {
		setInitialLoading( true );
		getRules().finally( () => {
			setInitialLoading( false );
		} );
	}, [ getRules, setInitialLoading ] );

	// filter rules based on custom logic
	const filteredRules = useMemo( () => {
		if ( ! ruleState.rules?.length ) {
			return [];
		}

		let data = ruleState.rules;

		// search filter
		if ( state.searchQuery ) {
			data = data.filter( ( rule ) => {
				return String( rule?.title || '' )
					.toLowerCase()
					.includes( String( state.searchQuery ).toLowerCase() );
			} );
		}

		// status filter
		if ( state.filterStatus !== 'all' ) {
			data = data.filter( ( rule ) => {
				return (
					String( rule?.status ).toLowerCase() ===
					state.filterStatus.toLowerCase()
				);
			} );
		}

		return data;
	}, [ state.searchQuery, state.filterStatus, ruleState.rules ] );

	return (
		<div className="mt-5! syzeql-container">
			<HStack wrap={ true }>
				<Text
					weight={ wpConfig.weight.medium }
					size={ wpConfig.size[ '2xl' ] }
					lineHeight={ wpConfig.lineHeight[ '2xl' ] }
				>
					{ __( 'Manage Rules', 'syzenlabs-quantity-limits' ) }
				</Text>

				<Button
					__next40pxDefaultSize
					iconPosition="left"
					icon={ 'plus-alt2' }
					href="#rule-add"
					variant="primary"
				>
					{ __( 'Add Rule', 'syzenlabs-quantity-limits' ) }
				</Button>
			</HStack>
			<Card className="mt-6!">
				<CardHeader className="p-6!">
					{ ruleState.initialLoading ? (
						<RulesListHeaderSkeleton />
					) : (
						<RulesListHeader
							state={ state }
							setState={ setState }
							filteredRules={ filteredRules }
						/>
					) }
				</CardHeader>
				<CardBody>
					{ /* eslint-disable-next-line no-nested-ternary */ }
					{ ruleState.initialLoading ? (
						<HStack alignment="center">
							<Spinner />
						</HStack>
					) : filteredRules.length > 0 ? (
						<RulesDataView
							state={ state }
							setState={ setState }
							filteredRules={ filteredRules }
						/>
					) : (
						<RulesListEmpty />
					) }
				</CardBody>
			</Card>
		</div>
	);
}
