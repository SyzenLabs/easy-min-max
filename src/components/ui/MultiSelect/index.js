import { cn, getUuid } from '@/utils';
import {
    createContext,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';

// import './style.scss';

import {
    chevronDown,
    chevronUp,
    closeSmall,
    search as wpSearchIcon,
} from '@wordpress/icons';

import {
    BaseControl,
    Button,
    CheckboxControl,
    Dropdown,
    Icon,
    __experimentalInputControl as InputControl,
    __experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
    __experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
    Spinner,
} from '@wordpress/components';

const MultiSelectContext = createContext();

const focusNoScroll = ( element ) => {
	if ( ! element ) {
		return;
	}

	// InputControl may forward refs to an input OR to a wrapper element.
	const target =
		typeof element.focus === 'function'
			? element
			: element?.querySelector?.( 'input, textarea, [tabindex]' );

	if ( ! target || typeof target.focus !== 'function' ) {
		return;
	}

	try {
		// Prevent the dropdown's scroll container from jumping to the focused input.
		target.focus( { preventScroll: true } );
	} catch ( e ) {
		// Older browsers / non-standard focus implementations.
		target.focus();
	}
};

const MultiSelectProvider = ( {
	children,
	options,
	fullWidth,
	onChange,
	onSearch,
	selected = [],
	selectId,
	selectAll,
	selectAllLabel,
	placeholder,
	disabled,
	loading,
	search,
} ) => {
	const [ state, setState ] = useState( {
		open: false,
		selectId,
		options,
		searchQuery: '',
		selected,
	} );
	const searchRef = useRef();

	// Keep internal state in sync when parent updates options/selected asynchronously
	useEffect( () => {
		setState( ( prev ) => ( {
			...prev,
			options: options || [],
		} ) );
	}, [ options ] );

	useEffect( () => {
		setState( ( prev ) => ( {
			...prev,
			selected: Array.isArray( selected ) ? selected : [],
		} ) );
	}, [ selected ] );

	const filteredOptions = useMemo( () => {
		return (
			state.options?.filter( ( option ) => {
				const label = ( option?.label ?? '' ).toString();
				return label
					.toLowerCase()
					.includes( state.searchQuery.toLowerCase() );
			} ) || []
		);
	}, [ state.options, state.searchQuery ] );

	const selectedOptions = useMemo( () => {
		const f =
			state.options?.filter( ( option ) => {
				return state.selected.includes( option.value );
			} ) || [];

		if ( selectAll && state.selected.includes( 'all' ) ) {
			return [
				{
					label: selectAllLabel || 'Select All',
					value: 'all',
				},
				...f,
			];
		}

		return f;
	}, [ state.options, state.selected, selectAll, selectAllLabel ] );

	const isAllSelected = useMemo( () => {
		return state.selected.includes( 'all' );
	}, [ state.selected ] );

	const setSelected = ( action, value ) => {
		let oldSelected = state.selected;

		oldSelected =
			action === 'add'
				? [ ...oldSelected, value ]
				: oldSelected.filter( ( item ) => item !== value );

		setState( ( prev ) => ( {
			...prev,
			selected: oldSelected,
		} ) );

		onChange?.( oldSelected );
	};

	const handleSearch = ( value ) => {
		setState( ( prev ) => ( { ...prev, searchQuery: value } ) );
		onSearch?.( value );
	};

	return (
		<MultiSelectContext.Provider
			value={ {
				state,
				setState,
				fullWidth,
				setSelected,
				onChange,
				selectAll,
				selectAllLabel,
				filteredOptions,
				selectedOptions,
				isAllSelected,
				handleSearch,
				searchRef,
				placeholder,
				disabled,
				loading,
				search,
			} }
		>
			{ children }
		</MultiSelectContext.Provider>
	);
};

function MultiSelect( {
	children,
	options,
	selected,
	selectAll,
	selectAllLabel,
	onChange,
	onSearch,
	fullWidth = false,
	placeholder,
	className = '',
	disabled = false,
	loading = false,
	search = true,
	label,
	...props
} ) {
	// same id format as select compoment for auto closing dropdown when clicking outside
	const selectIdRef = useRef( `syzeql-select-${ getUuid() }` );
	const selectId = selectIdRef.current;

	if ( ! Array.isArray( selected ) ) {
		// console.warn(
		// 	`WOW Shipping (MultiSelect) 'selected' prop should be an array. ${ selectId }`
		// );
		selected = [];
	}

	return (
		<MultiSelectProvider
			options={ options }
			selectId={ selectId }
			selected={ selected }
			onChange={ onChange }
			selectAll={ selectAll }
			selectAllLabel={ selectAllLabel }
			fullWidth={ fullWidth }
			onSearch={ onSearch }
			placeholder={ placeholder }
			disabled={ disabled }
			loading={ loading }
			search={ search }
		>
			{ label ? (
				<BaseControl label={ label }>
					<Dropdown
						className="w-full!"
						contentClassName="syzeql-multiselect-dropdown-content"
						popoverProps={ {
							placement: 'bottom-start',
						} }
						renderToggle={ ( { isOpen, onToggle } ) => (
							<_MultiSelectTrigger2
								isOpen={ isOpen }
								onToggle={ onToggle }
							/>
						) }
						renderContent={ _MultiSelectContent2 }
					/>
				</BaseControl>
			) : (
				<Dropdown
					className="w-full!"
					contentClassName="syzeql-multiselect-dropdown-content"
					popoverProps={ {
						placement: 'bottom-start',
					} }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<_MultiSelectTrigger2
							isOpen={ isOpen }
							onToggle={ onToggle }
						/>
					) }
					renderContent={ _MultiSelectContent2 }
				/>
			) }
		</MultiSelectProvider>
	);
}

function _MultiSelectTrigger2( { isOpen, onToggle } ) {
	const {
		state,
		setState,
		selectedOptions,
		setSelected,
		placeholder,
		disabled,
		loading,
	} = useContext( MultiSelectContext );

	const toggleOpen = () => {
		if ( disabled ) {
			return;
		}
		setState( ( prev ) => ( { ...prev, open: ! isOpen } ) );
		onToggle();
	};

	return (
		<div
			className={ cn(
				'syzeql-multiselect-trigger-component',
				state.open && 'syzeql-multiselect-open',
				selectedOptions.length === 0 &&
					'syzeql-multiselect-has-placeholder',
				disabled && 'syzeql-is-disabled'
			) }
			onClick={ toggleOpen }
			onKeyDown={ ( e ) => {
				if ( e.key === 'Enter' || e.key === ' ' ) {
					e.preventDefault();
					toggleOpen();
				}
			} }
			role="button"
			tabIndex={ 0 }
			aria-expanded={ state.open }
		>
			{ selectedOptions.length > 0 ? (
				<div className="flex-wrap syzeql-multiselect-trigger-value w-[calc(100%-25px)]">
					{ selectedOptions.map( ( item ) => {
						return (
							<div
								className="w-full syzeql-multiselect-trigger-value-item max-w-fit"
								key={ item.value }
								title={ item.label }
							>
								{ item.image && (
									<img
										loading="lazy"
										className="syzeql-multiselect-trigger-value-item-image"
										src={ item.image }
										alt={ item.label }
									/>
								) }
								<div
									className="truncate text-no-wrap w-fit"
									title={ item.label }
								>
									{ /* { truncateText( item.label, 10 ) } */ }
									{ item.label }
								</div>
								<Button
									__next40pxDefaultSize
									size="small"
									onClick={ ( e ) => {
										e.stopPropagation();
										setSelected( 'remove', item.value );
									} }
									icon={ <Icon icon={ closeSmall } /> }
								></Button>
							</div>
						);
					} ) }
				</div>
			) : (
				<div className="syzeql-multiselect-trigger-placeholder">
					{ placeholder || 'Select Options' }
				</div>
			) }

			<div className="syzeql-multiselect-trigger-icons">
				{ loading ? (
					<Spinner />
				) : (
					<Icon icon={ state.open ? chevronUp : chevronDown } />
				) }
			</div>
		</div>
	);
}

// private component
function _MultiSelectSearch() {
	const { state, handleSearch, searchRef } = useContext( MultiSelectContext );

	useEffect( () => {
		if ( searchRef.current ) {
			focusNoScroll( searchRef.current );
		}
	}, [ searchRef ] );

	return (
		<InputControl
			ref={ searchRef }
			placeholder={ __( 'Search…', 'pdf-invoices-packing-slips' ) }
			prefix={
				<InputControlPrefixWrapper>
					<Icon icon={ wpSearchIcon } />
				</InputControlPrefixWrapper>
			}
			suffix={
				<InputControlSuffixWrapper>
					<Button
						__next40pxDefaultSize
						label={ __(
							'Clear search',
							'pdf-invoices-packing-slips'
						) }
						icon={ <Icon icon={ closeSmall } /> }
						onClick={ () => handleSearch( '' ) }
						className={ cn( ! state.searchQuery && 'opacity-0!' ) }
					/>
				</InputControlSuffixWrapper>
			}
			className="syzeql-multiselect-search-component"
			value={ state.searchQuery }
			onChange={ ( value ) => handleSearch( value ) }
		/>
	);
}

// private component
function _MultiSelectItem( { item } ) {
	const { state, setState, setSelected, isAllSelected, searchRef } =
		useContext( MultiSelectContext );

	const isSelected =
		state?.selected?.find( ( i ) => i === item.value ) || false;

	const handleOptionSelect = () => {
		setSelected( isSelected ? 'remove' : 'add', item.value );
		if ( ! isSelected ) {
			setTimeout( () => focusNoScroll( searchRef.current ), 0 );
		}
		// setState( ( prev ) => ( { ...prev, searchQuery: '' } ) );
	};

	const id = useId();

	return (
		<label
			className="flex items-start justify-start gap-3 syzeql-multiselect-item-component"
			htmlFor={ id }
			key={ item.value }
		>
			<CheckboxControl
				id={ id }
				disabled={ isAllSelected }
				checked={ isAllSelected || isSelected }
				onChange={ () => handleOptionSelect() }
			/>
			<div className="flex items-start justify-start gap-2">
				{ item.image && (
					<img
						loading="lazy"
						className="syzeql-multiselect-item-image"
						src={ item.image }
						alt={ item.label }
					/>
				) }
				{ item.label }
			</div>
		</label>
	);
}

// private component
function _MultiSelectItemAllOption() {
	const { state, setState, onChange, selectAllLabel } =
		useContext( MultiSelectContext );

	const handleOptionAllSelect = ( value ) => {
		// setSelected( value ? 'add' : 'remove', 'all' );
		setState( ( prev ) => ( {
			...prev,
			selected: value ? [ 'all' ] : [],
		} ) );
		onChange?.( value ? [ 'all' ] : [] );
	};

	const id = useId();

	return (
		<label
			htmlFor={ id }
			className="flex items-start justify-start gap-3 syzeql-multiselect-item-component syzeql-multiselect-all-options-checkbox"
		>
			<CheckboxControl
				id={ id }
				checked={ state.selected.includes( 'all' ) }
				onChange={ ( value ) => handleOptionAllSelect( value ) }
			/>
			{ selectAllLabel ||
				__( 'Select All', 'pdf-invoices-packing-slips' ) }
		</label>
	);
}

// private component
function _MultiSelectItems() {
	const { filteredOptions } = useContext( MultiSelectContext );

	return (
		<div className="syzeql-multiselect-items-component">
			{ filteredOptions.map( ( option ) => (
				<_MultiSelectItem key={ option.value } item={ option } />
			) ) }
			{ filteredOptions.length === 0 && (
				<div className="syzeql-multiselect-no-options">
					No options found
				</div>
			) }
		</div>
	);
}

function _MultiSelectContent2() {
	const { state, setState, selectAll, fullWidth, search } =
		useContext( MultiSelectContext );
	return (
		<>
			{ search && (
				<div className="syzeql-multiselect-content-header">
					<_MultiSelectSearch />
				</div>
			) }
			<div className="syzeql-multiselect-content-body">
				{ selectAll && state.searchQuery.length === 0 && (
					<_MultiSelectItemAllOption />
				) }
				<_MultiSelectItems />
			</div>
		</>
	);
}

export { MultiSelect };

