# Easy Min Max

- [ ] Implement router


## Data Structure

```json
{
	"id": "easy-min-max",
	"title": "My Cool Rule",
	"enabled": true,
	"minQuantity": 1,
	"maxQuantity": 10,
	"minPrice": 10,
	"maxPrice": 100,
	"step": 1,
	"initialQuantity": 1,
	"fixedQuantity": 1,
	"hideCheckoutButton": false,
	"showPriceByQuantity": false,
	"minQuantityMessage": "You must order at least [min_quantity] items.",
	"maxQuantityMessage": "You cannot order more than [max_quantity] items.",
	"minPriceMessage": "Your order must be at least [min_price].",
	"maxPriceMessage": "Your order cannot exceed [max_price].",
	"customCss": "",
	"disableMinQuantityOnLowStock": false,
	"showQuantityInArchive": false,
	"showQuantityDropdown": false,
	"quantityDropdownOptions": [
		{
			"value": 1,
			"label": "1"
		},
		{
			"value": 2,
			"label": "2"
		},
		{
			"value": 3,
			"label": "3"
		}
	],
	"conditionGroups": [
		[
			// AND group
			{
				"type": "product",
				"operator": "eq",
				"value": [1, 2, 3]
			},
			{
				"type": "userRole",
				"operator": "neq",
				"value": [ "subscriber" ]
			}
		],

		// OR group
		[
			{
				"type": "category",
				"operator": "eq",
				"value": [4, 5, 6]
			},
			{
				"type": "cartTotal",
				"operator": "gt",
				"value": 100
			}
		]

	]
}
```
