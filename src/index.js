import {
    createRoot,
    Fragment,
    useCallback,
    useEffect,
    useMemo,
} from '@wordpress/element';

import { Header } from '@/components/layout';

// Pages
// import DesignSystem from '@/pages/DesignSystem';
import Overview from '@/pages/overview';
import ShippingMethods from '@/pages/rules';

// Context providers
import { NavProvider, useNav } from '@/context/NavContext';
import { ShippingOptionsProvider } from '@/context/OptionsContext';
import { PromptProvider } from '@/context/PromptContext';

import { ToastProvider } from '@/context/ToastContext';
import { RuleStoreProvider } from '@/store/useRuleStore';

import { Builder } from './pages/builder';
import Settings from './pages/settings';
import './style-generated.css';
const App = () => {
	const { currentNav, setCurrentNav, handlePageHash } = useNav();

	const _fetchQuery = useCallback( () => {
		const url = new URL( window.location.href );
		if ( url.searchParams.get( 'page' ) === 'syzeql-dashboard' ) {
			setCurrentNav( handlePageHash( window.location.href ) );
		}
	}, [ setCurrentNav, handlePageHash ] );

	const handleClickOutside = useCallback(
		( e ) => {
			if (
				e.target &&
				! e.target.classList?.contains( 'ultp-reserve-button' )
			) {
				if ( e.target.href ) {
					if ( e.target.href.indexOf( 'page=syzeql-dashboard#' ) > 0 ) {
						const slug = e.target.href.split( '#' );
						if ( slug[ 1 ] ) {
							setCurrentNav( slug[ 1 ] );
							window.scrollTo( { top: 0, behavior: 'smooth' } );
						}
					}
				}
			}
		},
		[ setCurrentNav ]
	);

	useEffect( () => {
		_fetchQuery();
		document.addEventListener( 'mousedown', handleClickOutside );
		return () =>
			document.removeEventListener( 'mousedown', handleClickOutside );
	}, [ _fetchQuery, handleClickOutside ] );

	const routes = useMemo( () => {
		const _routes = [
			{
				id: 'overview',
				condition: currentNav === 'overview',
				header: true,
				component: (
					<RuleStoreProvider>
						<Overview />
					</RuleStoreProvider>
				),
			},
			{
				id: 'rules',
				condition: currentNav === 'rules',
				header: true,
				component: (
					<RuleStoreProvider>
						<ShippingOptionsProvider>
							<ShippingMethods />
						</ShippingOptionsProvider>
					</RuleStoreProvider>
				),
			},
			{
				id: 'rule-add',
				condition: currentNav === 'rule-add',
				header: true,
				component: (
					<RuleStoreProvider>
						<ShippingOptionsProvider>
							<Builder />
						</ShippingOptionsProvider>
					</RuleStoreProvider>
				),
			},
			{
				id: 'rule-edit',
				condition: currentNav.includes( 'rule-edit' ),
				header: true,
				component: (
					<RuleStoreProvider>
						<ShippingOptionsProvider>
							<Builder
								key={ currentNav.split( '/' )[ 1 ] }
								editId={ currentNav.split( '/' )[ 1 ] }
							/>
						</ShippingOptionsProvider>
					</RuleStoreProvider>
				),
			},
			{
				id: 'settings',
				condition: currentNav === 'settings',
				header: true,
				component: <Settings />,
			},
		];

		return _routes;
	}, [ currentNav ] );

	return (
		<div>
			{ routes.map( ( page ) => {
				if ( page.condition ) {
					return (
						<Fragment key={ page.id }>
							{ page.header && <Header /> }
							{ page.component }
						</Fragment>
					);
				}
				return null;
			} ) }
		</div>
	);
};

const init = () => {
	const container = document.getElementById( 'syzeql-dashboard-wrap' );
	if ( ! container ) {
		return;
	}
	const root = createRoot( container );
	root.render(
		<NavProvider>
			<PromptProvider>
				<ToastProvider>
					<App />
				</ToastProvider>
			</PromptProvider>
		</NavProvider>
	);
};

if ( document.readyState === 'complete' ) {
	init();
} else {
	document.addEventListener( 'DOMContentLoaded', init );
}
