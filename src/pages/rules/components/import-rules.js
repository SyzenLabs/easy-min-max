import {
    FileUploader,
    Sidebar,
    SidebarBody,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarTrigger,
} from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useRuleStore } from '@/store/useRuleStore';
import { csvToJson } from '@/utils';
import apiFetch from '@wordpress/api-fetch';
import {
    Button,
    __experimentalHeading as Heading,
    __experimentalHStack as HStack,
    Icon,
    __experimentalText as Text,
    __experimentalVStack as VStack,
} from '@wordpress/components';
import { useCallback, useMemo, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

function ImportRules( { children } ) {
	const sidebarTriggerRef = useRef();
	const { showToast } = useToast();
	const { getRules } = useRuleStore();
	const [ state, setState ] = useState( {
		importLoading: false,
		progressText: '',
	} );

	const [ importResult, setImportResult ] = useState( {} );
	const prevRequestCompleted = useRef( true );

	const statusImportRules = useCallback( async () => {
		setState( ( prev ) => ( {
			...prev,
			importLoading: true,
			progressText: __( 'Processing…', 'easy-min-max' ),
		} ) );

		try {
			const response = await apiFetch( {
				path: '/easy-min-max/v1/shipping-rules/import/rules/status',
				method: 'GET',
			} );

			if ( ! response.success ) {
				throw new Error( response.message );
			}

			if ( response.data.status !== 'completed' ) {
				setImportResult( response.data );
				return response.data;
			}

			showToast(
				__( 'Shipping rules imported successfully', 'easy-min-max' ),
				'success',
				3000
			);
			setState( ( prev ) => ( {
				...prev,
				importLoading: false,
				progressText: __( 'Completed', 'easy-min-max' ),
			} ) );
			setImportResult( response.data );
			return response.data;
		} catch ( error ) {
			showToast(
				__( 'Error importing shipping rules', 'easy-min-max' ),
				'warning',
				3000
			);
		} finally {
			prevRequestCompleted.current = true;
		}
	}, [ showToast ] );

	const submitImportRules = useCallback(
		async ( data ) => {
			setState( ( prev ) => ( {
				...prev,
				importLoading: true,
				progressText: __( 'Uploading File…', 'easy-min-max' ),
			} ) );

			try {
				const response = await apiFetch( {
					path: '/easy-min-max/v1/shipping-rules/import/rules',
					method: 'POST',
					data: { data: [ ...data ] },
				} );

				if ( ! response.success ) {
					throw new Error( response.message );
				}

				// interval statusImportRules(); till status is not completed
				const interval = setInterval( async () => {
					let r;
					if ( prevRequestCompleted.current ) {
						prevRequestCompleted.current = false;
						r = await statusImportRules();
					}
					if ( r?.status === 'completed' ) {
						clearInterval( interval );
						getRules();
					}
				}, 3000 );

				return response.data;
			} catch ( error ) {
				showToast(
					__( 'Error importing shipping rules', 'easy-min-max' ),
					'error'
				);
			} finally {
				setState( ( prev ) => ( { ...prev, importLoading: false } ) );
			}
		},
		[ showToast, statusImportRules, getRules ]
	);

	const handleFileUpload = useCallback(
		( file ) => {
			const reader = new FileReader();
			reader.onload = ( e ) => {
				const text = e.target.result;
				const data = csvToJson( text );
				submitImportRules( data );
			};
			reader.readAsText( file );
		},
		[ submitImportRules ]
	);

	const handleImportAnotherFile = useCallback( () => {
		setState( ( prev ) => ( {
			...prev,
			importLoading: false,
			progressText: '',
		} ) );
		setImportResult( {} );
	}, [] );

	return (
		<Sidebar>
			<SidebarTrigger ref={ sidebarTriggerRef }>
				{ children }
			</SidebarTrigger>
			<SidebarContent>
				<SidebarHeader>
					{ __( 'Import Shipping Method', 'easy-min-max' ) }
				</SidebarHeader>
				<SidebarBody>
					<VStack spacing={ 4 }>
						{ importResult?.status === 'completed' ? (
							<ImportCompleted importResult={ importResult } />
						) : (
							<>
								<Text>
									{ __( 'Upload CSV', 'easy-min-max' ) }
								</Text>
								<FileUploader
									accept=".csv"
									onUpload={ handleFileUpload }
									uploadText={ __(
										'Start Importing',
										'easy-min-max'
									) }
									uploadCompleteTitle={ __(
										'Import Completed!',
										'easy-min-max'
									) }
									uploadCompleteDescription={ __(
										'Your CSV file has been imported successfully!',
										'easy-min-max'
									) }
									progressText={ state.progressText }
								/>
							</>
						) }
					</VStack>
				</SidebarBody>
				{ importResult?.status === 'completed' && (
					<SidebarFooter>
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ handleImportAnotherFile }
						>
							{ __( 'Import Another File', 'easy-min-max' ) }
						</Button>
					</SidebarFooter>
				) }
			</SidebarContent>
		</Sidebar>
	);
}

function ImportCompleted( { importResult } ) {
	const report = useMemo( () => {
		return {
			total: {
				type: 'info',
				label: __( 'Total Rows', 'easy-min-max' ),
				value: importResult?.total_rows || 0,
			},
			imported: {
				type: 'success',
				label: __( 'Successful', 'easy-min-max' ),
				value: importResult?.imported_rows || 0,
			},
			failed: {
				type: 'error',
				label: __( 'Error', 'easy-min-max' ),
				value: importResult?.failed_rows || 0,
			},
		};
	}, [ importResult ] );

	const errors = importResult?.errors || [];

	const successPercent = useMemo( () => {
		return ( report.imported.value / report.total.value ) * 100 || 0;
	}, [ report ] );

	return (
		<VStack spacing={ 6 }>
			<VStack spacing={ 3 } alignment="center">
				<Icon icon="check" size={ 44 } />
				<Heading level={ 2 }>
					{ __( 'Import Completed!', 'easy-min-max' ) }
				</Heading>
				<Text>
					{ __(
						'Your CSV file has been imported successfully',
						'easy-min-max'
					) }
				</Text>
			</VStack>
			<HStack spacing={ 4 } alignment="center">
				{ Object.entries( report ).map( ( [ key, value ] ) => (
					<VStack
						key={ key }
						spacing={ 2 }
						style={ {
							padding: '24px',
							borderRadius: '8px',
							boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
							flex: 1,
							border: `1px solid ${
								// eslint-disable-next-line no-nested-ternary
								value.type === 'success'
									? '#00a32a'
									: value.type === 'error'
									? '#d63638'
									: '#2271b1'
							}`,
							backgroundColor:
								// eslint-disable-next-line no-nested-ternary
								value.type === 'success'
									? '#f0f9f0'
									: value.type === 'error'
									? '#fef2f2'
									: '#f0f6fc',
						} }
					>
						<Text>{ value.label }</Text>
						<Text style={ { fontSize: '24px', fontWeight: '600' } }>
							{ value.value }
						</Text>
					</VStack>
				) ) }
			</HStack>
			<VStack spacing={ 2 } alignment="center">
				<div
					style={ {
						width: '90%',
						height: '12px',
						borderRadius: '6px',
						backgroundColor: '#f0f9f0',
						boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
					} }
				>
					<div
						style={ {
							width: `${ successPercent }%`,
							height: '12px',
							borderRadius: '6px',
							backgroundColor: '#00a32a',
						} }
					></div>
				</div>
				<Text>
					{ sprintf(
						// translators: %s: Success Percentage.
						__( '%s%% Success Rate', 'easy-min-max' ),
						successPercent.toFixed( 2 )
					) }
				</Text>
			</VStack>
			{ errors.length > 0 && (
				<VStack spacing={ 2 }>
					<Text>{ __( 'Error List', 'easy-min-max' ) }</Text>
					<VStack
						spacing={ 1 }
						style={ {
							borderRadius: '8px',
							boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
							border: '1px solid #ddd',
							padding: '8px',
						} }
					>
						{ errors.map( ( error, index ) => (
							<HStack key={ index } spacing={ 1 }>
								<Text
									style={ {
										color: '#d63638',
										fontWeight: '600',
									} }
								>
									{ __( 'Row', 'easy-min-max' ) }{ ' ' }
									{ error?.row }:
								</Text>
								<Text>{ error?.message }</Text>
							</HStack>
						) ) }
					</VStack>
				</VStack>
			) }
		</VStack>
	);
}

export { ImportRules };
