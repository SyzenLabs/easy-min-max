import { useNav } from '@/context/NavContext';
import { useRuleStore } from '@/store/useRuleStore';
import { getBaseUrl } from '@/utils';
import { wpConfig } from '@/utils/wpc-config';
import {
    Button,
    Card,
    CardBody,
    __experimentalHStack as HStack,
    __experimentalText as Text,
    __experimentalVStack as VStack,
} from '@wordpress/components';
import { useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const REVIEW_URL =
	'https://wordpress.org/support/plugin/easy-min-max/reviews?rate=5#new-post';

const featureItems = [
	__(
		'Set minimum and maximum quantity rules for products.',
		'easy-min-max'
	),
	__(
		'Limit orders by price and apply step or fixed quantities.',
		'easy-min-max'
	),
	__(
		'Target rules with product, cart, customer, and location conditions.',
		'easy-min-max'
	),
];

const getRuleStatusCounts = ( rules ) => {
	return rules.reduce(
		( counts, rule ) => {
			if ( rule.publishMode === 'publish' ) {
				counts.published += 1;
			} else {
				counts.draft += 1;
			}

			return counts;
		},
		{ published: 0, draft: 0 }
	);
};

const StatsCard = ( { label, value, help } ) => (
	<Card className="h-full">
		<CardBody>
			<VStack spacing={ 2 } alignment="topLeft">
				<Text
					variant="muted"
					size={ wpConfig.size.s }
					lineHeight={ wpConfig.lineHeight.s }
				>
					{ label }
				</Text>
				<Text
					size={ wpConfig.size[ '2xl' ] }
					weight={ wpConfig.weight.medium }
					lineHeight={ wpConfig.lineHeight.xl }
				>
					{ value }
				</Text>
				<Text
					variant="muted"
					size={ wpConfig.size.s }
					lineHeight={ wpConfig.lineHeight.s }
				>
					{ help }
				</Text>
			</VStack>
		</CardBody>
	</Card>
);

const Overview = () => {
	const { setCurrentNav } = useNav();
	const { state, getRules, setInitialLoading } = useRuleStore();

	useEffect( () => {
		getRules()?.finally( () => setInitialLoading( false ) );
	}, [ getRules, setInitialLoading ] );

	const stats = useMemo( () => {
		const rules = state.rules || [];
		const counts = getRuleStatusCounts( rules );

		return {
			total: rules.length,
			published: counts.published,
			draft: counts.draft,
			recent: [ ...rules ].slice( 0, 3 ),
		};
	}, [ state.rules ] );

	return (
		<div className="mt-5! eamm-container">
			<VStack spacing={ 6 }>
				<Card>
					<CardBody>
						<div className="grid gap-6 lg:grid-cols-[1.4fr_220px] lg:items-center">
							<VStack spacing={ 4 } alignment="topLeft">
								<VStack spacing={ 2 } alignment="topLeft">
									<Text
										size={ wpConfig.size[ '2xl' ] }
										weight={ wpConfig.weight.medium }
										lineHeight={ wpConfig.lineHeight.xl }
									>
										{ __(
											'Control quantity limits with confidence',
											'easy-min-max'
										) }
									</Text>
									<Text
										size={ wpConfig.size.m }
										lineHeight={ wpConfig.lineHeight.s }
										variant="muted"
									>
										{ __(
											'Easy Min Max helps you enforce minimum and maximum quantity or price rules across your WooCommerce store without overcomplicating setup.',
											'easy-min-max'
										) }
									</Text>
								</VStack>

								<HStack spacing={ 3 } justify="left">
									<Button
										__next40pxDefaultSize
										variant="primary"
										onClick={ () =>
											setCurrentNav( 'rule-add' )
										}
									>
										{ __( 'Create Rule', 'easy-min-max' ) }
									</Button>
									<Button
										__next40pxDefaultSize
										variant="secondary"
										onClick={ () =>
											setCurrentNav( 'rules' )
										}
									>
										{ __( 'View Rules', 'easy-min-max' ) }
									</Button>
								</HStack>
							</VStack>

							<div className="flex justify-center lg:justify-end">
								<img
									src={ getBaseUrl(
										'assets/img/overview.svg'
									) }
									width="200"
									height="167"
									alt={ __(
										'Easy Min Max overview illustration',
										'easy-min-max'
									) }
								/>
							</div>
						</div>
					</CardBody>
				</Card>

				<div className="grid gap-4 md:grid-cols-3">
					<StatsCard
						label={ __( 'Total rules', 'easy-min-max' ) }
						value={ stats.total }
						help={ __(
							'All quantity and price rules in this store.',
							'easy-min-max'
						) }
					/>
					<StatsCard
						label={ __( 'Published', 'easy-min-max' ) }
						value={ stats.published }
						help={ __(
							'Rules that can affect storefront behavior.',
							'easy-min-max'
						) }
					/>
					<StatsCard
						label={ __( 'Drafts', 'easy-min-max' ) }
						value={ stats.draft }
						help={ __(
							'Rules you can finish before publishing.',
							'easy-min-max'
						) }
					/>
				</div>

				<div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
					<Card className="h-full">
						<CardBody className="h-full">
							<VStack spacing={ 4 } alignment="topLeft" className="h-full justify-between">
								<VStack spacing={ 2 } alignment="topLeft">
									<Text
										size={ wpConfig.size.xl }
										weight={ wpConfig.weight.medium }
										lineHeight={ wpConfig.lineHeight.m }
									>
										{ __(
											'What you can do with Easy Min Max',
											'easy-min-max'
										) }
									</Text>
									<Text variant="muted">
										{ __(
											'Keep your setup focused and build only the rules your store needs.',
											'easy-min-max'
										) }
									</Text>
								</VStack>

								<VStack spacing={ 3 } alignment="topLeft">
									{ featureItems.map( ( item ) => (
										<HStack
											key={ item }
											spacing={ 3 }
											justify="left"
											alignment="top"
										>
											<div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#2271b1]" />
											<Text>{ item }</Text>
										</HStack>
									) ) }
								</VStack>
							</VStack>
						</CardBody>
					</Card>

					<Card className="h-full">
						<CardBody>
							<VStack spacing={ 4 } alignment="topLeft">
								<VStack spacing={ 2 } alignment="topLeft">
									<Text
										size={ wpConfig.size.xl }
										weight={ wpConfig.weight.medium }
										lineHeight={ wpConfig.lineHeight.m }
									>
										{ __(
											'Enjoying Easy Min Max?',
											'easy-min-max'
										) }
									</Text>
									<Text variant="muted">
										{ __(
											'If Easy Min Max is helping you manage quantity rules more smoothly, a quick review on WordPress.org helps more store owners discover it.',
											'easy-min-max'
										) }
									</Text>
								</VStack>

								<VStack spacing={ 3 } alignment="topLeft">
									<Button
										__next40pxDefaultSize
										variant="primary"
										href={ REVIEW_URL }
										target="_blank"
									>
										{ __(
											'Review on WordPress.org',
											'easy-min-max'
										) }
									</Button>
								</VStack>
							</VStack>
						</CardBody>
					</Card>
				</div>
			</VStack>
		</div>
	);
};

export default Overview;
