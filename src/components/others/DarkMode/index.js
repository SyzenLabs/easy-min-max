import { isDarkMode } from '@/utils';
import { Button, Icon, Tooltip } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { shadow } from '@wordpress/icons';

const DarkModeToggle = () => {
	const [ isLoading, setIsLoading ] = useState( false );

	useEffect( () => {
		const userPref = localStorage.getItem( 'eamm-theme' );

		// if missing then set light
		if ( ! userPref ) {
			return localStorage.setItem( 'eamm-theme', 'light' );
		}

		// get system preference
		const systemPref = window.matchMedia(
			'(prefers-color-scheme: dark)'
		).matches;

		if ( userPref === 'dark' || ( ! userPref && systemPref ) ) {
			document.documentElement.setAttribute( 'data-theme', 'dark' );
		} else {
			document.documentElement.setAttribute( 'data-theme', 'light' );
		}

		const mediaQuery = window.matchMedia( '(prefers-color-scheme: dark)' );
		const listener = ( e ) => {
			if ( ! localStorage.getItem( 'eamm-theme' ) ) {
				document.documentElement.setAttribute(
					'data-theme',
					e.matches ? 'dark' : 'light'
				);
			}
		};
		mediaQuery.addEventListener( 'change', listener );

		return () => mediaQuery.removeEventListener( 'change', listener );
	}, [] );

	const toggleTheme = () => {
		setIsLoading( true );
		const newTheme = ! isDarkMode();
		localStorage.setItem( 'eamm-theme', newTheme ? 'dark' : 'light' );
		window.location.reload();
	};

	return (
		<Tooltip
			text={
				isDarkMode()
					? __( 'Switch to Light Mode', 'easy-min-max' )
					: __( 'Switch to Dark Mode', 'easy-min-max' )
			}
		>
			<Button
				__next40pxDefaultSize
				variant="secondary"
				isBusy={ isLoading }
				icon={ <Icon icon={ shadow } /> }
				onClick={ toggleTheme }
			></Button>
		</Tooltip>
	);
};

export default DarkModeToggle;
