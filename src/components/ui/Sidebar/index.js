// import { Button } from '@/components/ui';
import { cn } from '@/utils';
import {
    Button,
    __experimentalElevation as Elevation,
} from '@wordpress/components';
import {
    createContext,
    forwardRef,
    useContext,
    useEffect,
    useImperativeHandle,
    useState,
} from '@wordpress/element';
import { close } from '@wordpress/icons';
// import './style.scss';

const SidebarContext = createContext();

function useSidebar() {
	return useContext( SidebarContext );
}

function SidebarProvider( { children, onClose } ) {
	const [ open, setOpen ] = useState( false );

	const openModal = () => {
		setOpen( true );
	};

	const closeModal = () => {
		setOpen( false );
		onClose && onClose();
	};

	return (
		<SidebarContext.Provider
			value={ {
				open,
				setOpen,
				openModal,
				closeModal,
			} }
		>
			{ children }
		</SidebarContext.Provider>
	);
}

function Sidebar( { children, onClose, className = '', ...props } ) {
	return (
		<SidebarProvider onClose={ onClose }>
			<div
				className={ cn( 'syzeql-sidebar-component', className ) }
				{ ...props }
			>
				{ children }
			</div>
		</SidebarProvider>
	);
}

const SidebarTrigger = forwardRef(
	( { children, className = '', ...props }, ref ) => {
		const { openModal, closeModal } = useSidebar();

		useImperativeHandle( ref, () => ( {
			openModal,
			closeModal,
		} ) );

		return (
			<div
				role="button"
				tabIndex={ -1 }
				className={ cn( 'syzeql-sidebar-trigger-component', className ) }
				{ ...props }
				onClick={ openModal }
				onKeyDown={ ( e ) => {
					if ( e.key === 'Enter' || e.key === ' ' ) {
						openModal();
					}
				} }
			>
				{ children }
			</div>
		);
	}
);

function SidebarContent( { children, className = '', ...props } ) {
	const { open, closeModal } = useSidebar();

	// click outside syzeql-sidebar-content-inner will close
	useEffect( () => {
		const handleClickOutside = ( event ) => {
			if (
				event.target.classList.contains(
					'syzeql-sidebar-content-component'
				)
			) {
				closeModal();
			}
		};
		document.addEventListener( 'mousedown', handleClickOutside );
		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside );
		};
	}, [ closeModal ] );

	return (
		<div
			className={ cn(
				'syzeql-sidebar-content-component',
				className,
				open && 'syzeql-sidebar-content-open'
			) }
			{ ...props }
		>
			<div
				className="syzeql-sidebar-content-inner"
				style={ {
					position: 'relative',
				} }
			>
				{ open && children }
				<Elevation value={ 5 } />
			</div>
		</div>
	);
}

function SidebarHeader( {
	children,
	divider = false,
	className = '',
	...props
} ) {
	const { closeModal } = useSidebar();
	return (
		<div
			className={ cn(
				'syzeql-sidebar-header-component',
				className,
				divider && 'syzeql-sidebar-header-divider'
			) }
			{ ...props }
		>
			{ children }
			<Button
				__next40pxDefaultSize
				// className="syzeql-sidebar-header-close"
				onClick={ closeModal }
				icon={ close }
				variant="tertiary"
				isDestructive
			></Button>
		</div>
	);
}

function SidebarFooter( {
	showCancel = false,
	cancelText = 'Cancel',
	children,
	className = '',
	...props
} ) {
	const { closeModal } = useSidebar();
	return (
		<div
			className={ cn( 'syzeql-sidebar-footer-component', className ) }
			{ ...props }
		>
			{ showCancel && (
				<Button variant="tertiary" onClick={ closeModal }>
					{ cancelText }
				</Button>
			) }
			{ children }
		</div>
	);
}

function SidebarBody( { children, className = '', ...props } ) {
	return (
		<div
			className={ cn( 'syzeql-sidebar-body-component', className ) }
			{ ...props }
		>
			{ children }
		</div>
	);
}

export {
    Sidebar,
    SidebarBody,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarTrigger
};

