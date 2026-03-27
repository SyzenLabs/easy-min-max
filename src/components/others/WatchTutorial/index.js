import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const TUT_VID_LINKS = {
	zones: 'https://wpxpo.com/docs/wowshipping-docs/wowshipping-shipping-zones/',
	conditions:
		'https://wpxpo.com/docs/wowshipping-docs/create-shipping-rules/add-shipping-conditions/',
	methods:
		'https://wpxpo.com/docs/wowshipping-docs/create-shipping-rules/add-shipping-methods/',
	additional:
		'https://wpxpo.com/docs/wowshipping-docs/create-shipping-rules/additional-settings/',
	handling:
		'https://wpxpo.com/docs/wowshipping-docs/create-shipping-rules/handling-fee-settings/',
	analytics: 'https://wpxpo.com/docs/wowshipping-docs/analytics-logs/',
	default: 'https://youtube.com/@wpxpo',
};

export default function WatchTutorial( { feat = null } ) {
	return (
		<Button
			__next40pxDefaultSize
			variant="link"
			href={
				feat && TUT_VID_LINKS[ feat ]
					? TUT_VID_LINKS[ feat ]
					: TUT_VID_LINKS.default
			}
			target="_blank"
			rel="noopener noreferrer"
		>
			{ __( 'View Docs', 'easy-min-max' ) }
		</Button>
	);
}
