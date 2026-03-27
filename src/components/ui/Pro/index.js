import { ProPromotion } from '@/components/others';
import { cn, isProUser } from '@/utils';
import icons from '@/utils/icons';
import { Icon, Modal, Tooltip } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

function Pro( {
	icon = true,
	text = true,
	utmKey = '',
	hash = '',
	className = '',
	badgeClass = '',
} ) {
	const [ isOpen, setIsOpen ] = useState( false );

	if ( isProUser() ) {
		return null;
	}

	return (
		<>
			<Tooltip text={ __( 'Pro Feature', 'easy-min-max' ) }>
				<_ProButton
					className={ badgeClass }
					onClick={ ( e ) => {
						e.stopPropagation();
						setIsOpen( true );
					} }
					icon={ icon }
					text={ text }
				/>
			</Tooltip>
			{ isOpen && (
				<Modal
					isOpen={ isOpen }
					size="large"
					onRequestClose={ () => setIsOpen( false ) }
					className={ cn( 'eamm-pro-modal-component', className ) }
				>
					<ProPromotion utmKey={ utmKey } hash={ hash } />
				</Modal>
			) }
		</>
	);
}
// private component
function _ProButton( { icon = true, text = true, className = '', ...props } ) {
	return (
		<div
			className={ cn(
				'eamm-pro-button-component',
				! text && 'eamm-pro-button-icon-only',
				className
			) }
			{ ...props }
		>
			{ icon && (
				<Icon
					className="fill-white! eamm-pro-button-icon"
					icon={ icons.pro }
					width="16px"
					height="16px"
				/>
			) }
			{ text && <div className="eamm-pro-button-text">Pro</div> }
		</div>
	);
}

function ButtonProBadge( {
	children,
	utmKey = '',
	hash = '',
	showPro,
	dir = 'left',
} ) {
	const classes = cn( 'absolute top-0 -translate-y-1/2', {
		'right-0 translate-x-1/2': dir === 'right',
		'left-0 -translate-x-1/2': dir === 'left',
	} );

	return (
		<div className="relative">
			{ children }
			{ showPro && (
				<Pro
					badgeClass={ classes }
					text={ false }
					utmKey={ utmKey }
					hash={ hash }
				/>
			) }
		</div>
	);
}

export { ButtonProBadge, Pro };
