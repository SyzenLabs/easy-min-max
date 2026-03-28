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
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack
} from '@wordpress/components';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

export default function Settings() {
	const [ state, setState ] = useState( getSettings );
	const [ saving, setSaving ] = useState( false );

	const { showToast } = useToast();

	const handleSaveSettings = useCallback(
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
					__( 'Settings updated successfully', 'easy-min-max' ),
					'success'
				);
			} catch ( error ) {
				showToast(
					__( 'Failed to update settings', 'easy-min-max' ),
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
									{ __( 'General Settings', 'easy-min-max' ) }
								</Text>
							</VStack>
							<VStack spacing={ 6 }>

								<CheckboxControl
									__nextHasNoMarginBottom
									label={ __( 'Debug Mode', 'easy-min-max' ) }
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
						<HStack justify="end" spacing={ 5 }>
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ () => handleSaveSettings( state ) }
								isBusy={ saving }
							>
								{ saving ? (
									<>{ __( 'Saving…', 'easy-min-max' ) }</>
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
