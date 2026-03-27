<?php

namespace EAMM\Includes\Frontend;

use EAMM\Includes\RestrictionEvaluator;
use WC_Product;

defined( 'ABSPATH' ) || exit;


/**
 * Handles validation of product and cart quantity/price rules for WooCommerce.
 *
 * Hooks into WooCommerce validation and cart actions to enforce min/max/step rules.
 *
 * @package EAMM\Includes\Frontend
 */
class Validation {

	/**
	 * Rules
	 *
	 * @var array
	 */
	private $rules = array();

	/**
	 * Validation constructor.
	 *
	 * @param array $rules Array of rule definitions.
	 */
	public function __construct( $rules ) {
		$this->rules = $this->normalize_rules( $rules );

		add_filter( 'woocommerce_add_to_cart_validation', array( $this, 'add_to_cart_validation' ), 10, 5 );
		add_filter( 'woocommerce_update_cart_validation', array( $this, 'update_cart_validation' ), 10, 4 );
		add_action( 'woocommerce_check_cart_items', array( $this, 'check_cart_items' ) );
		add_action( 'woocommerce_checkout_process', array( $this, 'check_cart_items' ) );
		add_filter( 'woocommerce_widget_cart_is_hidden', array( $this, 'hide_widget_checkout' ) );
		add_action( 'wp_footer', array( $this, 'maybe_hide_checkout_button' ) );
		add_filter( 'woocommerce_store_api_product_quantity_multiple_of', array( $this, 'store_api_quantity_multiple_of' ), 10, 2 );
		add_filter( 'woocommerce_store_api_product_quantity_minimum', array( $this, 'store_api_quantity_minimum' ), 10, 2 );
		add_filter( 'woocommerce_store_api_product_quantity_maximum', array( $this, 'store_api_quantity_maximum' ), 10, 2 );
	}

	/**
	 * Validate product quantity/price when adding to cart.
	 *
	 * @param bool  $passed
	 * @param int   $product_id
	 * @param int   $quantity
	 * @param int   $variation_id
	 * @param array $variations
	 * @return bool
	 */
	public function add_to_cart_validation( $passed, $product_id, $quantity, $variation_id = 0, $variations = array() ) {
		$target_id = $variation_id ? $variation_id : $product_id;
		$product   = wc_get_product( $target_id );
		if ( ! $product ) {
			return $passed;
		}
		$passed = $this->validate_quantity( $passed, $product, $quantity );
		// return $this->validate_cart_limits( $passed, $product, $quantity );
		return $passed;
	}

	/**
	 * Validate product quantity/price when updating cart item.
	 *
	 * @param bool   $passed
	 * @param string $cart_item_key
	 * @param array  $values
	 * @param int    $quantity
	 * @return bool
	 */
	public function update_cart_validation( $passed, $cart_item_key, $values, $quantity ) {
		$product = $values['data'];
		$passed  = $this->validate_quantity( $passed, $product, $quantity );
		// return $this->validate_cart_limits( $passed );
		return $passed;
	}

	/**
	 * Validate all cart items for quantity/price rules.
	 *
	 * @return void
	 */
	public function check_cart_items() {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return;
		}
		foreach ( WC()->cart->get_cart() as $cart_item ) {
			$product  = $cart_item['data'];
			$quantity = $cart_item['quantity'];
			$this->validate_quantity( true, $product, $quantity );
		}
		// $this->validate_cart_limits( true );
	}

	/**
	 * Validate a single product's quantity and price against rules.
	 *
	 * @param bool       $passed
	 * @param WC_Product $product
	 * @param int        $quantity
	 * @return bool
	 */
	private function validate_quantity( $passed, $product, $quantity ) {
		foreach ( $this->rules as $rule ) {
			$limits    = RestrictionEvaluator::get_limits( $rule, $product );
			$min       = $limits['min_qty'];
			$max       = $limits['max_qty'];
			$min_price = $limits['min_price'];
			$max_price = $limits['max_price'];
			$price     = (float) wc_get_price_excluding_tax( $product );

			if ( null !== $min_price && $price < $min_price ) {
				wc_add_notice( $this->format_message( $rule['minPriceMessage'] ?? '', $product, $quantity, $limits ), 'error' );
				return false;
			}

			if ( null !== $max_price && $price > $max_price ) {
				wc_add_notice( $this->format_message( $rule['maxPriceMessage'] ?? '', $product, $quantity, $limits ), 'error' );
				return false;
			}

			if ( null !== $min && $quantity < $min ) {
				wc_add_notice( $this->format_message( $rule['minQuantityMessage'] ?? '', $product, $quantity, $limits ), 'error' );
				return false;
			}

			if ( null !== $max && $quantity > $max ) {
				wc_add_notice( $this->format_message( $rule['maxQuantityMessage'] ?? '', $product, $quantity, $limits ), 'error' );
				return false;
			}
		}

		// if ( null !== $step && $step > 0 ) {
		// $base = $min ? $min : 0;
		// $diff = abs( $quantity - $base );
		// $mod  = fmod( $diff, $step );
		// if ( $mod > 0.00001 && ( $step - $mod ) > 0.00001 ) {
		// wc_add_notice( $this->format_message( $this->settings->get( 'error_msg_step' ), $product, $quantity, $limits ), 'error' );
		// return false;
		// }
		// }

		return $passed;
	}

	/**
	 * Filter: Set the quantity step (multiple_of) for Store API.
	 *
	 * @param float|int $multiple_of
	 * @param mixed     $cart_item
	 * @return float|int
	 */
	public function store_api_quantity_multiple_of( $multiple_of, $cart_item ) {
		$product = $cart_item instanceof WC_Product ? $cart_item : wc_get_product( $cart_item );
		if ( ! $product ) {
			return $multiple_of;
		}
		$limits = $this->get_combined_limits( $product );
		if ( ! empty( $limits['step_qty'] ) ) {
			$multiple_of = (float) $limits['step_qty'];
		}
		return $multiple_of;
	}

	/**
	 * Filter: Set the minimum quantity for Store API.
	 *
	 * @param float|int $minimum
	 * @param mixed     $cart_item
	 * @return float|int
	 */
	public function store_api_quantity_minimum( $minimum, $cart_item ) {
		$product = $cart_item instanceof WC_Product ? $cart_item : wc_get_product( $cart_item );
		if ( ! $product ) {
			return $minimum;
		}
		$limits = $this->get_combined_limits( $product );
		if ( ! empty( $limits['min_qty'] ) ) {
			$minimum = (float) $limits['min_qty'];
		}
		return $minimum;
	}

	/**
	 * Filter: Set the maximum quantity for Store API.
	 *
	 * @param float|int $maximum
	 * @param mixed     $cart_item
	 * @return float|int
	 */
	public function store_api_quantity_maximum( $maximum, $cart_item ) {
		$product = $cart_item instanceof WC_Product ? $cart_item : wc_get_product( $cart_item );
		if ( ! $product ) {
			return $maximum;
		}
		$limits = $this->get_combined_limits( $product );
		if ( ! empty( $limits['max_qty'] ) ) {
			$maximum = (float) $limits['max_qty'];
		}
		return $maximum;
	}

	/**
	 * Format a validation error message for a product.
	 *
	 * @param string     $template
	 * @param WC_Product $product
	 * @param int        $quantity
	 * @param array      $limits
	 * @return string
	 */
	private function format_message( $template, $product, $quantity, $limits ) {
		$replacements = array(
			'[current_quantity]' => $quantity,
			'[min_quantity]'     => $limits['min_qty'],
			'[max_quantity]'     => $limits['max_qty'],
			'[min_price]'        => $limits['min_price'],
			'[max_price]'        => $limits['max_price'],
			'[product_name]'     => $product->get_name(),
			'[step_quantity]'    => $limits['step_qty'],
			'[inputed_quantity]' => $quantity,
			'[variation_name]'   => $product->is_type( 'variation' ) ? $product->get_name() : '',
		);
		return strtr( $template, $replacements );
	}

	/**
	 * Format a validation error message for the cart.
	 *
	 * @param string $template
	 * @param int    $cart_qty
	 * @param float  $cart_amount
	 * @param array  $limits
	 * @return string
	 */
	private function format_cart_message( $template, $cart_qty, $cart_amount, $limits ) {
		$replacements = array(
			'[cart_quantity]'     => $cart_qty,
			'[min_cart_quantity]' => $limits['min_cart_qty'],
			'[max_cart_quantity]' => $limits['max_cart_qty'],
			'[cart_amount]'       => wc_format_decimal( $cart_amount ),
			'[min_cart_amount]'   => $limits['min_cart_amount'],
			'[max_cart_amount]'   => $limits['max_cart_amount'],
		);
		return strtr( $template, $replacements );
	}

	// private function validate_cart_limits( $passed, $product = null, $quantity = 0 ) {
	// if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
	// return $passed;
	// }
	// $cart_qty    = (int) WC()->cart->get_cart_contents_count();
	// $cart_amount = (float) WC()->cart->get_subtotal();

	// if ( $product ) {
	// $price        = (float) wc_get_price_excluding_tax( $product );
	// $cart_qty    += (int) $quantity;
	// $cart_amount += $price * (float) $quantity;
	// }

	// $limits  = $this->rules->get_cart_limits();
	// $min_qty = $limits['min_cart_qty'];
	// $max_qty = $limits['max_cart_qty'];
	// $min_amt = $limits['min_cart_amount'];
	// $max_amt = $limits['max_cart_amount'];

	// if ( '' !== $min_qty && $cart_qty < (int) $min_qty ) {
	// wc_add_notice( $this->format_cart_message( $this->settings->get( 'error_msg_min_cart_qty' ), $cart_qty, $cart_amount, $limits ), 'error' );
	// return false;
	// }
	// if ( '' !== $max_qty && $cart_qty > (int) $max_qty ) {
	// wc_add_notice( $this->format_cart_message( $this->settings->get( 'error_msg_max_cart_qty' ), $cart_qty, $cart_amount, $limits ), 'error' );
	// return false;
	// }
	// if ( '' !== $min_amt && $cart_amount < (float) $min_amt ) {
	// wc_add_notice( $this->format_cart_message( $this->settings->get( 'error_msg_min_cart_amount' ), $cart_qty, $cart_amount, $limits ), 'error' );
	// return false;
	// }
	// if ( '' !== $max_amt && $cart_amount > (float) $max_amt ) {
	// wc_add_notice( $this->format_cart_message( $this->settings->get( 'error_msg_max_cart_amount' ), $cart_qty, $cart_amount, $limits ), 'error' );
	// return false;
	// }

	// return $passed;
	// }

	/**
	 * Filter: Hide the checkout button in the cart widget if rule requires.
	 *
	 * @param bool $hidden
	 * @return bool
	 */
	public function hide_widget_checkout( $hidden ) {
		foreach ( $this->rules as $rule ) {
			if ( ! empty( $rule['hideCheckoutButton'] ) ) {
				return true;
			}
		}

		return $hidden;
	}

	/**
	 * Action: Maybe hide the checkout button on the frontend if rule requires.
	 *
	 * @return void
	 */
	public function maybe_hide_checkout_button() {
		foreach ( $this->rules as $rule ) {
			if ( ! empty( $rule['hideCheckoutButton'] ) ) {
				echo '<style>.checkout-button, a.checkout-button{display:none !important;}</style>';
				return;
			}
		}
	}

	/**
	 * Normalize the constructor input to a list of rule arrays.
	 *
	 * @param mixed $rules Rules input.
	 * @return array
	 */
	/**
	 * Normalize the constructor input to a list of rule arrays.
	 *
	 * @param mixed $rules Rules input.
	 * @return array
	 */
	private function normalize_rules( $rules ) {
		if ( empty( $rules ) || ! is_array( $rules ) ) {
			return array();
		}

		if ( isset( $rules['id'] ) || isset( $rules['publishMode'] ) ) {
			return array( $rules );
		}

		return array_values(
			array_filter(
				$rules,
				'is_array'
			)
		);
	}

	/**
	 * Combine store API quantity limits across matching rules.
	 *
	 * @param WC_Product $product Product object.
	 * @return array
	 */
	/**
	 * Combine store API quantity limits across matching rules.
	 *
	 * @param WC_Product $product Product object.
	 * @return array
	 */
	private function get_combined_limits( $product ) {
		$combined_limits = array(
			'min_qty'  => null,
			'max_qty'  => null,
			'step_qty' => null,
		);

		foreach ( $this->rules as $rule ) {
			$limits = RestrictionEvaluator::get_limits( $rule, $product );

			if ( null !== $limits['min_qty'] ) {
				$combined_limits['min_qty'] = null === $combined_limits['min_qty']
					? (float) $limits['min_qty']
					: max( (float) $combined_limits['min_qty'], (float) $limits['min_qty'] );
			}

			if ( null !== $limits['max_qty'] ) {
				$combined_limits['max_qty'] = null === $combined_limits['max_qty']
					? (float) $limits['max_qty']
					: min( (float) $combined_limits['max_qty'], (float) $limits['max_qty'] );
			}

			if ( null !== $limits['step_qty'] ) {
				$combined_limits['step_qty'] = null === $combined_limits['step_qty']
					? (float) $limits['step_qty']
					: max( (float) $combined_limits['step_qty'], (float) $limits['step_qty'] );
			}
		}

		if (
			null !== $combined_limits['min_qty'] &&
			null !== $combined_limits['max_qty'] &&
			$combined_limits['max_qty'] < $combined_limits['min_qty']
		) {
			$combined_limits['max_qty'] = $combined_limits['min_qty'];
		}

		return $combined_limits;
	}
}
