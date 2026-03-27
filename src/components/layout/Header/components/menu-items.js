import { useNav } from '@/context/NavContext';
import { getMenuItems } from '@/utils/constants';
import {
	Button,
	__experimentalDivider as Divider,
	DropdownMenu,
	__experimentalHStack as HStack,
	MenuGroup,
	MenuItemsChoice,
} from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const wpIconByName = {
	connect: 'admin-plugins',
};

const MenuItems = () => {
	const { currentNav, setCurrentNav } = useNav();

	const menuItems = getMenuItems();

	return (
		<HStack
			spacing={ 2 }
			expanded={ false }
			alignment="stretch"
			className="eamm-header-menu-items hidden! lg:flex!"
		>
			{ menuItems.map( ( item, index ) => {
				if ( item.divider ) {
					return (
						<Divider
							margin={ '1' }
							orientation="vertical"
							key={ `divider-${ index }` }
						/>
					);
				}
				return (
					<Button
						__next40pxDefaultSize
						key={ item.to }
						variant={ 'tertiary' }
						isPressed={ currentNav === item.to }
						icon={ wpIconByName[ item.leftIcon ] }
						iconPosition="left"
						onClick={ () => setCurrentNav( item.to ) }
						onMouseDown={ ( e ) => {
							if ( e.button === 1 ) {
								e.preventDefault();
								window.open(
									`${
										String( window.location.href ).split(
											'#'
										)[ 0 ]
									}#${ item.to }`,
									'_blank'
								);
							}
						} }
					>
						{ item.label }
					</Button>
				);
			} ) }
		</HStack>
	);
};

const HamburgerMenu = () => {
	const { currentNav, setCurrentNav } = useNav();

	const mobileMenuChoiceGroups = useMemo( () => {
		const menuItems = getMenuItems();
		return menuItems.reduce(
			( groups, item ) => {
				if ( item.divider ) {
					if ( groups[ groups.length - 1 ]?.length ) {
						groups.push( [] );
					}
					return groups;
				}

				groups[ groups.length - 1 ].push( {
					value: item.to,
					label: item.label,
				} );

				return groups;
			},
			[ [] ]
		);
	}, [] );

	return (
		<DropdownMenu
			className="lg:hidden!"
			icon="menu"
			label={ __( 'Navigation menu', 'easy-min-max' ) }
			toggleProps={ {
				variant: 'tertiary',
			} }
		>
			{ () => (
				<>
					{ mobileMenuChoiceGroups.map( ( choices, index ) => {
						if ( ! choices?.length ) {
							return null;
						}

						return (
							<MenuGroup key={ index }>
								<MenuItemsChoice
									choices={ choices }
									value={ currentNav }
									onSelect={ ( nextNav ) =>
										setCurrentNav( nextNav )
									}
								/>
							</MenuGroup>
						);
					} ) }
				</>
			) }
		</DropdownMenu>
	);
};

export { HamburgerMenu, MenuItems };
