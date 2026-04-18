import { useEffect } from '@wordpress/element';

const PopupLayout = ( { children } ) => {
	useEffect( () => {
		document.documentElement.classList.add( 'szql-popup-layout-open' );
		return () => {
			document.documentElement.classList.remove(
				'szql-popup-layout-open'
			);
		};
	}, [] );

	return <div className="szql-popup-layout">{ children }</div>;
};

const PopupLayoutHeader = ( { children } ) => {
	return (
		<div className="szql-popup-layout-header">
			<div className="szql-popup-layout-header-inner">{ children }</div>
		</div>
	);
};

const PopupLayoutBody = ( { children } ) => {
	return <div className="szql-popup-layout-body">{ children }</div>;
};

export { PopupLayout, PopupLayoutBody, PopupLayoutHeader };

