import { SelectCompact } from '@/components/ui';

const ConditionItemTypeField = ( { options, selected, onChange } ) => {
	return (
		<SelectCompact
			className="z-10"
			fullWidth
			search={ true }
			options={ options }
			selected={ selected.field }
			maxWidth={ 120 }
			onChange={ ( val ) => {
				let selectedOption = null;
				let selectedGroup = null;

				// Search for the value in top-level options
				selectedOption = options.find(
					( option ) => option.value === val
				);

				// If not found, search inside children of grouped options
				if ( ! selectedOption ) {
					for ( const group of options ) {
						if ( group.children ) {
							selectedOption = group.children.find(
								( child ) => child.value === val
							);
							if ( selectedOption ) {
								selectedGroup = group.value;
								break;
							}
						}
					}
				}

				onChange( {
					type: selectedGroup || selectedOption?.group || '',
					field: val,
					operator: '', // Reset operator when field changes
					value: '', // Reset value
					// eslint-disable-next-line camelcase
					min_range: '', // Reset min_range
					// eslint-disable-next-line camelcase
					max_range: '', // Reset max_range
				} );
			} }
		></SelectCompact>
	);
};

export default ConditionItemTypeField;
