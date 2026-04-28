import { useNav } from '@/context/NavContext';
import { useToast } from '@/context/ToastContext';
import { getUuid } from '@/utils';
import apiFetch from '@wordpress/api-fetch';
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';

export const createEmptyCondition = () => ( {
	type: 'General',
	field: 'always',
	operator: null,
	value: [],
	// eslint-disable-next-line camelcase
	min_range: '',
	// eslint-disable-next-line camelcase
	max_range: '',
} );

const RuleStoreContext = createContext( null );

const createDefaultQuantityDropdownOptions = () => [
	{ value: 1, label: '1' },
	{ value: 2, label: '2' },
	{ value: 3, label: '3' },
];

const getDefaultRulesForm = () => ( {
	id: getUuid(),
	title: '',
	publishMode: 'draft',
	minQuantity: '',
	maxQuantity: '',
	minPrice: '',
	maxPrice: '',
	step: 1,
	initialQuantity: 1,
	enableFixedQuantity: false,
	fixedQuantity: 1,
	hideCheckoutButton: false,
	showPriceByQuantity: false,
	disableMinQuantityOnLowStock: false,
	showQuantityInArchive: false,
	showQuantityDropdown: false,
	quantityDropdownOptions: createDefaultQuantityDropdownOptions(),
	minQuantityMessage: 'You must order at least [min_quantity] items.',
	maxQuantityMessage: 'You cannot order more than [max_quantity] items.',
	minPriceMessage: 'Your order must be at least [min_price].',
	maxPriceMessage: 'Your order cannot exceed [max_price].',
	customCss: '',
	enableConditions: false,
	conditionGroups: [ [ createEmptyCondition() ] ],
} );

const getDefaultState = () => ( {
	deleteLoading: false,
	deleteLoadingId: null,
	duplicateLoading: false,
	duplicateLoadingId: null,
	hasUnsavedChanges: false,
	initialLoading: true,
	isSaving: false,

	rules: [],
	rulesForm: getDefaultRulesForm(),
} );

export const RuleStoreProvider = ( { children } ) => {
	const [ state, setState ] = useState( getDefaultState() );
	const { showToast } = useToast();
	const { setCurrentNav } = useNav();

	const updateBuilder = useCallback( ( key, value ) => {
		if ( typeof key === 'function' ) {
			setState( ( prev ) => {
				const updatedForm = key( prev.rulesForm );

				return {
					...prev,
					rulesForm: updatedForm,
					hasUnsavedChanges: true,
				};
			} );
			return;
		}

		setState( ( prev ) => {
			const updatedForm = {
				...prev.rulesForm,
				[ key ]: value,
			};

			return {
				...prev,
				rulesForm: updatedForm,
				hasUnsavedChanges: true,
			};
		} );
	}, [] );

	const resetToDefaultState = useCallback( () => {
		setState( ( prev ) => ( {
			...prev,
			hasUnsavedChanges: false,
			initialLoading: true,
			isSaving: false,
			rulesForm: getDefaultRulesForm(),
		} ) );
	}, [] );

	const setInitialLoading = useCallback( ( value ) => {
		setState( ( prev ) => ( {
			...prev,
			initialLoading: value,
		} ) );
	}, [] );

	const getRules = useCallback( async () => {
		try {
			const response = await apiFetch( {
				method: 'GET',
				path: '/syzeql/v1/rules',
			} );

			if ( ! response.success ) {
				throw new Error( response.message );
			}

			setState( ( prev ) => ( {
				...prev,
				rules: response.data || [],
			} ) );

			return response.data;
		} catch ( error ) {
			showToast?.(
				__( 'Error fetching rules', 'syzenlabs-quantity-limits' ),
				'error'
			);
		}
	}, [ setState, showToast ] );

	const getRuleById = useCallback(
		async ( ruleId ) => {
			try {
				const response = await apiFetch( {
					path: `/syzeql/v1/rules/${ ruleId }`,
					method: 'GET',
				} );

				if ( ! response.success ) {
					throw new Error( response.message );
				}

				setState( ( prev ) => ( {
					...prev,
					hasUnsavedChanges: false,
					rulesForm: response.data,
				} ) );

				return response.data;
			} catch ( error ) {
				showToast?.(
					__( 'Error fetching rule', 'syzenlabs-quantity-limits' ),
					'error'
				);
			} finally {
				setState( ( prev ) => ( {
					...prev,
					isSaving: false,
					initialLoading: false,
				} ) );
			}
		},
		[ setState, showToast ]
	);

	const saveRule = useCallback(
		async ( data, isUpdate = false ) => {
			setState( ( prev ) => ( {
				...prev,
				isSaving: true,
			} ) );

			let responseData = null;

			try {
				const response = await apiFetch( {
					path: '/syzeql/v1/rules',
					method: 'POST',
					data,
				} );

				if ( ! response.success ) {
					throw new Error( response.message );
				}

				if ( isUpdate ) {
					showToast?.(
						__(
							'Shipping rule updated successfully',
							'syzenlabs-quantity-limits'
						),
						'success'
					);
				} else {
					showToast?.(
						__(
							'Shipping rule saved successfully',
							'syzenlabs-quantity-limits'
						),
						'success',
						3000
					);
				}

				responseData = response.data;
				return responseData;
			} catch ( error ) {
				showToast?.(
					__( 'Error saving rule', 'syzenlabs-quantity-limits' ),
					'warning',
					3000
				);
			} finally {
				setState( ( prev ) => ( {
					...prev,
					isSaving: false,
				} ) );
			}
		},
		[ setState, showToast ]
	);

	const submitRule = useCallback(
		async ( { data = null } = {} ) => {
			const payload = data || state.rulesForm;
			const responseData = await saveRule( payload );

			if ( responseData ) {
				setState( ( prev ) => ( {
					...prev,
					hasUnsavedChanges: false,
					// rulesForm: responseData,
				} ) );
				setCurrentNav?.( `rule-edit/${ state.rulesForm.id }` );
				return responseData;
			}
		},
		[ saveRule, setCurrentNav, setState, state.rulesForm ]
	);

	const updateRule = useCallback(
		async ( data ) => {
			const responseData = await saveRule( data, true );

			if ( responseData ) {
				setState( ( prev ) => ( {
					...prev,
					hasUnsavedChanges: false,
					// rulesForm: responseData,
				} ) );
			}
		},
		[ saveRule, setState ]
	);

	const deleteRule = useCallback(
		async ( id ) => {
			setState( ( prev ) => ( {
				...prev,
				deleteLoading: true,
				deleteLoadingId: id,
			} ) );

			try {
				const response = await apiFetch( {
					path: `/syzeql/v1/rules/${ id }`,
					method: 'DELETE',
				} );

				if ( ! response.success ) {
					throw new Error( response.message );
				}

				showToast?.(
					__(
						'Rule deleted successfully',
						'syzenlabs-quantity-limits'
					),
					'success'
				);
				setCurrentNav?.( 'rules' );
				await getRules();

				return response.data;
			} catch ( error ) {
				showToast?.(
					__( 'Error deleting rule.', 'syzenlabs-quantity-limits' ),
					'danger'
				);
			} finally {
				setState( ( prev ) => ( {
					...prev,
					deleteLoading: false,
					deleteLoadingId: null,
				} ) );
			}
		},
		[ getRules, setCurrentNav, setState, showToast ]
	);

	const duplicateRule = useCallback(
		async ( id ) => {
			setState( ( prev ) => ( {
				...prev,
				duplicateLoading: true,
				duplicateLoadingId: id,
			} ) );

			try {
				const response = await apiFetch( {
					path: `/syzeql/v1/rules/${ id }/duplicate`,
					method: 'POST',
				} );

				if ( response.success ) {
					showToast?.(
						__(
							'Rule duplicated successfully',
							'syzenlabs-quantity-limits'
						),
						'success'
					);
					return response.data.id;
				}
			} catch ( error ) {
				showToast?.(
					__( 'Error duplicating rule', 'syzenlabs-quantity-limits' ),
					'danger'
				);
			} finally {
				setState( ( prev ) => ( {
					...prev,
					duplicateLoading: false,
					duplicateLoadingId: null,
				} ) );
			}
		},
		[ setState, showToast ]
	);

	const value = useMemo(
		() => ( {
			state,
			updateBuilder,
			setState,
			setInitialLoading,
			getRules,
			getRuleById,
			resetToDefaultState,
			saveRule,
			submitRule,
			updateRule,
			deleteRule,
			duplicateRule,
		} ),
		[
			updateBuilder,
			deleteRule,
			duplicateRule,
			getRuleById,
			getRules,
			resetToDefaultState,
			saveRule,
			setInitialLoading,
			setState,
			state,
			submitRule,
			updateRule,
		]
	);

	return (
		<RuleStoreContext.Provider value={ value }>
			{ children }
		</RuleStoreContext.Provider>
	);
};

export const useRuleStore = () => {
	const context = useContext( RuleStoreContext );
	if ( ! context ) {
		throw new Error( 'useRuleStore must be used within RuleStoreProvider' );
	}
	return context;
};
