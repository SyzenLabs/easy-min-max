import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
} from '@wordpress/components';

import { WtrsBadge } from '@/components/ui';
import { useNav } from '@/context/NavContext';
import { getBaseUrl, getVersion } from '@/utils';
import { HamburgerMenu, MenuItems } from './components/menu-items';

export default function Header() {
	const { setCurrentNav } = useNav();

	return (
		<>
			<Card isRounded={ false }>
				<CardBody
					size={ {
						blockStart: 'small',
						blockEnd: 'small',
						inlineStart: 'xSmall',
						inlineEnd: 'xSmall',
					} }
				>
					<div className="grid grid-cols-3 py-3 syzeql-container">
						<div className="flex items-center gap-3">
							<HamburgerMenu />

							{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */ }
							<img
								className="cursor-pointer w-13! h-13! hidden! lg:block!"
								src={ getBaseUrl( 'assets/img/logo-icon.svg' ) }
								alt=""
								onClick={ () => setCurrentNav( 'overview' ) }
							/>
							<span className="text-2xl font-semibold">
								Easy Min Max
							</span>
							<WtrsBadge>{ getVersion() }</WtrsBadge>
						</div>

						<MenuItems />

						<HStack spacing={ 2 } expanded={ false }>
							{ /* <AiButton /> */ }
						</HStack>
					</div>
				</CardBody>
			</Card>
		</>
	);
}
