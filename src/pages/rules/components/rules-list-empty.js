import { getBaseUrl } from '@/utils';
import { wpConfig } from '@/utils/wpc-config';
import {
	Button,
	Icon,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { plus } from '@wordpress/icons';

export function RulesListEmpty() {
	return (
		<VStack alignment="center" spacing={ 6 } className="py-[53.6px]">
			<img
				src={ getBaseUrl( 'assets/img/shipping-rules-empty-list.png' ) }
				width="200"
				height="167"
				alt={ __(
					'Wow Shipping Methods Empty List',
					'syzenlabs-quantity-limits'
				) }
			/>
			<VStack spacing={ 2 } alignment="center">
				<Text
					size={ wpConfig.size.xl }
					weight={ wpConfig.weight.medium }
					lineHeight={ wpConfig.lineHeight.m }
				>
					{ __(
						"You Haven't Created Any Rules",
						'syzenlabs-quantity-limits'
					) }
				</Text>

				<Text
					size={ wpConfig.size.m }
					weight={ wpConfig.weight.regular }
					lineHeight={ wpConfig.lineHeight.s }
					variant="muted"
				>
					{ __(
						'Rules let you control quantity and price based on cart value, weight, quantity, and more.',
						'syzenlabs-quantity-limits'
					) }
				</Text>
			</VStack>
			<Button
				__next40pxDefaultSize
				variant="primary"
				href="#rule-add"
				icon={ <Icon icon={ plus } /> }
				iconPosition="left"
			>
				{ __( 'Add Rule', 'syzenlabs-quantity-limits' ) }
			</Button>
		</VStack>
	);
}
