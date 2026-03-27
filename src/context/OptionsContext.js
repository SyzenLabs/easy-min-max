/* TODO @samin:
 ** 1. search list optimisation
 */

import { useToast } from '@/context/ToastContext';
import {
	getCurrencyCode,
	getDimensionUnit,
	getFlags,
	getWeightUnit,
} from '@/utils';
import apiFetch from '@wordpress/api-fetch';
import {
	createContext,
	useCallback,
	useContext,
	useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const ShippingOptionsContext = createContext();

// Operator options for different condition types
const operatorType1Options = [
	{ value: 'equal', label: __( 'Equals', 'easy-min-max' ) },
	{
		value: 'doesntEqual',
		label: __( 'Does not equal', 'easy-min-max' ),
	},
	{
		value: 'greaterThan',
		label: __( 'Greater than', 'easy-min-max' ),
	},
	{
		value: 'lesserThan',
		label: __( 'Less than', 'easy-min-max' ),
	},
	{
		value: 'greaterThanOrEquals',
		label: __( 'Greater than or equal to', 'easy-min-max' ),
	},
	{
		value: 'lesserThanOrEquals',
		label: __( 'Less than or equal to', 'easy-min-max' ),
	},
	{ value: 'between', label: __( 'Between', 'easy-min-max' ) },
];

const operatorType2Options = [
	{ value: 'equal', label: __( 'Equals', 'easy-min-max' ) },
	{
		value: 'doesntEqual',
		label: __( 'Does not equal', 'easy-min-max' ),
	},
	{ value: 'contains', label: __( 'Contains', 'easy-min-max' ) },
	{
		value: 'doesntContains',
		label: __( 'Does not Contain', 'easy-min-max' ),
	},
];

const operatorType3Options = [
	{ value: 'contains', label: __( 'Contains', 'easy-min-max' ) },
	{
		value: 'doesntContains',
		label: __( 'Does not Contain', 'easy-min-max' ),
	},
];

const operatorType4Options = [
	{ value: 'equal', label: __( 'Equals', 'easy-min-max' ) },
	{
		value: 'doesntEqual',
		label: __( 'Does not equal', 'easy-min-max' ),
	},
];

const operatorType5Options = [
	{ value: 'equal', label: __( 'Equals', 'easy-min-max' ) },
	{
		value: 'doesntEqual',
		label: __( 'Does not Equal', 'easy-min-max' ),
	},
	{ value: 'contains', label: __( 'Contains', 'easy-min-max' ) },
	{
		value: 'doesntContains',
		label: __( 'Does not Contain', 'easy-min-max' ),
	},
	{
		value: 'none',
		label: __( 'None Applied', 'easy-min-max' ),
	},
];

const getOperatorOptions = ( type ) => {
	switch ( type ) {
		case 'Type1':
			return operatorType1Options;
		case 'Type2':
			return operatorType2Options;
		case 'Type3':
			return operatorType3Options;
		case 'Type4':
			return operatorType4Options;
		case 'Type5':
			return operatorType5Options;
		default:
			return operatorType1Options;
	}
};

export const ShippingOptionsProvider = ( { children } ) => {
	const { showToast } = useToast();

	const [ attributeData, setAttributeData ] = useState( [] );

	const [ optionsData, setOptionsData ] = useState( {
		// eslint-disable-next-line camelcase
		cart_contains_products: [],
		// eslint-disable-next-line camelcase
		category_products: [],
		// eslint-disable-next-line camelcase
		tag_products: [],
		user: [],
		// eslint-disable-next-line camelcase
		user_role: [],
		color: [],
		size: [],
		country: [],
		state: [],
		attribute: [],
		shippingClass: [],
		coupons: [],
		weekdays: [],
	} );

	const getConditionDataOptions = useCallback(
		async ( { field, searchTerm = '' } ) => {
			const fieldMap = {
				// eslint-disable-next-line camelcase
				cart_contains_products: 'products',
				// eslint-disable-next-line camelcase
				category_products: 'categories',
				// eslint-disable-next-line camelcase
				tag_products: 'tags',
				user: 'users',
				// eslint-disable-next-line camelcase
				user_role: 'user_roles',
				shippingClass: 'shipping-class',
			};
			const response = await apiFetch( {
				path: `/easy-min-max/v1/condition-data/${
					fieldMap[ field ] ?? field
				}?per_page=9999999&search=${ searchTerm }`,
			} );

			if ( ! response.success ) {
				showToast(
					__( `Failed to fetch data`, 'easy-min-max' ),
					'error'
				);
				return [];
			}
			return Array.isArray( response.data )
				? setOptionsData( ( prev ) => {
						return {
							...prev,
							[ field ]: response.data.map( ( item ) => ( {
								...item,
								image: item.image || false,
								...( item.name && { label: item.name } ),
								...( item.id && { value: item.id } ),
							} ) ),
						};
				  } )
				: [];
		},
		[ showToast ]
	);

	const getAttributeData = useCallback( async () => {
		try {
			const response = await apiFetch( {
				path: `/easy-min-max/v1/condition-data/attribute`,
			} );

			if ( ! response.success ) {
				throw new Error();
			}

			setAttributeData( response.data );
		} catch ( error ) {
			showToast(
				__( 'Failed to fetch attributes!', 'easy-min-max' ),
				'warning',
				3000
			);
			return [];
		}
	}, [ showToast ] );

	const getDefaultOptions = useCallback( () => {
		const { CONDITION_FREE_OPTIONS } = getFlags();

		const _def = [
			{
				label: __( 'General', 'easy-min-max' ),
				value: 'General',
				children: [
					{
						label: __( 'Always', 'easy-min-max' ),
						value: 'always',
						operatorType: null,
						component: null,
					},
				],
			},
			{
				label: __( 'Cart Specific', 'easy-min-max' ),
				value: 'Cart',
				children: [
					{
						label: __( 'Cart Quantity', 'easy-min-max' ),
						value: 'cart_quantity',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: __( 'Item(s)', 'easy-min-max' ),
						},
					},
					{
						label: __( 'Cart Total', 'easy-min-max' ),
						value: 'cart_total',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getCurrencyCode(),
						},
					},
					{
						label: __( 'Cart Subtotal', 'easy-min-max' ),
						value: 'cart_subtotal',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getCurrencyCode(),
						},
					},
					{
						label: __( 'Cart Weight', 'easy-min-max' ),
						value: 'cart_weight',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getWeightUnit(),
						},
					},
					{
						label: __( 'Cart Coupons', 'easy-min-max' ),
						value: 'cart_coupons',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.coupons || [],
					},
					{
						label: __( 'Cart Length', 'easy-min-max' ),
						value: 'cart_length',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit(),
						},
					},
					{
						label: __( 'Cart Width', 'easy-min-max' ),
						value: 'cart_width',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit(),
						},
					},
					{
						label: __( 'Cart Height', 'easy-min-max' ),
						value: 'cart_height',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit(),
						},
					},
					{
						label: __( 'Cart Volume', 'easy-min-max' ),
						value: 'cart_volume',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit( true ),
						},
					},
				],
			},
			{
				label: __( 'Product Specific', 'easy-min-max' ),
				value: 'Product',
				children: [
					{
						label: __( 'Product', 'easy-min-max' ),
						value: 'cart_contains_products',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.cart_contains_products || [],
					},
					{
						label: __( 'Product Categories', 'easy-min-max' ),
						value: 'category_products',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.category_products || [],
					},
					{
						label: __( 'Product Tags', 'easy-min-max' ),
						value: 'tag_products',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.tag_products || [],
					},
					// {
					// 	label: __( 'Product SKU', 'easy-min-max' ),
					// 	value: 'product_sku',
					// 	operatorType: 'Type5',
					// 	component: 'MultiSelect',
					// 	lazy: true,
					// 	data: optionsData?.attribute || [],
					// },
					{
						label: __( 'Product Shipping Class', 'easy-min-max' ),
						value: 'shipping_class',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.shippingClass || [],
					},
					{
						label: __( 'Product Quantity', 'easy-min-max' ),
						value: 'product_quantity',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: __( 'Item(s)', 'easy-min-max' ),
						},
					},
					{
						label: __( 'Product Price', 'easy-min-max' ),
						value: 'product_price',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getCurrencyCode(),
						},
					},
					{
						label: __( 'Product Total', 'easy-min-max' ),
						value: 'product_total',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getCurrencyCode(),
						},
					},
					{
						label: __( 'Product Weight', 'easy-min-max' ),
						value: 'product_weight',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getWeightUnit(),
						},
					},
					{
						label: __( 'Product Height', 'easy-min-max' ),
						value: 'product_height',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit(),
						},
					},
					{
						label: __( 'Product Width', 'easy-min-max' ),
						value: 'product_width',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit(),
						},
					},
					{
						label: __( 'Product Length', 'easy-min-max' ),
						value: 'product_length',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit(),
						},
					},
					{
						label: __( 'Product Volume', 'easy-min-max' ),
						value: 'product_volume',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit( true ),
						},
					},
				],
			},
			{
				label: __( 'Customer', 'easy-min-max' ),
				value: 'Customer',
				children: [
					{
						label: __( 'User', 'easy-min-max' ),
						value: 'user',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.user || [],
					},
					{
						label: __( 'User Role', 'easy-min-max' ),
						value: 'user_role',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.user_role || [],
					},
					{
						label: __( 'Email', 'easy-min-max' ),
						value: 'email',
						operatorType: 'Type2',
						component: 'Input',
						inputProps: {
							type: 'email',
						},
					},
					{
						label: __( 'Phone', 'easy-min-max' ),
						value: 'phone',
						operatorType: 'Type2',
						component: 'Input',
						inputProps: {
							type: 'number',
						},
					},
					{
						label: __( 'First Order Spent', 'easy-min-max' ),
						value: 'first_order_spent_amount',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getCurrencyCode(),
						},
					},
					{
						label: __( 'Last Order Spent', 'easy-min-max' ),
						value: 'last_order_spent_amount',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getCurrencyCode(),
						},
					},
					{
						label: __( 'Total Number of Orders', 'easy-min-max' ),
						value: 'last_orders_count',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: __( 'Order(s)', 'easy-min-max' ),
						},
					},
				],
			},
			{
				label: __( 'Location', 'easy-min-max' ),
				value: 'Location',
				children: [
					{
						label: __( 'Country', 'easy-min-max' ),
						value: 'country',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.country || [],
					},
					{
						label: __( 'State', 'easy-min-max' ),
						value: 'state',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.state || [],
					},
					{
						label: __( 'City/Town', 'easy-min-max' ),
						value: 'city_town',
						operatorType: 'Type2',
						component: 'Input',
						inputProps: {
							type: 'text',
						},
					},
					{
						label: __( 'Zip/Postcode', 'easy-min-max' ),
						value: 'zip_code',
						operatorType: 'Type2',
						component: 'Input',
						inputProps: {
							type: 'text',
						},
					},
				],
			},
			{
				label: __( 'Others', 'easy-min-max' ),
				value: 'Others',
				children: [
					{
						label: __( 'Weekday', 'easy-min-max' ),
						value: 'weekdays',
						operatorType: 'Type3',
						component: 'WeekdayFields',
					},
					{
						label: __( 'Time', 'easy-min-max' ),
						value: 'time',
						operatorType: 'Type4',
						component: 'TimeFields',
					},
				],
			},
		];

		if ( attributeData.length > 0 ) {
			_def.push( {
				label: 'Attribute',
				value: 'Attribute',
				children: attributeData.map( ( item ) => ( {
					label: item.label,
					value: item.value,
					pro: !! item.pro,
					operatorType: 'Type2',
					component: 'MultiSelect',
					lazy: true,
					data: optionsData?.[ item.value ] || [],
				} ) ),
			} );
		}

		return _def.map( ( parent ) => {
			const newChildren = parent.children.map( ( child ) => {
				return {
					...child,
					pro: ! CONDITION_FREE_OPTIONS.includes( child.value ),
				};
			} );

			return {
				...parent,
				children: newChildren,
			};
		} );
	}, [ optionsData, attributeData ] );

	const value = {
		optionsData,
		attributeData,
		getAttributeData,
		getConditionDataOptions,
		getOperatorOptions,
		getDefaultOptions,
	};

	return (
		<ShippingOptionsContext.Provider value={ value }>
			{ children }
		</ShippingOptionsContext.Provider>
	);
};

export const useShippingOptions = () => {
	const context = useContext( ShippingOptionsContext );
	if ( ! context ) {
		throw new Error(
			'useShippingOptions must be used within a ShippingOptionsProvider'
		);
	}
	return context;
};
