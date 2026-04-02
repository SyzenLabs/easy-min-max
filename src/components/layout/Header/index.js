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
					<HStack className="py-3 eamm-container">
						<HStack spacing={ 3 } expanded={ false }>
							<HamburgerMenu />

							{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */ }
							<img
								className="cursor-pointer w-9! h-9! hidden! lg:block!"
								src={ getBaseUrl( 'assets/img/logo-icon.svg' ) }
								width="30px"
								height="30px"
								alt="wowshipping logo"
								onClick={ () => setCurrentNav( 'overview' ) }
							/>
							<span className="text-2xl font-semibold">
								Easy Min Max
							</span>
							<WtrsBadge>{ getVersion() }</WtrsBadge>
						</HStack>

						<MenuItems />

						<HStack spacing={ 2 } expanded={ false }>
							{ /* <AiButton /> */ }
						</HStack>
					</HStack>
				</CardBody>
			</Card>
		</>
	);
}
