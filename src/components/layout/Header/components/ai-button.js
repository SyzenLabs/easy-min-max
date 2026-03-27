import { Button, Icon, Tooltip } from '@wordpress/components';

import { GPT_LINK } from '@/utils';
import icons from '@/utils/icons';
import { __ } from '@wordpress/i18n';

export const AiButton = () => {
	return (
		<Tooltip
			text={ __( 'WowShipping AI Assitant', 'easy-min-max' ) }
		>
			<Button
				__next40pxDefaultSize
				variant="secondary"
				icon={ <Icon icon={ icons.ai } /> }
				href={ GPT_LINK }
				target="_blank"
				rel="noopener noreferrer"
				label={ __(
					'WowShipping AI Assitant',
					'easy-min-max'
				) }
			/>
		</Tooltip>
	);
};
