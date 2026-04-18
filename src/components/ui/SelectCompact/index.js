import {
    Select,
    SelectContext,
    SelectGroupItem,
    SelectItem,
    SelectSearch,
} from '@/components/ui';
import { cn } from '@/utils';
import {
    Button,
    Dropdown,
    Icon,
    __experimentalInputControl as InputControl,
    __experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
    Spinner,
} from '@wordpress/components';
import { useContext, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';

// SelectCompact: Simplified all-in-one Select wrapper
// Reduces boilerplate by accepting a data array instead of children
// Props: selected, onChange, options, placeholder, fullWidth, disabled, loading, className, maxWidth
// Options can be:
// - Flat: { label, value, pro? }
// - Grouped: { label, value, children: [ { label, value, pro? } ] }

// Helper component to render dropdown content with context access
function SelectCompactContent( { options = [], search = false, onClose } ) {
	const { state } = useContext( SelectContext );

	// Helper to get visible options based on search query
	const getVisibleOptions = () => {
		return options
			.map( ( option ) => {
				if ( option.children && Array.isArray( option.children ) ) {
					// Filter children based on search
					const visibleChildren = ! state.searchQuery
						? option.children
						: option.children.filter( ( child ) =>
								String( child.label )
									.toLowerCase()
									.includes( state.searchQuery.toLowerCase() )
						  );

					// Return null if no visible children
					return visibleChildren.length > 0
						? { ...option, children: visibleChildren }
						: null;
				}

				// Filter flat options based on search
				if (
					state.searchQuery &&
					! String( option.label )
						.toLowerCase()
						.includes( state.searchQuery.toLowerCase() )
				) {
					return null;
				}

				return option;
			} )
			.filter( ( item ) => item !== null );
	};

	// Count visible items: check grouped children length and flat options length
	const countVisibleItems = () => {
		let visibleChildCount = 0;
		let visibleFlatCount = 0;

		options.forEach( ( option ) => {
			if ( option.children && Array.isArray( option.children ) ) {
				// For grouped options, count visible children
				const visibleChildren = ! state.searchQuery
					? option.children
					: option.children.filter( ( child ) =>
							String( child.label )
								.toLowerCase()
								.includes( state.searchQuery.toLowerCase() )
					  );
				visibleChildCount += visibleChildren.length;
			} else {
				// For flat options, count if visible
				if (
					! state.searchQuery ||
					String( option.label )
						.toLowerCase()
						.includes( state.searchQuery.toLowerCase() )
				) {
					visibleFlatCount++;
				}
			}
		} );

		return visibleChildCount + visibleFlatCount;
	};

	const visibleOptions = getVisibleOptions();
	const totalVisibleItems = countVisibleItems();

	const renderOptions = () => {
		return visibleOptions.map( ( option ) => {
			if ( option.children && Array.isArray( option.children ) ) {
				return (
					<SelectGroupItem
						label={ option.label }
						key={ option.value }
					>
						{ option.children.map( ( child ) => (
							<div
								key={ child.value }
								onClick={ onClose }
								role="presentation"
							>
								<SelectItem
									value={ child.value }
									pro={ child.pro }
								>
									{ child.label }
								</SelectItem>
							</div>
						) ) }
					</SelectGroupItem>
				);
			}

			return (
				<div
					key={ option.value }
					onClick={ onClose }
					role="presentation"
				>
					<SelectItem value={ option.value } pro={ option.pro }>
						{ option.label }
					</SelectItem>
				</div>
			);
		} );
	};

	return (
		<>
			{ search && <SelectSearch /> }
			{ renderOptions() }
			{ totalVisibleItems === 0 && (
				<div className="szql-select-no-data">
					{ __( 'No options found', 'syzenlabs-quantity-limits' ) }
				</div>
			) }
		</>
	);
}

function SelectCompact( {
	selected,
	onChange,
	options = [],
	placeholder = 'Select…',
	fullWidth = false,
	disabled = false,
	loading = false,
	className = '',
	triggerClassName = '',
	search = false,
	maxWidth,
	...props
} ) {
	const [ internalSelected, setInternalSelected ] = useState( selected );

	const handleChange = ( value ) => {
		setInternalSelected( value );
		onChange?.( value );
	};

	// Helper function to find the label for a value
	const findLabel = ( value ) => {
		for ( const option of options ) {
			if ( option.children && Array.isArray( option.children ) ) {
				const child = option.children.find(
					( c ) => c.value === value
				);
				if ( child ) {
					return child.label;
				}
			} else if ( option.value === value ) {
				return option.label;
			}
		}
		return value; // Fallback to value if not found
	};

	const selectedLabel = findLabel( internalSelected );

	return (
		<Select
			selected={ internalSelected }
			onChange={ handleChange }
			fullWidth={ fullWidth }
			disabled={ disabled }
			loading={ loading }
			className={ className }
			maxWidth={ maxWidth }
			title={ selectedLabel }
			{ ...props }
		>
			<Dropdown
				className="w-full!"
				popoverProps={ { placement: 'bottom-start' } }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						__next40pxDefaultSize
						className="w-full! p-0!"
						onClick={ onToggle }
					>
						<InputControl
							__next40pxDefaultSize
							className={ cn(
								'w-full!',
								disabled
									? 'cursor-not-allowed!'
									: 'cursor-pointer!'
							) }
							suffix={
								<InputControlSuffixWrapper>
									{ loading ? (
										<Spinner />
									) : (
										<Icon
											icon={
												isOpen ? chevronUp : chevronDown
											}
										/>
									) }
								</InputControlSuffixWrapper>
							}
							value={ selectedLabel }
							placeholder={ placeholder }
							readOnly
						/>
					</Button>
				) }
				renderContent={ ( { onClose } ) => (
					<SelectCompactContent
						options={ options }
						search={ search }
						onClose={ onClose }
					/>
				) }
			/>
		</Select>
	);
}
export { SelectCompact };

