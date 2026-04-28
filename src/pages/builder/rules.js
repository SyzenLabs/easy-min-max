import { useRuleStore } from '@/store/useRuleStore';
import { getCurrencyCode } from '@/utils';
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
						{ __( 'MinMax Settings', 'syzenlabs-quantity-limits' ) }
					</Heading>
					<Tooltip
						text={ __(
							'Configure quantity limits, pricing thresholds, quantity UI behaviour, and validation messages for this rule.',
							'syzenlabs-quantity-limits'
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
					<div className="rounded-(--syzeql-border-radius-md) border border-[#DCDCDE] bg-white p-4">
						<div className="mb-4">
							<p className="m-0 font-medium text-(--syzeql-text-main)">
								{ __(
									'Quantity Limits',
									'syzenlabs-quantity-limits'
								) }
							</p>
							<p className="mt-1 mb-0 text-sm text-(--syzeql-text-sub)">
								{ __(
									'Define the allowed quantity thresholds for matching products.',
									'syzenlabs-quantity-limits'
								) }
								&nbsp;
								<strong>
									{ __(
										'Supports Decimal values.',
										'syzenlabs-quantity-limits'
									) }
								</strong>
							</p>
						</div>

						<div className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<NumberField
									label={ __(
										'Minimum Quantity',
										'syzenlabs-quantity-limits'
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
										'syzenlabs-quantity-limits'
									) }
									value={ rulesForm.maxQuantity }
									disabled={ quantityRulesDisabled }
									onChange={ handleFieldChange(
										'maxQuantity'
									) }
								/>
							</div>
							<NumberField
								label={ __(
									'Step Quantity',
									'syzenlabs-quantity-limits'
								) }
								value={ rulesForm.step }
								disabled={ quantityRulesDisabled }
								help={ __(
									'Customers can increase quantity in this increment. Decimal values such as 0.5 or 0.25 are supported.',
									'syzenlabs-quantity-limits'
								) }
								onChange={ handleFieldChange( 'step' ) }
							/>
							<NumberField
								label={ __(
									'Initial Quantity',
									'syzenlabs-quantity-limits'
								) }
								value={ rulesForm.initialQuantity }
								disabled={ quantityRulesDisabled }
								help={ __(
									'Default quantity prefilled on the product page.',
									'syzenlabs-quantity-limits'
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
									'syzenlabs-quantity-limits'
								) }
								label={ __(
									'Enable Fixed Quantity',
									'syzenlabs-quantity-limits'
								) }
								onChange={ handleFixedQuantityToggle }
							/>
							{ rulesForm.enableFixedQuantity && (
								<NumberField
									label={ __(
										'Fixed Quantity',
										'syzenlabs-quantity-limits'
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
									'syzenlabs-quantity-limits'
								) }
								label={ __(
									'Disable Minimum On Low Stock',
									'syzenlabs-quantity-limits'
								) }
								onChange={ handleFieldChange(
									'disableMinQuantityOnLowStock'
								) }
							/>
						</div>
					</div>

					<div className="rounded-(--syzeql-border-radius-md) border border-[#DCDCDE] bg-white p-4">
						<div className="mb-4">
							<p className="m-0 font-medium text-(--syzeql-text-main)">
								{ __(
									'Price Limits',
									'syzenlabs-quantity-limits'
								) }
							</p>
							<p className="mt-1 mb-0 text-sm text-(--syzeql-text-sub)">
								{ __(
									'Define the allowed price thresholds for matching products.',
									'syzenlabs-quantity-limits'
								) }
							</p>
						</div>

						<div className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<NumberField
									label={ __(
										'Minimum Price',
										'syzenlabs-quantity-limits'
									) }
									value={ rulesForm.minPrice }
									suffix={ getCurrencyCode() }
									onChange={ handleFieldChange( 'minPrice' ) }
								/>
								<NumberField
									label={ __(
										'Maximum Price',
										'syzenlabs-quantity-limits'
									) }
									value={ rulesForm.maxPrice }
									suffix={ getCurrencyCode() }
									onChange={ handleFieldChange( 'maxPrice' ) }
								/>
							</div>

							{ /* <ToggleControl
								{ ...toggleControlDefaults }
								checked={ !! rulesForm.hideCheckoutButton }
								help={ __(
									'Hide the checkout button until the customer meets this rule.',
									'syzenlabs-quantity-limits'
								) }
								label={ __(
									'Hide Checkout Button',
									'syzenlabs-quantity-limits'
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
									'syzenlabs-quantity-limits'
								) }
								label={ __(
									'Show Total Price By Quantity',
									'syzenlabs-quantity-limits'
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
									'syzenlabs-quantity-limits'
								) }
								label={ __(
									'Show Quantity In Archive',
									'syzenlabs-quantity-limits'
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
									'syzenlabs-quantity-limits'
								) }
								label={ __(
									'Show Quantity Dropdown',
									'syzenlabs-quantity-limits'
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
										'syzenlabs-quantity-limits'
									) }
									value={ quantityDropdownText }
									disabled={
										! rulesForm.showQuantityDropdown
									}
									help={ __(
										'Enter one quantity option per line. Duplicate values are ignored.',
										'syzenlabs-quantity-limits'
									) }
									rows={ 5 }
									onChange={ handleQuantityDropdownChange }
								/>
							</div>
						) } */ }
					</div>

					<div className="rounded-(--syzeql-border-radius-md) border border-[#DCDCDE] bg-white p-4">
						<div className="mb-4">
							<p className="m-0 font-medium text-(--syzeql-text-main)">
								{ __(
									'Custom CSS',
									'syzenlabs-quantity-limits'
								) }
							</p>
							<p className="mt-1 mb-0 text-sm text-(--syzeql-text-sub)">
								{ __(
									'Add rule-specific CSS that will be printed on the frontend when this rule applies.',
									'syzenlabs-quantity-limits'
								) }
							</p>
						</div>

						<TextareaControl
							label={ __(
								'CSS Rules',
								'syzenlabs-quantity-limits'
							) }
							value={ rulesForm.customCss }
							help={ __(
								'Write plain CSS without wrapping <style> tags.',
								'syzenlabs-quantity-limits'
							) }
							rows={ 8 }
							onChange={ handleFieldChange( 'customCss' ) }
							spellCheck={ false }
							className="font-mono"
						/>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
