import { useEffect } from '@wordpress/element';

const PopupLayout = ( { children } ) => {
	useEffect( () => {
		document.documentElement.classList.add( 'eamm-popup-layout-open' );
		return () => {
			document.documentElement.classList.remove(
				'eamm-popup-layout-open'
			);
		};
	}, [] );

	return <div className="eamm-popup-layout">{ children }</div>;
};

const PopupLayoutHeader = ( { children } ) => {
	return (
		<div className="eamm-popup-layout-header">
			<div className="eamm-popup-layout-header-inner">{ children }</div>
		</div>
	);
};

const PopupLayoutBody = ( { children } ) => {
	return <div className="eamm-popup-layout-body">{ children }</div>;
};

export { PopupLayout, PopupLayoutBody, PopupLayoutHeader };
