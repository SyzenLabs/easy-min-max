import { SelectCompact } from '@/components/ui';
import { useShippingOptions } from '@/context/OptionsContext';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const ConditionItemOperationField = ( {
	selected,
	selectedOptions,
	onChange,
} ) => {
	const { getOperatorOptions } = useShippingOptions();

	const componentKey = `${ selected.operator || 'reset' }-${
		selectedOptions?.operatorType
	}`;

	// Auto-select first operator when operator is blank and operatorType changes
	useEffect( () => {
		if ( ! selected.operator && selectedOptions?.operatorType ) {
			const firstOperator = getOperatorOptions(
				selectedOptions.operatorType
			)[ 0 ];
			if ( firstOperator ) {
				onChange( { operator: firstOperator.value } );
			}
		}
	}, [
		selectedOptions?.operatorType,
		selected.operator,
		onChange,
		getOperatorOptions,
	] );

	if ( ! selectedOptions?.operatorType ) {
		return null;
	}

	return (
		<>
			<SelectCompact
				key={ componentKey }
				fullWidth
				options={ getOperatorOptions( selectedOptions?.operatorType ) }
				selected={ selected.operator || '' }
				maxWidth={ 120 }
				onChange={ ( value ) => {
					onChange( {
						operator: value,
						value: '',
						// eslint-disable-next-line camelcase
						min_range: '',
						// eslint-disable-next-line camelcase
						max_range: '',
					} );
				} }
				placeholder={ __( 'Select Operator', 'easy-min-max' ) }
			></SelectCompact>
		</>
	);
};

export default ConditionItemOperationField;
