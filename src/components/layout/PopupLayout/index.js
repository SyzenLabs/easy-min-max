import { useEffect } from '@wordpress/element';

const PopupLayout = ( { children } ) => {
	useEffect( () => {
		document.documentElement.classList.add( 'syzeql-popup-layout-open' );
		return () => {
			document.documentElement.classList.remove(
				'syzeql-popup-layout-open'
			);
		};
	}, [] );

	return <div className="syzeql-popup-layout">{ children }</div>;
};

const PopupLayoutHeader = ( { children } ) => {
	return (
		<div className="syzeql-popup-layout-header">
			<div className="syzeql-popup-layout-header-inner">{ children }</div>
		</div>
	);
};

const PopupLayoutBody = ( { children } ) => {
	return <div className="syzeql-popup-layout-body">{ children }</div>;
};

export { PopupLayout, PopupLayoutBody, PopupLayoutHeader };

