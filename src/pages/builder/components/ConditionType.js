import { cn } from '@/utils';
import { useState } from '@wordpress/element';

function ConditionType( {
	children,
	design = 'primary', // primary or secondary
	onChange,
	...props
} ) {
	const [ state, setState ] = useState( {
		selected: props.selected || 'AND',
	} );

	const typeList = [
		{ label: 'AND', value: 'AND' },
		{ label: 'OR', value: 'OR' },
	];

	const handleTypeChange = ( type ) => {
		setState( ( prev ) => ( {
			...prev,
			selected: type,
		} ) );
		onChange?.( type );
	};

	return (
		<div
			className={ cn(
				'eamm-condition-type-component',
				`eamm-design-${ design }`
			) }
			{ ...props }
		>
			<div className="eamm-condition-type-items">
				{ typeList.map( ( type ) => (
					<div
						onClick={ () => handleTypeChange( type.value ) }
						onKeyDown={ ( e ) => {
							if ( e.key === 'Enter' ) {
								handleTypeChange( type.value );
							}
						} }
						role="button"
						tabIndex={ 0 }
						className={ cn(
							'eamm-condition-type-item',
							state.selected === type.value &&
								'eamm-condition-type-item-active'
						) }
						key={ type.value }
					>
						{ type.label }
					</div>
				) ) }
			</div>
		</div>
	);
}

export { ConditionType };
