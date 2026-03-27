import { cn, getUuid, isFreeUser } from '@/utils';
import {
    Children,
    createContext,
    createPortal,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    chevronDown,
    chevronUp,
    closeSmall,
    search as wpSearchIcon,
} from '@wordpress/icons';

// import './style.scss';

import {
    Button,
    Icon,
    __experimentalInputControl as InputControl,
    __experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
    __experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
    MenuGroup,
    MenuItem,
    Spinner,
} from '@wordpress/components';

// import {chevronDown, chevronUp} from '@wordpress/icons';

import { Pro } from '../Pro';

const SelectContext = createContext();

function SelectProvider( {
	children,
	selected: propSelected,
	onChange,
	fullWidth,
	disabled,
	selectId,
	loading,
	maxWidth,
} ) {
	const [ state, setState ] = useState( {
		internalSelected: propSelected || '',
		internalSelectedLabel: propSelected || '',
		open: false,
		searchQuery: '',
		selectId,
	} );

	useEffect( () => {
		if ( [ undefined, null, '' ].includes( propSelected ) ) {
			setState( ( prev ) => ( {
				...prev,
				internalSelected: '',
				internalSelectedLabel: '',
			} ) );
			return;
		}

		setState( ( prev ) => ( {
			...prev,
			internalSelected: propSelected,
		} ) );
	}, [ propSelected ] );

	const setSelected = ( value, label ) => {
		// Call onChange first and check if it returns false to prevent selection
		const shouldProceed = onChange?.( value );

		// If onChange returns false, don't update internal state
		if ( shouldProceed === false ) {
			return;
		}

		setState( ( prev ) => ( {
			...prev,
			internalSelected: value,
			internalSelectedLabel: label,
			open: false,
		} ) );
	};

	return (
		<SelectContext.Provider
			value={ {
				state,
				setState,
				setSelected,
				fullWidth,
				disabled,
				loading,
				maxWidth,
			} }
		>
			{ children }
		</SelectContext.Provider>
	);
}

function Select( {
	children,
	className = '',
	fullWidth = false,
	selected,
	onChange,
	disabled = false,
	loading = false,
	maxWidth,
	...props
} ) {
	const selectRef = useRef( null );

	const [ selectId, setSelectId ] = useState(
		() => `eamm-select-${ getUuid() }`
	);

	return (
		<SelectProvider
			selected={ selected }
			onChange={ onChange }
			fullWidth={ fullWidth }
			selectId={ selectId }
			disabled={ disabled }
			loading={ loading }
			maxWidth={ maxWidth }
		>
			<div
				ref={ selectRef }
				className={ cn(
					'eamm-select-component',
					className,
					fullWidth && 'w-full',
					disabled && 'eamm-is-disabled'
				) }
				data-select-id={ selectId }
				{ ...props }
			>
				{ children }
			</div>
		</SelectProvider>
	);
}

function SelectTrigger( { children, className = '', ...props } ) {
	const { state, setState, disabled, loading } = useContext( SelectContext );

	const toggleOpen = ( e ) => {
		if ( disabled ) {
			return;
		}
		e.stopPropagation();
		setState( ( prev ) => ( { ...prev, open: ! prev.open } ) );
	};

	return (
		<div
			className={ cn(
				'eamm-select-trigger-component',
				className,
				state.open && 'eamm-select-open',
				disabled && 'eamm-is-disabled'
			) }
			onClick={ toggleOpen }
			onKeyDown={ ( e ) =>
				( e.key === 'Enter' || e.key === ' ' ) && toggleOpen( e )
			}
			role="button"
			tabIndex={ 0 }
			aria-expanded={ state.open }
			{ ...props }
		>
			{ children }
			<div className="eamm-select-trigger-icons">
				{ loading && <Spinner /> }
				<Icon
					icon={ state.open ? chevronUp : chevronDown }
					width="20px"
					height="20px"
				/>
			</div>
		</div>
	);
}

function SelectValue( {
	placeholder = __( 'Select…', 'easy-min-max' ),
	className = '',
	...props
} ) {
	const { state, maxWidth } = useContext( SelectContext );

	return (
		<div
			className={ cn(
				'eamm-select-value-component',
				'truncate',
				state.internalSelected === '' &&
					'eamm-select-value-placeholder',
				className
			) }
			style={ maxWidth ? { maxWidth } : {} }
			{ ...props }
		>
			{ state.internalSelectedLabel || placeholder }
		</div>
	);
}

export function SelectSearch( { ...props } ) {
	const inputRef = useRef();
	const { state, setState } = useContext( SelectContext );

	useEffect( () => {
		if ( inputRef.current && state.open ) {
			inputRef.current.focus();
		}
	}, [ state.open ] );

	return (
		<InputControl
			__next40pxDefaultSize
			placeholder={ __( 'Search…', 'easy-min-max' ) }
			prefix={
				<InputControlPrefixWrapper>
					<Icon icon={ wpSearchIcon } />
				</InputControlPrefixWrapper>
			}
			suffix={
				<InputControlSuffixWrapper>
					{ state.searchQuery ? (
						<Button
							__next40pxDefaultSize
							label={ __(
								'Clear search',
								'easy-min-max'
							) }
							icon={ <Icon icon={ closeSmall } /> }
							onClick={ () =>
								setState( ( prev ) => ( {
									...prev,
									searchQuery: '',
								} ) )
							}
						/>
					) : null }
				</InputControlSuffixWrapper>
			}
			className="eamm-select-search-component"
			ref={ inputRef }
			value={ state.searchQuery }
			onChange={ ( value ) =>
				setState( ( prev ) => ( { ...prev, searchQuery: value } ) )
			}
			{ ...props }
		/>
	);
}

function SelectContent( { children, className = '', search, ...props } ) {
	const { state, setState } = useContext( SelectContext );
	const [ position, setPosition ] = useState( {
		top: '-100%',
		bottom: '-100%',
		left: '-100%',
		width: '0',
		height: '0',
		maxHeight: '0',
	} );
	const triggerRef = useRef( null );
	const contentRef = useRef( null );

	// update dropdown position
	useLayoutEffect( () => {
		if ( ! state.open || ! triggerRef.current ) {
			return;
		}

		const updatePosition = () => {
			const trigger = triggerRef.current.closest(
				`[data-select-id="${ state.selectId }"]`
			);
			if ( ! trigger ) {
				return;
			}

			const rect = trigger.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const dropdownHeight = Math.min( 24 * 16, viewportHeight * 0.6 ); // 24rem or 60% of viewport height
			const spaceBelow = viewportHeight - rect.bottom;
			const spaceAbove = rect.top;
			const openDown =
				spaceBelow > dropdownHeight || spaceBelow > spaceAbove;

			setPosition( {
				top: openDown ? rect.bottom + 8 : 'auto',
				bottom: openDown ? 'auto' : viewportHeight - rect.top + 8,
				left: rect.left + window.scrollX,
				width: rect.width,
				height: 'auto',
				maxHeight: `${
					openDown
						? Math.min( spaceBelow - 10, dropdownHeight )
						: Math.min( spaceAbove - 10, dropdownHeight )
				}px`,
			} );
		};

		updatePosition();
		// window.addEventListener( 'scroll', updatePosition, true );
		window.addEventListener( 'resize', updatePosition );

		return () => {
			// window.removeEventListener( 'scroll', updatePosition, true );
			window.removeEventListener( 'resize', updatePosition );
		};
	}, [ state.open, state.selectId ] );

	// Close dropdown when clicking outside
	useEffect( () => {
		const handleClickOutside = ( event ) => {
			if (
				triggerRef.current
					?.closest( `[data-select-id="${ state.selectId }"]` )
					?.contains( event.target ) ||
				contentRef.current?.contains( event.target )
			) {
				return;
			}
			setState( ( prev ) => ( { ...prev, open: false } ) );
		};

		if ( state.open ) {
			document.addEventListener( 'mousedown', handleClickOutside );
		}

		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside );
		};
	}, [ state.open, state.selectId, setState ] );

	// auto-scroll to selected item
	useEffect( () => {
		if ( ! state.open || ! contentRef.current ) {
			return;
		}

		const scrollToSelected = () => {
			const selectedItem = contentRef.current.querySelector(
				'.eamm-select-item-selected'
			);
			if ( selectedItem ) {
				// first scroll without animation to ensure immediate positioning
				selectedItem.scrollIntoView( {
					block: 'center',
					// behavior: 'smooth',
				} );

				// then apply smooth scroll if it's not the first open
				const isFirstOpen = ! contentRef.current.dataset.hasOpened;
				if ( ! isFirstOpen ) {
					selectedItem.scrollIntoView( {
						block: 'center',
					} );
				}

				// mark as opened for future interactions
				contentRef.current.dataset.hasOpened = 'true';
			}
		};

		// add a small delay to ensure the dropdown is fully rendered and positioned
		const timer = setTimeout( scrollToSelected, 0 );

		return () => clearTimeout( timer );
	}, [ state.open ] );

	const content = (
		<div
			ref={ contentRef }
			className={ cn(
				'eamm-select-content-component',
				state.open ? 'eamm-select-open' : 'eamm-select-close',
				props.fullWidth && 'w-full',
				className
			) }
			role="listbox"
			style={ {
				top: position.top,
				bottom: position.bottom,
				left: position.left,
				width: position.width,
				maxHeight: position.maxHeight,
				height: position.height,
			} }
		>
			{ search && <SelectSearch /> }
			<div className="eamm-select-content-body">
				{ children }
				{ ( () => {
					const hasVisibleOptions = () => {
						const checkVisible = ( childrenArray ) => {
							return childrenArray.some( ( child ) => {
								if ( ! child || ! child.props ) {
									return false;
								}
								if ( child.type === SelectItem ) {
									if ( ! state.searchQuery ) {
										return true;
									}
									return String( child.props.children )
										.toLowerCase()
										.includes(
											state.searchQuery.toLowerCase()
										);
								} else if ( child.type === SelectGroupItem ) {
									return checkVisible(
										Children.toArray( child.props.children )
									);
								}
								return false;
							} );
						};
						return checkVisible( Children.toArray( children ) );
					};
					return (
						! hasVisibleOptions() && (
							<div className="eamm-select-no-data">
								{ __(
									'No options found',
									'easy-min-max'
								) }
							</div>
						)
					);
				} )() }
			</div>
		</div>
	);

	return (
		<>
			<div ref={ triggerRef } style={ { display: 'none' } }>
				{ children }
			</div>
			{ state.open &&
				createPortal(
					content,
					document.getElementById( 'eamm-dashboard-wrap' )
				) }
		</>
	);
}

function SelectGroupItem( {
	children,
	label = null,
	className = '',
	...props
} ) {
	const { state } = useContext( SelectContext );

	// Recursive function to check if any descendant SelectItem is visible
	const hasVisibleDescendants = ( childrenArray, searchQuery ) => {
		return childrenArray.some( ( child ) => {
			if ( ! child || ! child.props ) {
				return false;
			}
			if ( child.type === SelectItem ) {
				if ( ! searchQuery ) {
					return true;
				}
				const childText = String( child.props.children ).toLowerCase();
				return childText.includes( searchQuery.toLowerCase() );
			} else if ( child.type === SelectGroupItem ) {
				return hasVisibleDescendants(
					Children.toArray( child.props.children ),
					searchQuery
				);
			}
			return false;
		} );
	};

	// check if any descendant is visible
	const hasVisibleChildren = hasVisibleDescendants(
		Children.toArray( children ),
		state.searchQuery
	);

	// if no visible descendants and there's a search query, don't render the group
	if ( ! hasVisibleChildren && state.searchQuery ) {
		return null;
	}

	return (
		<MenuGroup
			label={ label }
			// className={ `eamm-select-group-item-component ${ className }` }
			{ ...props }
		>
			{ children }
		</MenuGroup>
	);
}

function SelectLabel( { children, className = '', ...props } ) {
	return (
		<div
			className={ cn( 'eamm-select-label-component', className ) }
			{ ...props }
		>
			{ children }
		</div>
	);
}

function SelectItem( {
	children,
	value: itemValue,
	className = '',
	pro,
	...props
} ) {
	const { state, setState, setSelected } = useContext( SelectContext );

	const handleClick = () => {
		setSelected( itemValue, children );
		setState( ( prev ) => ( { ...prev, searchQuery: '' } ) );
	};

	useLayoutEffect( () => {
		if ( itemValue === state.internalSelected ) {
			setState( ( prev ) => ( {
				...prev,
				internalSelected: itemValue,
				internalSelectedLabel: children,
			} ) );
		}
	}, [ itemValue, setState, state.internalSelected, children ] );

	// if search query match with children, return null
	if (
		state.searchQuery &&
		! children.toLowerCase().includes( state.searchQuery.toLowerCase() )
	) {
		return null;
	}

	const showPro = isFreeUser() && pro;

	return (
		<MenuItem
			// role="button"
			// tabIndex={ 0 }
			className={ cn(
				// 'eamm-select-item-component',
				{
					'eamm-select-item-selected':
						state.internalSelected === itemValue,
				},
				className
			) }
			isSelected={ state.internalSelected === itemValue }
			{ ...props }
			onClick={ handleClick }
			onKeyDown={ handleClick }
			role="menuitemradio"
			icon={ showPro ? <Pro /> : null }
			iconPosition="right"
		>
			{ children }
		</MenuItem>
	);
}

export {
    Select,
    SelectContent,
    SelectContext,
    SelectGroupItem,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
};

