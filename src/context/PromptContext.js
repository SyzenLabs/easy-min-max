import { Prompt } from '@/components/ui';
import {
    createContext,
    useCallback,
    useContext,
    useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const PromptContext = createContext();

export const usePrompt = () => {
	const context = useContext( PromptContext );
	if ( ! context ) {
		throw new Error(
			__(
				'usePrompt must be used within a PromptProvider',
				'easy-min-max'
			)
		);
	}
	return context;
};

export const PromptProvider = ( { children } ) => {
	const [ state, setState ] = useState( {
		isOpen: false,
		title: '',
		message: '',
		type: '', // success, warning, danger, info
		confirmText: '',
		confirmButtonDesign: '',
		cancelText: '',
		resolve: () => {},
		reject: () => {},
	} );

	const firePrompt = useCallback(
		( {
			title = __( 'Confirm Action', 'easy-min-max' ),
			message = __(
				'This can’t be undone. Are you sure you want to continue?',
				'easy-min-max'
			),
			type = 'danger', // success, warning, danger, info
			confirmText = __( 'Confirm', 'easy-min-max' ),
			confirmButtonDesign = 'error',
			cancelText = __( 'Cancel', 'easy-min-max' ),
		} ) => {
			return new Promise( ( resolve, reject ) => {
				setState( ( prev ) => ( {
					...prev,
					isOpen: true,
					title,
					message,
					type,
					confirmText,
					confirmButtonDesign,
					cancelText,
					resolve,
					reject,
				} ) );
			} );
		},
		[]
	);

	const close = useCallback( () => {
		setState( ( prev ) => ( {
			...prev,
			isOpen: false,
		} ) );
	}, [] );

	const handleConfirm = useCallback( () => {
		state.resolve( { ok: true } );
		close();
	}, [ close, state ] );

	const handleCancel = useCallback( () => {
		state.resolve( { ok: false } );
		close();
	}, [ close, state ] );

	const value = {
		state,
		firePrompt,
		close,
	};

	return (
		<PromptContext.Provider value={ value }>
			{ children }
			{ state.isOpen && (
				<Prompt
					title={ state.title }
					message={ state.message }
					type={ state.type }
					confirmText={ state.confirmText }
					confirmButtonDesign={ state.confirmButtonDesign }
					cancelText={ state.cancelText }
					onConfirm={ handleConfirm }
					onCancel={ handleCancel }
				/>
			) }
		</PromptContext.Provider>
	);
};
