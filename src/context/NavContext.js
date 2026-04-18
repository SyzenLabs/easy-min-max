import {
    createContext,
    useContext,
    useEffect,
    useState,
} from '@wordpress/element';

const NavContext = createContext();

export const useNav = () => {
	const context = useContext( NavContext );
	if ( ! context ) {
		throw new Error( 'useNav must be used within an AddonProvider' );
	}
	return context;
};

const handlePageHash = ( url ) => {
	let hash = 'overview';
	if ( url ) {
		const currUrl = new URL( window.location.href );
		if ( currUrl.searchParams.get( 'page' ) === 'szql-dashboard' ) {
			hash = currUrl.hash.replace( '#', '' );
		}
	}
	return hash || 'overview';
};

export const NavProvider = ( { children } ) => {
	const onLoadPage = handlePageHash( window.location?.href );
	const [ currentNav, setCurrentNav ] = useState( onLoadPage );

	const value = {
		currentNav,
		setCurrentNav,
		handlePageHash,
	};

	useEffect( () => {
		if ( currentNav === 'lists' ) {
			if ( ! window.location.hash?.includes( `#${ currentNav }` ) ) {
				window.location.hash = currentNav;
			}
		} else if ( window.location.hash !== `#${ currentNav }` ) {
			window.location.hash = currentNav;
		}
		window.scrollTo( 0, 0 );
	}, [ currentNav ] );

	useEffect( () => {
		const checkUrlChange = () => {
			let hash = window.location.hash;
			hash = hash.includes( '#lists/' ) ? hash.split( '/' )[ 0 ] : hash;
			setCurrentNav( hash.replace( '#', '' ) );
			window.scrollTo( 0, 0 );
		};

		window.addEventListener( 'popstate', checkUrlChange );
		window.addEventListener( 'pushstate', checkUrlChange );

		return () => {
			window.removeEventListener( 'popstate', checkUrlChange );
			window.removeEventListener( 'pushstate', checkUrlChange );
		};
	}, [] );

	return (
		<NavContext.Provider value={ value }>{ children }</NavContext.Provider>
	);
};
