import { ToastContainer } from '@/components/ui';
import { getUuid } from '@/utils';
import {
    createContext,
    useCallback,
    useContext,
    useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const ToastContext = createContext();

export const useToast = () => {
	const context = useContext( ToastContext );
	if ( ! context ) {
		throw new Error(
			__(
				'useToast must be used within a ToastProvider',
				'syzenlabs-quantity-limits'
			)
		);
	}
	return context;
};

export const ToastProvider = ( { children } ) => {
	const [ toasts, setToasts ] = useState( [] );

	const removeToast = useCallback( ( id ) => {
		setToasts( ( prev ) => prev.filter( ( toast ) => toast.id !== id ) );
	}, [] );

	const showToast = useCallback(
		( message, type = 'info', duration = 3000 ) => {
			const id = getUuid();
			const newToast = {
				id,
				message,
				type,
				duration,
			};

			setToasts( ( prevToasts ) => {
				const updatedToasts = [ newToast, ...prevToasts ];
				return updatedToasts.slice( 0, 3 );
			} );

			if ( duration > 0 ) {
				setTimeout( () => {
					removeToast( id );
				}, duration );
			}

			return () => removeToast( id );
		},
		[ removeToast ]
	);

	const value = {
		showToast,
	};

	return (
		<ToastContext.Provider value={ value }>
			{ children }
			<ToastContainer toasts={ toasts } removeToast={ removeToast } />
		</ToastContext.Provider>
	);
};
