/* eslint-disable camelcase */
import { MultiSelect, SelectCompact } from '@/components/ui';
import { useShippingOptions } from '@/context/OptionsContext';
import {
    __experimentalHStack as HStack,
    __experimentalInputControl as InputControl,
    __experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { TimeFields } from './TimeFields';
import { WeekdayFields } from './WeekdayFields';

const ConditionItemValueField = ( { selected, selectedOptions, onChange } ) => {
	const { getConditionDataOptions, optionsData } = useShippingOptions();
	const [ conditionDataLoading, setConditionDataLoading ] = useState( false );

	// Fetch lazy-loaded data when component mounts or field changes
	useEffect( () => {
		const fetchData = async () => {
			if (
				selectedOptions?.lazy &&
				selected.field &&
				selectedOptions?.component !== 'WeekdayFields' &&
				selectedOptions?.component !== 'TimeFields'
			) {
				setConditionDataLoading( true );
				try {
					await getConditionDataOptions( {
						field: selected.field,
					} );
				} finally {
					setConditionDataLoading( false );
				}
			}
		};

		fetchData();
	}, [
		selected.field,
		selectedOptions?.lazy,
		selectedOptions?.component,
		getConditionDataOptions,
	] );

	// Don't render anything if no operator or operator is 'none'
	// if ( ! selected.operator || selected.operator === 'none' ) {
	// 	return null;
	// }

	// If operator is 'between', only Input component shows min_range/max_range
	if ( selected.operator === 'between' ) {
		if ( selectedOptions?.component === 'Input' ) {
			return (
				<HStack spacing={ 1 }>
					<InputControl
						__next40pxDefaultSize
						min={ 0 }
						type={ selectedOptions?.inputProps?.type || 'text' }
						className="w-full!"
						placeholder={ __( 'Min', 'syzenlabs-quantity-limits' ) }
						value={ selected.min_range || '' }
						suffix={
							<InputControlSuffixWrapper>
								{ selectedOptions?.inputProps?.unit }
							</InputControlSuffixWrapper>
						}
						onChange={ ( value ) =>
							onChange( { min_range: value } )
						}
					/>

					<InputControl
						min={ 0 }
						__next40pxDefaultSize
						type={ selectedOptions?.inputProps?.type || 'text' }
						className="w-full!"
						placeholder={ __( 'Max', 'syzenlabs-quantity-limits' ) }
						value={ selected.max_range || '' }
						suffix={
							<InputControlSuffixWrapper>
								{ selectedOptions?.inputProps?.unit }
							</InputControlSuffixWrapper>
						}
						onChange={ ( value ) =>
							onChange( { max_range: value } )
						}
					/>
				</HStack>
			);
		}
		return null; // No 'between' support for non-Input components
	}

	// For all other operators, render appropriate component updating 'value'
	switch ( selectedOptions?.component ) {
		case 'Input':
			return (
				<InputControl
					__next40pxDefaultSize
					min={ 0 }
					type={ selectedOptions?.inputProps?.type || 'text' }
					className="w-full!"
					placeholder={ __( 'Value', 'syzenlabs-quantity-limits' ) }
					value={ selected.value || '' }
					suffix={
						<InputControlSuffixWrapper>
							{ selectedOptions?.inputProps?.unit }
						</InputControlSuffixWrapper>
					}
					onChange={ ( value ) => onChange( { value } ) }
				/>
			);

		case 'MultiSelect':
			return (
				<MultiSelect
					disabled={ conditionDataLoading }
					loading={ conditionDataLoading }
					selected={ selected.value || [] }
					key={ `multiselect-${ selectedOptions?.value }-${
						optionsData?.[ selectedOptions?.value ]?.length || 0
					}-${ selected.operator }` }
					fullWidth
					selectAll={ true }
					options={ optionsData?.[ selectedOptions?.value ] }
					placeholder={ __( 'Select', 'syzenlabs-quantity-limits' ) }
					value={ selected.value || [] }
					onChange={ ( value ) => onChange( { value } ) }
				/>
			);

		case 'Select':
			return (
				<SelectCompact
					disabled={ conditionDataLoading }
					loading={ conditionDataLoading }
					fullWidth
					selected={ selected.value || '' }
					onChange={ ( value ) => onChange( { value } ) }
					options={ optionsData?.[ selectedOptions?.value ] }
					placeholder={ __( 'Select', 'syzenlabs-quantity-limits' ) }
				/>
			);

		case 'WeekdayFields':
			return (
				<WeekdayFields
					value={ selected.value }
					key={ selected.operator }
					onChange={ ( value ) => onChange( { value } ) }
				/>
			);

		case 'TimeFields':
			return (
				<TimeFields
					value={ selected.value }
					onChange={ ( value ) => onChange( { value } ) }
				/>
			);

		default:
			return null;
	}
};

export default ConditionItemValueField;
