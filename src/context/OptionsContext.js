/* TODO @samin:
 ** 1. search list optimisation
 */

import { useToast } from '@/context/ToastContext';
import { getCurrencyCode, getDimensionUnit, getWeightUnit } from '@/utils';
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
	{ value: 'equal', label: __( 'Equals', 'syzenlabs-quantity-limits' ) },
	{
		value: 'doesntEqual',
		label: __( 'Does not equal', 'syzenlabs-quantity-limits' ),
	},
	{
		value: 'greaterThan',
		label: __( 'Greater than', 'syzenlabs-quantity-limits' ),
	},
	{
		value: 'lesserThan',
		label: __( 'Less than', 'syzenlabs-quantity-limits' ),
	},
	{
		value: 'greaterThanOrEquals',
		label: __( 'Greater than or equal to', 'syzenlabs-quantity-limits' ),
	},
	{
		value: 'lesserThanOrEquals',
		label: __( 'Less than or equal to', 'syzenlabs-quantity-limits' ),
	},
	{ value: 'between', label: __( 'Between', 'syzenlabs-quantity-limits' ) },
];

const operatorType2Options = [
	{ value: 'equal', label: __( 'Equals', 'syzenlabs-quantity-limits' ) },
	{
		value: 'doesntEqual',
		label: __( 'Does not equal', 'syzenlabs-quantity-limits' ),
	},
	{ value: 'contains', label: __( 'Contains', 'syzenlabs-quantity-limits' ) },
	{
		value: 'doesntContains',
		label: __( 'Does not Contain', 'syzenlabs-quantity-limits' ),
	},
];

const operatorType3Options = [
	{ value: 'contains', label: __( 'Contains', 'syzenlabs-quantity-limits' ) },
	{
		value: 'doesntContains',
		label: __( 'Does not Contain', 'syzenlabs-quantity-limits' ),
	},
];

const operatorType4Options = [
	{ value: 'equal', label: __( 'Equals', 'syzenlabs-quantity-limits' ) },
	{
		value: 'doesntEqual',
		label: __( 'Does not equal', 'syzenlabs-quantity-limits' ),
	},
];

const operatorType5Options = [
	{ value: 'equal', label: __( 'Equals', 'syzenlabs-quantity-limits' ) },
	{
		value: 'doesntEqual',
		label: __( 'Does not Equal', 'syzenlabs-quantity-limits' ),
	},
	{ value: 'contains', label: __( 'Contains', 'syzenlabs-quantity-limits' ) },
	{
		value: 'doesntContains',
		label: __( 'Does not Contain', 'syzenlabs-quantity-limits' ),
	},
	{
		value: 'none',
		label: __( 'None Applied', 'syzenlabs-quantity-limits' ),
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
		current_product: [],
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
				current_product: 'products',
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
				path: `/syzenlabs-quantity-limits/v1/condition-data/${
					fieldMap[ field ] ?? field
				}?per_page=9999999&search=${ searchTerm }`,
			} );

			if ( ! response.success ) {
				showToast(
					__( `Failed to fetch data`, 'syzenlabs-quantity-limits' ),
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
				path: `/syzenlabs-quantity-limits/v1/condition-data/attribute`,
			} );

			if ( ! response.success ) {
				throw new Error();
			}

			setAttributeData( response.data );
		} catch ( error ) {
			showToast(
				__(
					'Failed to fetch attributes!',
					'syzenlabs-quantity-limits'
				),
				'warning',
				3000
			);
			return [];
		}
	}, [ showToast ] );

	const getDefaultOptions = useCallback( () => {
		const _def = [
			// {
			// 	label: __( 'General', 'syzenlabs-quantity-limits' ),
			// 	value: 'General',
			// 	children: [
			// 		{
			// 			label: __( 'Always', 'syzenlabs-quantity-limits' ),
			// 			value: 'always',
			// 			operatorType: null,
			// 			component: null,
			// 		},
			// 	],
			// },
			{
				label: __( 'Cart Specific', 'syzenlabs-quantity-limits' ),
				value: 'Cart',
				children: [
					{
						label: __(
							'Cart Quantity',
							'syzenlabs-quantity-limits'
						),
						value: 'cart_quantity',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: __( 'Item(s)', 'syzenlabs-quantity-limits' ),
						},
					},
					{
						label: __( 'Cart Total', 'syzenlabs-quantity-limits' ),
						value: 'cart_total',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getCurrencyCode(),
						},
					},
					{
						label: __(
							'Cart Subtotal',
							'syzenlabs-quantity-limits'
						),
						value: 'cart_subtotal',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getCurrencyCode(),
						},
					},
					{
						label: __( 'Cart Weight', 'syzenlabs-quantity-limits' ),
						value: 'cart_weight',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getWeightUnit(),
						},
					},
					{
						label: __(
							'Cart Coupons',
							'syzenlabs-quantity-limits'
						),
						value: 'cart_coupons',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.coupons || [],
					},
					{
						label: __( 'Cart Length', 'syzenlabs-quantity-limits' ),
						value: 'cart_length',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit(),
						},
					},
					{
						label: __( 'Cart Width', 'syzenlabs-quantity-limits' ),
						value: 'cart_width',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit(),
						},
					},
					{
						label: __( 'Cart Height', 'syzenlabs-quantity-limits' ),
						value: 'cart_height',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit(),
						},
					},
					{
						label: __( 'Cart Volume', 'syzenlabs-quantity-limits' ),
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
				label: __( 'Product Specific', 'syzenlabs-quantity-limits' ),
				value: 'Product',
				children: [
					{
						label: __( 'Product', 'syzenlabs-quantity-limits' ),
						value: 'current_product',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.current_product || [],
					},
					{
						label: __(
							'Product Categories',
							'syzenlabs-quantity-limits'
						),
						value: 'category_products',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.category_products || [],
					},
					{
						label: __(
							'Product Tags',
							'syzenlabs-quantity-limits'
						),
						value: 'tag_products',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.tag_products || [],
					},
					// {
					// 	label: __( 'Product SKU', 'syzenlabs-quantity-limits' ),
					// 	value: 'product_sku',
					// 	operatorType: 'Type5',
					// 	component: 'MultiSelect',
					// 	lazy: true,
					// 	data: optionsData?.attribute || [],
					// },
					{
						label: __(
							'Product Shipping Class',
							'syzenlabs-quantity-limits'
						),
						value: 'shipping_class',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.shippingClass || [],
					},
					{
						label: __(
							'Product Quantity',
							'syzenlabs-quantity-limits'
						),
						value: 'product_quantity',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: __( 'Item(s)', 'syzenlabs-quantity-limits' ),
						},
					},
					{
						label: __(
							'Product Price',
							'syzenlabs-quantity-limits'
						),
						value: 'product_price',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getCurrencyCode(),
						},
					},
					{
						label: __(
							'Product Total',
							'syzenlabs-quantity-limits'
						),
						value: 'product_total',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getCurrencyCode(),
						},
					},
					{
						label: __(
							'Product Weight',
							'syzenlabs-quantity-limits'
						),
						value: 'product_weight',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getWeightUnit(),
						},
					},
					{
						label: __(
							'Product Height',
							'syzenlabs-quantity-limits'
						),
						value: 'product_height',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit(),
						},
					},
					{
						label: __(
							'Product Width',
							'syzenlabs-quantity-limits'
						),
						value: 'product_width',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit(),
						},
					},
					{
						label: __(
							'Product Length',
							'syzenlabs-quantity-limits'
						),
						value: 'product_length',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit(),
						},
					},
					{
						label: __(
							'Product Volume',
							'syzenlabs-quantity-limits'
						),
						value: 'product_volume',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getDimensionUnit( true ),
						},
					},
					{
						label: __(
							'Product Total Sales',
							'syzenlabs-quantity-limits'
						),
						value: 'product_sales',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: __( 'Sale(s)', 'syzenlabs-quantity-limits' ),
						},
					},
				],
			},
			{
				label: __( 'Customer', 'syzenlabs-quantity-limits' ),
				value: 'Customer',
				children: [
					{
						label: __( 'User', 'syzenlabs-quantity-limits' ),
						value: 'user',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.user || [],
					},
					{
						label: __( 'User Role', 'syzenlabs-quantity-limits' ),
						value: 'user_role',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.user_role || [],
					},
					{
						label: __( 'Email', 'syzenlabs-quantity-limits' ),
						value: 'email',
						operatorType: 'Type2',
						component: 'Input',
						inputProps: {
							type: 'email',
						},
					},
					{
						label: __( 'Phone', 'syzenlabs-quantity-limits' ),
						value: 'phone',
						operatorType: 'Type2',
						component: 'Input',
						inputProps: {
							type: 'number',
						},
					},
					{
						label: __(
							'First Order Spent',
							'syzenlabs-quantity-limits'
						),
						value: 'first_order_spent_amount',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getCurrencyCode(),
						},
					},
					{
						label: __(
							'Last Order Spent',
							'syzenlabs-quantity-limits'
						),
						value: 'last_order_spent_amount',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: getCurrencyCode(),
						},
					},
					{
						label: __(
							'Total Number of Orders',
							'syzenlabs-quantity-limits'
						),
						value: 'last_orders_count',
						operatorType: 'Type1',
						component: 'Input',
						inputProps: {
							type: 'number',
							unit: __( 'Order(s)', 'syzenlabs-quantity-limits' ),
						},
					},
				],
			},
			{
				label: __( 'Location', 'syzenlabs-quantity-limits' ),
				value: 'Location',
				children: [
					{
						label: __( 'Country', 'syzenlabs-quantity-limits' ),
						value: 'country',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.country || [],
					},
					{
						label: __( 'State', 'syzenlabs-quantity-limits' ),
						value: 'state',
						operatorType: 'Type2',
						component: 'MultiSelect',
						lazy: true,
						data: optionsData?.state || [],
					},
					{
						label: __( 'City/Town', 'syzenlabs-quantity-limits' ),
						value: 'city_town',
						operatorType: 'Type2',
						component: 'Input',
						inputProps: {
							type: 'text',
						},
					},
					{
						label: __(
							'Zip/Postcode',
							'syzenlabs-quantity-limits'
						),
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
				label: __( 'Others', 'syzenlabs-quantity-limits' ),
				value: 'Others',
				children: [
					{
						label: __( 'Weekday', 'syzenlabs-quantity-limits' ),
						value: 'weekdays',
						operatorType: 'Type3',
						component: 'WeekdayFields',
					},
					{
						label: __( 'Time', 'syzenlabs-quantity-limits' ),
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
