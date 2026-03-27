import { getUuid } from '@/utils';
import { SHIPPING_METHOD_TYPE_OPTIONS } from '@/utils/constants';
import {
	Flex,
	__experimentalInputControl as InputControl,
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const selectControlNextDefaults = {
	__next40pxDefaultSize: true,
	__nextHasNoMarginBottom: true,
};

const baseControlNextDefaults = {
	__nextHasNoMarginBottom: true,
	__next40pxDefaultSize: true,
};

function ManualRates( { method, handleMethodItemChange } ) {
	return (
		<Flex direction="column" gap={ 4 }>
			<SelectControl
				{ ...selectControlNextDefaults }
				label={ __( 'Select Method Type', 'easy-min-max' ) }
				help={ __(
					'Shipping rates will be calculated differently depending on the shipping method type you choose.',
					'easy-min-max'
				) }
				value={ method.methodType }
				onChange={ ( value ) => {
					const defaultRates = [
						{
							id: getUuid(),
							type: 'fixed',
							initialValue: 0,
							everyValue: 0,
							thenValue: 0,
							firstValue: 0,
							basedOn: '',
							conditions: [
								{
									id: getUuid(),
									type: 'Cart',
									field: 'cart_total',
									operator: 'between',
									value: '',
									// eslint-disable-next-line camelcase
									min_range: '',
									// eslint-disable-next-line camelcase
									max_range: '',
								},
							],
						},
					];
					handleMethodItemChange( {
						methodType: value,
						rates: defaultRates,
					} );
				} }
				options={ SHIPPING_METHOD_TYPE_OPTIONS }
			/>

			<ToggleControl
				{ ...baseControlNextDefaults }
				label={ __(
					'Expected Delivery Time',
					'easy-min-max'
				) }
				help={ __(
					'Displays a delivery estimate to customers during checkout.',
					'easy-min-max'
				) }
				checked={ method.deliveryTimeEnabled }
				onChange={ ( value ) =>
					handleMethodItemChange( {
						deliveryTimeEnabled: value,
					} )
				}
			/>
			{ method.deliveryTimeEnabled && (
				<Flex justify="flex-start" gap={ 4 } className="mb-2!">
					<InputControl
						className="w-full"
						{ ...baseControlNextDefaults }
						disabled={ ! method.deliveryTimeEnabled }
						type="number"
						value={ method.deliveryTimeFrom }
						onChange={ ( value ) =>
							handleMethodItemChange( {
								deliveryTimeFrom: value,
							} )
						}
						prefix={
							<InputControlPrefixWrapper>
								{ __( 'Min', 'easy-min-max' ) }
							</InputControlPrefixWrapper>
						}
						suffix={
							<InputControlSuffixWrapper>
								{ __( 'Day(s)', 'easy-min-max' ) }
							</InputControlSuffixWrapper>
						}
					/>
					<InputControl
						{ ...baseControlNextDefaults }
						className="w-full"
						disabled={ ! method.deliveryTimeEnabled }
						type="number"
						value={ method.deliveryTimeTo }
						onChange={ ( value ) =>
							handleMethodItemChange( {
								deliveryTimeTo: value,
							} )
						}
						prefix={
							<InputControlPrefixWrapper>
								{ __( 'Max', 'easy-min-max' ) }
							</InputControlPrefixWrapper>
						}
						suffix={
							<InputControlSuffixWrapper>
								{ __( 'Day(s)', 'easy-min-max' ) }
							</InputControlSuffixWrapper>
						}
					/>
				</Flex>
			) }
		</Flex>
	);
}

export { ManualRates };

