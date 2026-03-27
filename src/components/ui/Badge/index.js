/**
 * Badge component.
 * This a part of '@wordpress/components'. As wordpress private the package, we have to copy the component here.
 * Warning: Do not modify the code unless it's necessary. Keep it in sync with the original component as much as possible.
 *
 * @module components/ui/Badge
 */
import { cn } from '@/utils';

import { Icon } from '@wordpress/components';
import { caution, error, info, published } from '@wordpress/icons';

const intentIcons = {
	info,
	success: published,
	warning: caution,
	error,
	default: null,
};

function contextBasedIcon( intent = 'default' ) {
	return intentIcons[ intent ] || null;
}

function Badge( {
	className,
	intent = 'default',
	hasIcon = false,
	icon,
	children,
	...props
} ) {
	const intentIcon = contextBasedIcon( intent );
	const iconToUse = intentIcon || icon;

	return (
		<span
			className={ cn( 'components-badge', className, {
				[ `is-${ intent }` ]: intent,
				'has-icon': hasIcon,
			} ) }
			{ ...props }
		>
			<span className="components-badge__flex-wrapper">
				{ hasIcon && iconToUse && (
					<Icon
						icon={ iconToUse }
						size={ 16 }
						fill="currentColor"
						className="components-badge__icon"
					/>
				) }
				<span className="components-badge__content">{ children }</span>
			</span>
		</span>
	);
}

export { Badge };
