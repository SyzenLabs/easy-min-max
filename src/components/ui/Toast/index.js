import { SnackbarList } from '@wordpress/components';
import { createPortal } from '@wordpress/element';

// import './style.scss';

function ToastContainer( { toasts, removeToast } ) {
	const notices = toasts.map( ( toast ) => ( {
		id: toast.id,
		content: toast.message,
		actions: [],
		explicitDismiss: true,
		spokenMessage: toast.message,
	} ) );

	return createPortal(
		<SnackbarList
			className="right-[20px] bottom-[50px] w-fit! z-[99999]!"
			notices={ notices }
			onRemove={ removeToast }
		/>,
		document.body
	);
}

export { ToastContainer };
