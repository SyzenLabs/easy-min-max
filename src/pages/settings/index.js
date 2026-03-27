import { useShippingRegion } from '@/context/ShippingRegionContext';
import { useShippingZone } from '@/context/ShippingZoneContext';
import { useToast } from '@/context/ToastContext';
import { getSettings } from '@/utils';
import { wpConfig } from '@/utils/wpc-config';
import apiFetch from '@wordpress/api-fetch';
import {
    Button,
    Card,
    CardBody,
    CheckboxControl,
    __experimentalDivider as Divider,
    __experimentalGrid as Grid,
    __experimentalHStack as HStack,
    __experimentalInputControl as InputControl,
    RadioControl,
    __experimentalText as Text,
    __experimentalVStack as VStack,
} from '@wordpress/components';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

export default function Settings() {
	const { fetchShippingZones } = useShippingZone();
	const { fetchRegions } = useShippingRegion();

	const [ state, setState ] = useState( getSettings );
	const [ saving, setSaving ] = useState( false );

	const { showToast } = useToast();

	useEffect( () => {
		fetchShippingZones();
		fetchRegions();
	}, [ fetchShippingZones, fetchRegions ] );

	const handleGetSettings = useCallback(
		async ( data ) => {
			setSaving( true );
			try {
				const response = await apiFetch( {
					method: 'POST',
					path: '/easy-min-max/v1/settings',
					data: {
						data,
					},
				} );

				if ( ! response.success ) {
					throw new Error( response.data );
				}

				showToast(
					__(
						'Settings updated successfully',
						'easy-min-max'
					),
					'success'
				);
			} catch ( error ) {
				showToast(
					__(
						'Failed to update settings',
						'easy-min-max'
					),
					'error'
				);
			} finally {
				setSaving( false );
			}
		},
		[ showToast ]
	);

	return (
		<div className="mt-5! eamm-container">
			<Card>
				<CardBody>
					<VStack spacing={ 6 }>
						<VStack spacing={ 4 }>
							<VStack alignment="topLeft" spacing={ 2 }>
								<Text
									weight={ wpConfig.weight.medium }
									size={ wpConfig.size.xl }
									lineHeight={ wpConfig.lineHeight.m }
								>
									{ __(
										'General Settings',
										'easy-min-max'
									) }
								</Text>
								<Text
									variant="muted"
									weight={ wpConfig.weight.regular }
									size={ wpConfig.size.s }
									lineHeight={ wpConfig.lineHeight.xs }
								>
									{ __(
										'Configure general settings for shipping behavior and debugging.',
										'easy-min-max'
									) }
								</Text>
							</VStack>
							<VStack spacing={ 6 }>
								<RadioControl
									label={ __(
										'Default Shipping Tax Status',
										'easy-min-max'
									) }
									selected={
										state.taxDefault ? 'taxable' : 'none'
									}
									options={ [
										{ label: 'Taxable', value: 'taxable' },
										{ label: 'None', value: 'none' },
									] }
									onChange={ ( value ) => {
										const newValue = value === 'taxable';
										setState( ( prev ) => ( {
											...prev,
											taxDefault: newValue,
										} ) );
									} }
								/>
								<CheckboxControl
									__nextHasNoMarginBottom
									label={ __(
										'Debug Mode',
										'easy-min-max'
									) }
									checked={ state.debugMode }
									onChange={ ( value ) => {
										setState( ( prev ) => ( {
											...prev,
											debugMode: value,
										} ) );
									} }
								/>

								<CheckboxControl
									__nextHasNoMarginBottom
									label={
										<span className="text-[#cc1818]">
											{ __(
												'Delete Data on Uninstall',
												'easy-min-max'
											) }
										</span>
									}
									help={
										<>
											{ __(
												'Permanently deletes all plugin data upon uninstalling the plugin.',
												'easy-min-max'
											) }
											&nbsp;
											<span className="font-bold uppercase">
												{ __(
													'Use with caution.',
													'easy-min-max'
												) }
											</span>
										</>
									}
									checked={ state.cleanUpOnUninstall }
									onChange={ ( value ) => {
										setState( ( prev ) => ( {
											...prev,
											cleanUpOnUninstall: value,
										} ) );
									} }
								/>
							</VStack>
						</VStack>
						<Divider />
						<VStack spacing={ 4 }>
							<VStack alignment="topLeft" spacing={ 2 }>
								<Text
									weight={ wpConfig.weight.medium }
									size={ wpConfig.size.xl }
									lineHeight={ wpConfig.lineHeight.m }
								>
									{ __(
										'Shipping Origin',
										'easy-min-max'
									) }
								</Text>
								<Text
									variant="muted"
									weight={ wpConfig.weight.regular }
									size={ wpConfig.size.s }
									lineHeight={ wpConfig.lineHeight.xs }
								>
									{ __(
										'These values will override the default WooCommerce Store Address and will be used as the shipping origin.',
										'easy-min-max'
									) }
								</Text>
							</VStack>
							<Grid alignment="bottom" columns={ 2 } gap={ 4 }>
								<InputControl
									__next40pxDefaultSize
									label="Address line 1"
									value={ state.eammAddress1 || '' }
									onChange={ ( value ) => {
										const newValue = value ?? '';
										setState( ( prev ) => ( {
											...prev,
											eammAddress1: newValue,
										} ) );
									} }
								/>
								<InputControl
									__next40pxDefaultSize
									label="Address line 2"
									value={ state.eammAddress2 || '' }
									onChange={ ( value ) => {
										const newValue = value ?? '';
										setState( ( prev ) => ( {
											...prev,
											eammAddress2: newValue,
										} ) );
									} }
								/>
								<InputControl
									__next40pxDefaultSize
									label="City"
									value={ state.eammCity || '' }
									onChange={ ( value ) => {
										const newValue = value ?? '';
										setState( ( prev ) => ( {
											...prev,
											eammCity: newValue,
										} ) );
									} }
								/>
								<InputControl
									__next40pxDefaultSize
									label="State"
									value={ state.eammState || '' }
									onChange={ ( value ) => {
										const newValue = value ?? '';
										setState( ( prev ) => ( {
											...prev,
											eammState: newValue,
										} ) );
									} }
								/>
								<InputControl
									__next40pxDefaultSize
									label="Postcode"
									value={ state.eammPostcode || '' }
									onChange={ ( value ) => {
										const newValue = value ?? '';
										setState( ( prev ) => ( {
											...prev,
											eammPostcode: newValue,
										} ) );
									} }
								/>
								<InputControl
									__next40pxDefaultSize
									label="Country (ISO Code)"
									value={ state.eammCountry || '' }
									onChange={ ( value ) => {
										const newValue = value ?? '';
										setState( ( prev ) => ( {
											...prev,
											eammCountry: newValue,
										} ) );
									} }
								/>
							</Grid>
						</VStack>
						<Divider />
						<HStack justify="end" spacing={ 5 }>
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ () => handleGetSettings( state ) }
								isBusy={ saving }
							>
								{ saving ? (
									<>
										{ __(
											'Saving…',
											'easy-min-max'
										) }
									</>
								) : (
									__( 'Save', 'easy-min-max' )
								) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</div>
	);
}
