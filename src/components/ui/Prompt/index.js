import { wpConfig } from '@/utils/wpc-config';
import {
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

// import './style.scss';

function Prompt( {
	title = __( 'Delete Action' ),
	message = __(
		'This action can’t be undone. Are you sure you want to continue?'
	),
	confirmText = __( 'Delete' ),
	cancelText = __( 'Cancel' ),
	onConfirm,
	onCancel,
	isOpen = true,
} ) {
	const fullMessage = title ? (
		<>
			<Text
				weight={ wpConfig.weight.medium }
				size={ wpConfig.size.xl }
				as="p"
				className="mb-2!"
			>
				{ title }
			</Text>

			<Text
				weight={ wpConfig.weight.regular }
				size={ wpConfig.size.m }
				as="p"
				// className="mb-2!"
			>
				{ message }
			</Text>
		</>
	) : (
		message
	);

	return (
		<ConfirmDialog
			// isOpen={ isOpen }
			onConfirm={ onConfirm }
			onCancel={ onCancel }
			cancelButtonText={ cancelText }
			confirmButtonText={ confirmText }
		>
			{ fullMessage }
		</ConfirmDialog>
	);
}

export { Prompt };
