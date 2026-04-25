import { Button, Icon, Modal } from '@wordpress/components';

import { useState } from '@wordpress/element';

import { ProPromotion } from '@/components/others';
import icons from '@/utils/icons';
import { __ } from '@wordpress/i18n';

const ProButton = ( { className = '' } ) => {
	const [ isProModalOpen, setIsProModalOpen ] = useState( false );
	return (
		<>
			<Button
				__next40pxDefaultSize
				variant="secondary"
				icon={ <Icon icon={ icons.pro } /> }
				onClick={ () => setIsProModalOpen( true ) }
				className={ `syzeql-upgrade-pro-button ${ className }` }
			>
				{ __( 'Upgrade to Pro', 'syzenlabs-quantity-limits' ) }
			</Button>
			{ isProModalOpen && (
				<Modal
					className="syzeql-pro-modal-component"
					size="large"
					onRequestClose={ () => setIsProModalOpen( false ) }
					shouldCloseOnEsc
				>
					<ProPromotion hash="#pricing" />
				</Modal>
			) }
		</>
	);
};

export { ProButton };

