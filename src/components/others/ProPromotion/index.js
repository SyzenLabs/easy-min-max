import { getBaseUrl, UTMLinkGenerator } from '@/utils';
import { PRO_FEATURES_LIST } from '@/utils/constants';
import { wpConfig } from '@/utils/wpc-config';
import {
    Button,
    __experimentalGrid as Grid,
    __experimentalHStack as HStack,
    Icon,
    __experimentalText as Text,
    __experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';

export default function ProPromotion( { utmKey = '', hash = '' } ) {
	return (
		<Grid templateColumns="300px auto" gap={ 4 }>
			<div>
				<img
					src={ getBaseUrl( 'assets/img/pro-promotion.png' ) }
					alt="wowshipping-pro-promotion"
				/>
			</div>
			<VStack>
				<VStack>
					<Text
						size={ wpConfig.size.xl }
						weight={ wpConfig.weight.medium }
					>
						{ __(
							'Scale Your Shipping Efforts with Pro!',
							'easy-min-max'
						) }
					</Text>
					<Text
						size={ wpConfig.size.s }
						weight={ wpConfig.weight.regular }
						className="mt-3"
					>
						{ __(
							'Want to improve your shipping game? Unlock the pro features to create super advanced shipping rules, connect to carriers, and a whole lot more!',
							'easy-min-max'
						) }
					</Text>
					<Text
						size={ wpConfig.size.xs }
						weight={ wpConfig.weight.medium }
						className="mt-6!"
					>
						{ __( 'WOWSHIPPING PRO', 'easy-min-max' ) }
					</Text>
					<VStack>
						{ PRO_FEATURES_LIST.map( ( item, i ) => {
							return (
								<HStack
									key={ i }
									spacing={ 1.5 }
									expanded={ false }
									justify="start"
								>
									<Icon
										fill="var(--wp-admin-theme-color)"
										icon={ check }
									/>
									<Text>{ item }</Text>
								</HStack>
							);
						} ) }
					</VStack>
				</VStack>
				<HStack spacing={ 3 } className="mt-5">
					<Button
						className="justify-center w-full"
						__next40pxDefaultSize
						variant="primary"
						href={ UTMLinkGenerator( { utmKey, hash } ) }
						target="_blank"
					>
						{ __( 'Get Pro!', 'easy-min-max' ) }
					</Button>
					<Button
						className="justify-center w-full"
						__next40pxDefaultSize
						variant="secondary"
						href={ UTMLinkGenerator( { utmKey, hash } ) }
						target="_blank"
					>
						{ __( 'Learn More', 'easy-min-max' ) }
					</Button>
				</HStack>
			</VStack>
		</Grid>
	);
}
