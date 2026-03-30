import { useRuleStore } from '@/store/useRuleStore';
import {
	Card,
	CardBody,
	CardHeader,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	Icon,
	__experimentalInputControl as InputControl,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
	TextareaControl,
	ToggleControl,
	Tooltip,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const inputControlDefaults = {
	__next40pxDefaultSize: true,
	__nextHasNoMarginBottom: true,
};

const toggleControlDefaults = {
	__nextHasNoMarginBottom: true,
};

const parseQuantityDropdownOptions = ( value ) => {
	const uniqueOptions = new Map();

	value
		.split( /[\n,]+/ )
		.map( ( item ) => item.trim() )
		.filter( Boolean )
		.forEach( ( item ) => {
			if ( uniqueOptions.has( item ) ) {
				return;
			}

			const numericValue = Number( item );
			uniqueOptions.set( item, {
				value:
					item !== '' && Number.isFinite( numericValue )
						? numericValue
						: item,
				label: item,
			} );
		} );

	return Array.from( uniqueOptions.values() );
};

const serializeQuantityDropdownOptions = ( options ) => {
	if ( ! Array.isArray( options ) ) {
		return '';
	}

	return options
		.map( ( option ) => option?.label || `${ option?.value || '' }` )
		.filter( Boolean )
		.join( '\n' );
};

function NumberField( {
	label,
	value,
	onChange,
	help,
	suffix,
	disabled = false,
	min = 0,
	step = 'any',
} ) {
	return (
		<InputControl
			{ ...inputControlDefaults }
			className="w-full!"
			disabled={ disabled }
			help={ help }
			label={ label }
			min={ min }
			step={ step }
			type="number"
			value={ value ?? '' }
			suffix={
				suffix ? (
					<InputControlSuffixWrapper>
						{ suffix }
					</InputControlSuffixWrapper>
				) : null
			}
			onChange={ onChange }
		/>
	);
}

function TextField( {
	label,
	value,
	onChange,
	help,
	rows = 4,
	disabled = false,
} ) {
	return (
		<TextareaControl
			__nextHasNoMarginBottom
			disabled={ disabled }
			help={ help }
			label={ label }
			rows={ rows }
			value={ value || '' }
			onChange={ onChange }
		/>
	);
}

export function Rules() {
	const {
		state: { rulesForm },
		updateBuilder,
	} = useRuleStore();
	const [ quantityDropdownText, setQuantityDropdownText ] = useState( () =>
		serializeQuantityDropdownOptions( rulesForm.quantityDropdownOptions )
	);

	useEffect( () => {
		setQuantityDropdownText(
			serializeQuantityDropdownOptions(
				rulesForm.quantityDropdownOptions
			)
		);
	}, [ rulesForm.quantityDropdownOptions ] );

	const handleFieldChange = ( field ) => ( value ) => {
		updateBuilder( field, value );
	};

	const handleFixedQuantityToggle = ( value ) => {
		updateBuilder( ( prev ) => ( {
			...prev,
			enableFixedQuantity: value,
			fixedQuantity: value ? prev.fixedQuantity || 1 : '',
		} ) );
	};

	const handleQuantityDropdownChange = ( value ) => {
		setQuantityDropdownText( value );
		updateBuilder(
			'quantityDropdownOptions',
			parseQuantityDropdownOptions( value )
		);
	};

	const quantityRulesDisabled = rulesForm.enableFixedQuantity;

	return (
		<Card>
			<CardHeader>
				<HStack spacing={ 2 } expanded={ false }>
					<Heading level={ 3 }>
						{ __( 'MinMax Settings', 'easy-min-max' ) }
					</Heading>
					<Tooltip
						text={ __(
							'Configure quantity limits, pricing thresholds, quantity UI behaviour, and validation messages for this rule.',
							'easy-min-max'
						) }
					>
						<span>
							<Icon icon="info-outline" />
						</span>
					</Tooltip>
				</HStack>
			</CardHeader>
			<CardBody>
				<div className="grid gap-6">
					<div className="rounded-(--eamm-border-radius-md) border border-[#DCDCDE] bg-white p-4">
						<div className="mb-4">
							<p className="m-0 font-medium text-(--eamm-text-main)">
								{ __( 'Quantity Limits', 'easy-min-max' ) }
							</p>
							<p className="mt-1 mb-0 text-sm text-(--eamm-text-sub)">
								{ __(
									'Define the allowed quantity thresholds for matching products.',
									'easy-min-max'
								) }
							</p>
						</div>

						<div className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<NumberField
									label={ __(
										'Minimum Quantity',
										'easy-min-max'
									) }
									value={ rulesForm.minQuantity }
									disabled={ quantityRulesDisabled }
									onChange={ handleFieldChange(
										'minQuantity'
									) }
								/>
								<NumberField
									label={ __(
										'Maximum Quantity',
										'easy-min-max'
									) }
									value={ rulesForm.maxQuantity }
									disabled={ quantityRulesDisabled }
									onChange={ handleFieldChange(
										'maxQuantity'
									) }
								/>
							</div>
							<NumberField
								label={ __( 'Step Quantity', 'easy-min-max' ) }
								value={ rulesForm.step }
								disabled={ quantityRulesDisabled }
								help={ __(
									'Customers can increase quantity in this increment.',
									'easy-min-max'
								) }
								onChange={ handleFieldChange( 'step' ) }
							/>
							<NumberField
								label={ __(
									'Initial Quantity',
									'easy-min-max'
								) }
								value={ rulesForm.initialQuantity }
								disabled={ quantityRulesDisabled }
								help={ __(
									'Default quantity prefilled on the product page.',
									'easy-min-max'
								) }
								onChange={ handleFieldChange(
									'initialQuantity'
								) }
							/>

							<ToggleControl
								{ ...toggleControlDefaults }
								checked={ !! rulesForm.enableFixedQuantity }
								help={ __(
									'When enabled, the fixed quantity value overrides min, max, step, and initial quantity on the storefront.',
									'easy-min-max'
								) }
								label={ __(
									'Enable Fixed Quantity',
									'easy-min-max'
								) }
								onChange={ handleFixedQuantityToggle }
							/>
							{ rulesForm.enableFixedQuantity && (
								<NumberField
									label={ __(
										'Fixed Quantity',
										'easy-min-max'
									) }
									value={ rulesForm.fixedQuantity }
									disabled={ ! rulesForm.enableFixedQuantity }
									min={ 1 }
									step={ 1 }
									onChange={ handleFieldChange(
										'fixedQuantity'
									) }
								/>
							) }

							<ToggleControl
								{ ...toggleControlDefaults }
								checked={
									!! rulesForm.disableMinQuantityOnLowStock
								}
								help={ __(
									'Disable the minimum quantity requirement when stock drops below the configured minimum.',
									'easy-min-max'
								) }
								label={ __(
									'Disable Minimum On Low Stock',
									'easy-min-max'
								) }
								onChange={ handleFieldChange(
									'disableMinQuantityOnLowStock'
								) }
							/>
						</div>
					</div>

					<div className="rounded-(--eamm-border-radius-md) border border-[#DCDCDE] bg-white p-4">
						<div className="mb-4">
							<p className="m-0 font-medium text-(--eamm-text-main)">
								{ __( 'Price Limits', 'easy-min-max' ) }
							</p>
							<p className="mt-1 mb-0 text-sm text-(--eamm-text-sub)">
								{ __(
									'Define the allowed price thresholds for matching products.',
									'easy-min-max'
								) }
							</p>
						</div>

						<div className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<NumberField
									label={ __(
										'Minimum Price',
										'easy-min-max'
									) }
									value={ rulesForm.minPrice }
									suffix={ __( 'Price', 'easy-min-max' ) }
									onChange={ handleFieldChange( 'minPrice' ) }
								/>
								<NumberField
									label={ __(
										'Maximum Price',
										'easy-min-max'
									) }
									value={ rulesForm.maxPrice }
									suffix={ __( 'Price', 'easy-min-max' ) }
									onChange={ handleFieldChange( 'maxPrice' ) }
								/>
							</div>

							{ /* <ToggleControl
								{ ...toggleControlDefaults }
								checked={ !! rulesForm.hideCheckoutButton }
								help={ __(
									'Hide the checkout button until the customer meets this rule.',
									'easy-min-max'
								) }
								label={ __(
									'Hide Checkout Button',
									'easy-min-max'
								) }
								onChange={ handleFieldChange(
									'hideCheckoutButton'
								) }
							/> */ }
							{ /* <ToggleControl
								{ ...toggleControlDefaults }
								checked={ !! rulesForm.showPriceByQuantity }
								help={ __(
									'Show a live total price that updates with the selected quantity.',
									'easy-min-max'
								) }
								label={ __(
									'Show Total Price By Quantity',
									'easy-min-max'
								) }
								onChange={ handleFieldChange(
									'showPriceByQuantity'
								) }
							/> */ }
							{ /* <ToggleControl
								{ ...toggleControlDefaults }
								checked={ !! rulesForm.showQuantityInArchive }
								help={ __(
									'Render the quantity selector directly on shop and archive listings.',
									'easy-min-max'
								) }
								label={ __(
									'Show Quantity In Archive',
									'easy-min-max'
								) }
								onChange={ handleFieldChange(
									'showQuantityInArchive'
								) }
							/> */ }
							{ /* <ToggleControl
								{ ...toggleControlDefaults }
								checked={ !! rulesForm.showQuantityDropdown }
								help={ __(
									'Replace the quantity input with a dropdown selector on matching product pages.',
									'easy-min-max'
								) }
								label={ __(
									'Show Quantity Dropdown',
									'easy-min-max'
								) }
								onChange={ handleFieldChange(
									'showQuantityDropdown'
								) }
							/> */ }
						</div>

						{ /* { rulesForm.showQuantityDropdown && (
							<div className="mt-4">
								<TextField
									label={ __(
										'Quantity Dropdown Options',
										'easy-min-max'
									) }
									value={ quantityDropdownText }
									disabled={
										! rulesForm.showQuantityDropdown
									}
									help={ __(
										'Enter one quantity option per line. Duplicate values are ignored.',
										'easy-min-max'
									) }
									rows={ 5 }
									onChange={ handleQuantityDropdownChange }
								/>
							</div>
						) } */ }
					</div>

					<div className="rounded-(--eamm-border-radius-md) border border-[#DCDCDE] bg-white p-4">
						<div className="mb-4">
							<p className="m-0 font-medium text-(--eamm-text-main)">
								{ __( 'Custom CSS', 'easy-min-max' ) }
							</p>
							<p className="mt-1 mb-0 text-sm text-(--eamm-text-sub)">
								{ __(
									'Add rule-specific CSS that will be printed on the frontend when this rule applies.',
									'easy-min-max'
								) }
							</p>
						</div>

						<TextField
							label={ __( 'CSS Rules', 'easy-min-max' ) }
							value={ rulesForm.customCss }
							help={ __(
								'Write plain CSS without wrapping <style> tags.',
								'easy-min-max'
							) }
							rows={ 8 }
							onChange={ handleFieldChange( 'customCss' ) }
						/>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
