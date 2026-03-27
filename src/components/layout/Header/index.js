import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
} from '@wordpress/components';

import { WtrsBadge } from '@/components/ui';
import { useNav } from '@/context/NavContext';
import { getBaseUrl, getVersion, isDarkMode } from '@/utils';
import Hellobar from '@/utils/hello-bar';
import { AiButton } from './components/ai-button';
import { HamburgerMenu, MenuItems } from './components/menu-items';

export default function Header() {
	const { setCurrentNav } = useNav();

	return (
		<>
			<Hellobar />
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
								className="cursor-pointer w-7.5! h-7.5! hidden! lg:block!"
								src={ getBaseUrl( 'assets/img/logo-icon.svg' ) }
								width="30px"
								height="30px"
								alt="wowshipping logo"
								onClick={ () => setCurrentNav( 'overview' ) }
							/>
							{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */ }
							<img
								className="cursor-pointer w-auto! h-4.75!"
								src={ getBaseUrl(
									`${
										isDarkMode()
											? 'assets/img/logo-text-dark.svg'
											: 'assets/img/logo-text.svg'
									}`
								) }
								width="116px"
								height="19px"
								alt="wowshipping text"
								onClick={ () => setCurrentNav( 'overview' ) }
							/>
							<WtrsBadge>{ getVersion() }</WtrsBadge>
						</HStack>

						<MenuItems />

						<HStack spacing={ 2 } expanded={ false }>
							<AiButton />
						</HStack>
					</HStack>
				</CardBody>
			</Card>
		</>
	);
}
