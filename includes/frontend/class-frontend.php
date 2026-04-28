<?php
/**
 * Frontend storefront rules handler.
 *
 * @package SYZEQL\Includes\Frontend
 */

namespace SYZEQL\Includes\Frontend;

use SYZEQL\Includes\ConditionEvaluator;
use SYZEQL\Includes\DB;
use SYZEQL\Includes\RestrictionEvaluator;
use WC_Product;

defined( 'ABSPATH' ) || exit;

/**
 * Frontend
 */
class Frontend {

	/**
	 * Database instance.
	 *
	 * @var \SYZEQL\Includes\DB
	 */
	private $db;

	/**
	 * Rules
	 *
	 * @var array
	 */
	private $rules = array();

	/**
	 * Constructor
	 *
	 * Hooks the init method to the WordPress 'init' action.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'init' ) );
	}

	/**
	 * Initialize frontend functionality
	 *
	 * Retrieves published rules and registers storefront hooks when rules exist.
	 *
	 * @return void
	 */
	public function init() {
		$this->db    = DB::get_instance();
		$this->rules = $this->get_published_rules();

		if ( empty( $this->rules ) ) {
			return;
		}

		add_filter( 'woocommerce_quantity_input_args', array( $this, 'quantity_input_args' ), 9999, 2 );
		add_filter( 'woocommerce_quantity_input', array( $this, 'maybe_render_dropdown' ), 10, 2 );
		add_filter( 'woocommerce_available_variation', array( $this, 'variation_data' ), 10, 3 );
		add_action( 'woocommerce_after_shop_loop_item', array( $this, 'archive_quantity_input' ), 15 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'wp_head', array( $this, 'custom_css' ) );
		add_action( 'woocommerce_before_add_to_cart_button', array( $this, 'total_price_markup' ) );
		add_filter( 'woocommerce_add_to_cart_validation', array( $this, 'add_to_cart_validation' ), 10, 4 );
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
	 * Get published rules
	 *
	 * @return array
	 */
	private function get_published_rules() {
		$rules = $this->db->get_rules();

		if ( empty( $rules ) ) {
			return array();
		}

		$valid_rules = array();

		foreach ( $rules as $rule ) {
			if ( 'publish' !== $rule['publishMode'] ) {
				continue;
			}

			$valid_rules[] = $rule;
		}

		return $valid_rules;
	}

	/**
	 * Filter WooCommerce quantity input arguments.
	 *
	 * Applies the combined min, max, step, and initial quantity limits from
	 * all matching rules to the quantity field arguments.
	 *
	 * @param array       $args    Quantity input arguments.
	 * @param \WC_Product $product Current product.
	 * @return array Modified quantity input arguments.
	 */
	public function quantity_input_args( $args, $product ) {
		$limits = $this->get_combined_limits( $product );

		if ( null !== $limits['min_qty'] ) {
			$args['min_value'] = (float) $limits['min_qty'];
		}
		if ( null !== $limits['max_qty'] ) {
			$args['max_value'] = (float) $limits['max_qty'];
		}
		if ( null !== $limits['step_qty'] ) {
			$args['step'] = (float) $limits['step_qty'];
		}
		if ( null !== $limits['initial_qty'] ) {
			$args['input_value'] = (float) $limits['initial_qty'];
		}

		if ( $this->limits_allow_decimal_quantities( $limits ) ) {
			$args['pattern']   = '';
			$args['inputmode'] = 'decimal';
		}

		return $args;
	}

	/**
	 * Optionally replace the quantity input with a dropdown.
	 *
	 * When the `showQuantityDropdown` flag is enabled by any active rule, the
	 * standard text input is replaced with a `<select>` element populated with
	 * the resolved quantity options.
	 *
	 * @param string      $html    Original quantity input HTML.
	 * @param \WC_Product $product Current product.
	 * @return string Either the original HTML or a dropdown `<select>` element.
	 */
	public function maybe_render_dropdown( $html, $product ) {
		if ( ! $this->has_enabled_rule_flag( 'showQuantityDropdown', $product ) ) {
			return $html;
		}

		$limits = $this->get_combined_limits( $product );
		$values = $this->get_dropdown_values( $product );

		$min  = (float) ( null !== $limits['min_qty'] ? $limits['min_qty'] : 1 );
		$max  = (float) ( null !== $limits['max_qty'] ? $limits['max_qty'] : $min + 20 );
		$step = (float) ( null !== $limits['step_qty'] ? $limits['step_qty'] : 1 );

		if ( $step <= 0 ) {
			$step = 1;
		}

		if ( $max <= $min ) {
			$max = $min + ( $step * 20 );
		}

		if ( empty( $values ) ) {
			for ( $qty = $min; $qty <= $max; $qty += $step ) {
				$values[] = wc_format_decimal( $qty );
				if ( count( $values ) > 200 ) {
					break;
				}
			}
		}

		$input_value = $min;

		if ( null !== $limits['initial_qty'] ) {
			$input_value = (float) $limits['initial_qty'];
		} elseif ( ! empty( $values ) ) {
			$input_value = reset( $values );
		}

		if ( isset( $_REQUEST['quantity'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$input_value = wc_clean( wp_unslash( $_REQUEST['quantity'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		}

		$options = '';
		foreach ( $values as $value ) {
			$selected = selected( $input_value, $value, false );
			$options .= '<option value="' . esc_attr( $value ) . '"' . $selected . '>' . esc_html( $value ) . '</option>';
		}

		return '<select name="quantity" class="qty syzeql-qty-select">' . $options . '</select>';
	}

	/**
	 * Append SYZEQL quantity limits to variation data.
	 *
	 * Adds `syzeql_min_qty`, `syzeql_max_qty`, `syzeql_step_qty`,
	 * `syzeql_initial_qty`, and `syzeql_dropdown_values` keys to the variation data array so the frontend
	 * script can update the quantity field when a variation is selected.
	 *
	 * @param array                 $data      Variation data array.
	 * @param \WC_Product_Variable  $_product  Parent variable product.
	 * @param \WC_Product_Variation $variation Selected variation.
	 * @return array Modified variation data.
	 */
	public function variation_data( $data, $_product, $variation ) {
		$limits                         = $this->get_combined_limits( $variation );
		$data['syzeql_min_qty']         = $limits['min_qty'];
		$data['syzeql_max_qty']         = $limits['max_qty'];
		$data['syzeql_step_qty']        = $limits['step_qty'];
		$data['syzeql_initial_qty']     = $limits['initial_qty'];
		$data['syzeql_dropdown_values'] = $this->get_dropdown_values( $variation );
		return $data;
	}

	/**
	 * Render a quantity input on shop/archive pages.
	 *
	 * Outputs a WooCommerce quantity input after each product in the loop when
	 * the `showQuantityInArchive` flag is enabled by any active rule.
	 *
	 * @return void
	 */
	public function archive_quantity_input() {
		global $product;
		if ( ! $this->has_enabled_rule_flag( 'showQuantityInArchive', $product ) ) {
			return;
		}
		if ( ! $product || ! $product->is_purchasable() ) {
			return;
		}
		woocommerce_quantity_input( array(), $product, false );
	}

	/**
	 * Enqueue Scripts.
	 *
	 * @return void
	 */
	public function enqueue_assets() {
		if ( ! $this->should_enqueue_assets() ) {
			return;
		}

		$asset = require SYZEQL_PATH . 'assets/js/syzeql-frontend.asset.php';

		$dependencies = ! empty( $asset['dependencies'] ) && is_array( $asset['dependencies'] )
			? $asset['dependencies']
			: array();

		if ( ! in_array( 'jquery', $dependencies, true ) ) {
			$dependencies[] = 'jquery';
		}

		$css_file = is_rtl() ? 'style-syzeql-frontend-rtl.css' : 'style-syzeql-frontend.css';
		$css_path = SYZEQL_PATH . 'assets/js/' . $css_file;
		$js_path  = SYZEQL_PATH . 'assets/js/syzeql-frontend.js';

		$script_version = file_exists( $js_path ) ? (string) filemtime( $js_path ) : ( $asset['version'] ?? SYZEQL_VER );
		$style_version  = file_exists( $css_path ) ? (string) filemtime( $css_path ) : $script_version;

		wp_enqueue_style( 'syzeql-frontend', SYZEQL_URL . 'assets/js/' . $css_file, array(), $style_version );

		wp_enqueue_script( 'syzeql-frontend', SYZEQL_URL . 'assets/js/syzeql-frontend.js', $dependencies, $script_version, true );

		wp_localize_script(
			'syzeql-frontend',
			'syzeqlSettings',
			$this->get_frontend_settings()
		);
	}

	/**
	 * Output custom CSS from active rules.
	 *
	 * Collects `customCss` values from all rules and prints them inside a
	 * `<style>` tag in the page `<head>`.
	 *
	 * @return void
	 */
	public function custom_css() {
		$css_chunks = array();
		$product    = $this->get_current_product();

		foreach ( $this->get_applicable_rules( $product ) as $rule ) {
			if ( empty( $rule['customCss'] ) ) {
				continue;
			}

			$css_chunks[] = wp_strip_all_tags( $rule['customCss'] );
		}

		if ( ! empty( $css_chunks ) ) {
			echo '<style id="syzeql-custom-css">' . esc_html( implode( "\n", $css_chunks ) ) . '</style>';
		}
	}

	/**
	 * Render the dynamic total-price container on single product pages.
	 *
	 * Outputs an empty `<div>` with the unit price stored in a `data-price`
	 * attribute. The frontend script listens to quantity changes and updates
	 * the displayed total when the `showPriceByQuantity` flag is active.
	 *
	 * @return void
	 */
	public function total_price_markup() {
		global $product;
		if ( ! $product ) {
			return;
		}
		if ( ! $this->has_enabled_rule_flag( 'showPriceByQuantity', $product ) ) {
			return;
		}
		$price = (float) $product->get_price();
		echo '<div class="syzeql-total-price" data-price="' . esc_attr( $price ) . '"></div>';
	}

	/**
	 * Validate product quantity/price when adding to cart.
	 *
	 * @param bool $passed        Whether add-to-cart validation has already passed.
	 * @param int  $product_id    Product ID from the add-to-cart request.
	 * @param int  $quantity      Requested quantity.
	 * @param int  $variation_id  Variation ID when adding a variation product.
	 * @return bool
	 */
	public function add_to_cart_validation( $passed, $product_id, $quantity, $variation_id = 0 ) {
		$target_id = $variation_id ? $variation_id : $product_id;
		$product   = wc_get_product( $target_id );
		if ( ! $product ) {
			return $passed;
		}
		$passed = $this->validate_quantity( $passed, $product, $quantity );
		return $passed;
	}

	/**
	 * Validate product quantity/price when updating cart item.
	 *
	 * @param bool   $passed         Whether update-cart validation has already passed.
	 * @param string $_cart_item_key Cart item key being updated.
	 * @param array  $values         Cart item data.
	 * @param int    $quantity       Requested quantity.
	 * @return bool
	 */
	public function update_cart_validation( $passed, $_cart_item_key, $values, $quantity ) {
		$product = $values['data'];
		$passed  = $this->validate_quantity( $passed, $product, $quantity );
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
	}

	/**
	 * Validate a single product's quantity and price against rules.
	 *
	 * @param bool       $passed   Whether validation has passed so far.
	 * @param WC_Product $product  Product being validated.
	 * @param float|int  $quantity Requested quantity.
	 * @return bool
	 */
	private function validate_quantity( $passed, $product, $quantity ) {
		foreach ( $this->get_applicable_rules( $product ) as $rule ) {
			$limits    = RestrictionEvaluator::get_limits( $rule, $product );
			$min       = $limits['min_qty'];
			$max       = $limits['max_qty'];
			$min_price = $limits['min_price'];
			$max_price = $limits['max_price'];
			$price     = ( ( (float) wc_get_price_excluding_tax( $product ) ) * ( (float) $quantity ) );

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

			if ( ! $this->is_valid_step_quantity( (float) $quantity, $limits ) ) {
				wc_add_notice( $this->get_step_quantity_message( $rule, $product, $quantity, $limits ), 'error' );
				return false;
			}
		}

		return $passed;
	}

	/**
	 * Filter: Set the quantity step (multiple_of) for Store API.
	 *
	 * @param float|int $multiple_of Existing Store API multiple-of value.
	 * @param mixed     $cart_item   Cart item or product identifier.
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
	 * @param float|int $minimum   Existing Store API minimum value.
	 * @param mixed     $cart_item Cart item or product identifier.
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
	 * @param float|int $maximum   Existing Store API maximum value.
	 * @param mixed     $cart_item Cart item or product identifier.
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
	 * @param string     $template Message template.
	 * @param WC_Product $product  Product being validated.
	 * @param int        $quantity Submitted quantity.
	 * @param array      $limits   Resolved rule limits.
	 * @return string
	 */
	private function format_message( $template, $product, $quantity, $limits ) {
		$replacements = array(
			'[current_quantity]' => $quantity,
			'[min_quantity]'     => $limits['min_qty'],
			'[max_quantity]'     => $limits['max_qty'],
			'[min_price]'        => wp_strip_all_tags( wc_price( $limits['min_price'] ) ),
			'[max_price]'        => wp_strip_all_tags( wc_price( $limits['max_price'] ) ),
			'[product_name]'     => $product->get_name(),
			'[step_quantity]'    => $limits['step_qty'],
			'[inputed_quantity]' => $quantity,
			'[variation_name]'   => $product->is_type( 'variation' ) ? $product->get_name() : '',
			'[fixed_quanitity]'  => $limits['fixed_qty'],
		);
		return strtr( $template, $replacements );
	}

	/**
	 * Build a fallback validation message for invalid step quantities.
	 *
	 * @param array      $rule     Rule config.
	 * @param WC_Product $product  Product being validated.
	 * @param float|int  $quantity Submitted quantity.
	 * @param array      $limits   Resolved rule limits.
	 * @return string
	 */
	private function get_step_quantity_message( $rule, $product, $quantity, $limits ) {
		$template = isset( $rule['stepQuantityMessage'] ) ? (string) $rule['stepQuantityMessage'] : '';

		if ( '' === trim( wp_strip_all_tags( $template ) ) ) {
			if ( null !== $limits['min_qty'] ) {
				$template = __( 'Please choose a quantity in increments of [step_quantity] starting from [min_quantity].', 'syzenlabs-quantity-limits' );
			} else {
				$template = __( 'Please choose a quantity in increments of [step_quantity].', 'syzenlabs-quantity-limits' );
			}
		}

		return $this->format_message( $template, $product, $quantity, $limits );
	}

	/**
	 * Filter: Hide the checkout button in the cart widget if rule requires.
	 *
	 * @param bool $hidden Existing widget hidden state.
	 * @return bool
	 */
	public function hide_widget_checkout( $hidden ) {
		foreach ( $this->get_applicable_rules() as $rule ) {
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
		foreach ( $this->get_applicable_rules() as $rule ) {
			if ( ! empty( $rule['hideCheckoutButton'] ) ) {
				echo '<style>.checkout-button, a.checkout-button{display:none !important;}</style>';
				return;
			}
		}
	}

	/**
	 * Determine whether any applicable rule enables a boolean storefront flag.
	 *
	 * @param string           $flag    Flag key.
	 * @param \WC_Product|null $product Product context.
	 * @return bool
	 */
	private function has_enabled_rule_flag( $flag, $product = null ) {
		foreach ( $this->get_applicable_rules( $product ) as $rule ) {
			if ( ! empty( $rule[ $flag ] ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Determine whether the resolved limits need decimal input behavior.
	 *
	 * @param array $limits Resolved rule limits.
	 * @return bool
	 */
	private function limits_allow_decimal_quantities( $limits ) {
		foreach ( array( 'min_qty', 'max_qty', 'step_qty', 'initial_qty', 'fixed_qty' ) as $key ) {
			if ( $this->is_decimal_number( $limits[ $key ] ?? null ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Determine whether a quantity satisfies the configured step.
	 *
	 * @param float $quantity Submitted quantity.
	 * @param array $limits   Resolved rule limits.
	 * @return bool
	 */
	private function is_valid_step_quantity( $quantity, $limits ) {
		$step = isset( $limits['step_qty'] ) ? (float) $limits['step_qty'] : 0.0;

		if ( $step <= 0 ) {
			return true;
		}

		$base_value = null !== $limits['min_qty'] ? (float) $limits['min_qty'] : 0.0;
		$ratio      = ( $quantity - $base_value ) / $step;
		$rounded    = round( $ratio );

		return abs( $ratio - $rounded ) < 0.00001;
	}

	/**
	 * Determine whether a numeric value contains a decimal component.
	 *
	 * @param mixed $value Value to inspect.
	 * @return bool
	 */
	private function is_decimal_number( $value ) {
		if ( ! is_numeric( $value ) ) {
			return false;
		}

		$number = (float) $value;

		return abs( $number - round( $number ) ) > 0.00001;
	}

	/**
	 * Determine whether storefront assets are needed for the current request.
	 *
	 * @return bool
	 */
	private function should_enqueue_assets() {
		if ( is_admin() ) {
			return false;
		}

		if ( function_exists( 'is_product' ) && is_product() ) {
			return ! empty( $this->get_applicable_rules( $this->get_current_product() ) );
		}

		if ( ! $this->has_enabled_rule_flag( 'showQuantityInArchive' ) ) {
			return false;
		}

		if ( function_exists( 'is_shop' ) && is_shop() ) {
			return true;
		}

		return function_exists( 'is_product_taxonomy' ) && is_product_taxonomy();
	}

	/**
	 * Build localized frontend settings for the storefront script.
	 *
	 * @return array
	 */
	private function get_frontend_settings() {
		$product = $this->get_current_product();

		return array(
			'totalPriceEnabled'       => $this->has_enabled_rule_flag( 'showPriceByQuantity', $product ),
			'quantityDropdownEnabled' => $this->has_enabled_rule_flag( 'showQuantityDropdown', $product ),
			'currency'                => array(
				'symbol'            => html_entity_decode( get_woocommerce_currency_symbol(), ENT_QUOTES, 'UTF-8' ),
				'format'            => html_entity_decode( get_woocommerce_price_format(), ENT_QUOTES, 'UTF-8' ),
				'decimalSeparator'  => wc_get_price_decimal_separator(),
				'thousandSeparator' => wc_get_price_thousand_separator(),
				'decimals'          => wc_get_price_decimals(),
				'trimZeros'         => (bool) apply_filters( 'woocommerce_price_trim_zeros', false ),
			),
			'i18n'                    => array(
				'totalLabel' => __( 'Total:', 'syzenlabs-quantity-limits' ),
			),
		);
	}

	/**
	 * Combine quantity limits across all applicable rules.
	 *
	 * @param \WC_Product $product Product object.
	 * @return array
	 */
	private function get_combined_limits( $product ) {
		$combined_limits = array(
			'min_qty'     => null,
			'max_qty'     => null,
			'step_qty'    => null,
			'initial_qty' => null,
		);

		foreach ( $this->get_applicable_rules( $product ) as $rule ) {
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

			if ( null !== $limits['initial_qty'] && null === $combined_limits['initial_qty'] ) {
				$combined_limits['initial_qty'] = (float) $limits['initial_qty'];
			}
		}

		if (
			null !== $combined_limits['min_qty'] &&
			null !== $combined_limits['max_qty'] &&
			$combined_limits['max_qty'] < $combined_limits['min_qty']
		) {
			$combined_limits['max_qty'] = $combined_limits['min_qty'];
		}

		if ( null !== $combined_limits['initial_qty'] ) {
			if ( null !== $combined_limits['min_qty'] ) {
				$combined_limits['initial_qty'] = max( $combined_limits['initial_qty'], $combined_limits['min_qty'] );
			}

			if ( null !== $combined_limits['max_qty'] ) {
				$combined_limits['initial_qty'] = min( $combined_limits['initial_qty'], $combined_limits['max_qty'] );
			}
		}

		return $combined_limits;
	}

	/**
	 * Resolve explicit quantity dropdown options from the first matching rule that defines them.
	 *
	 * @param \WC_Product $product Product object.
	 * @return array
	 */
	private function get_dropdown_values( $product ) {
		foreach ( $this->get_applicable_rules( $product ) as $rule ) {
			if ( empty( $rule['showQuantityDropdown'] ) || empty( $rule['quantityDropdownOptions'] ) || ! is_array( $rule['quantityDropdownOptions'] ) ) {
				continue;
			}

			$limits = RestrictionEvaluator::get_limits( $rule, $product );
			$values = array();

			foreach ( $rule['quantityDropdownOptions'] as $option ) {
				$raw_value = '';

				if ( is_array( $option ) ) {
					$raw_value = $option['value'] ?? $option['label'] ?? '';
				} else {
					$raw_value = $option;
				}

				if ( ! is_numeric( $raw_value ) ) {
					continue;
				}

				$numeric_value = (float) $raw_value;

				if ( null !== $limits['min_qty'] && $numeric_value < (float) $limits['min_qty'] ) {
					continue;
				}

				if ( null !== $limits['max_qty'] && $numeric_value > (float) $limits['max_qty'] ) {
					continue;
				}

				$values[] = wc_format_decimal( $numeric_value );
			}

			if ( ! empty( $values ) ) {
				return array_values( array_unique( $values ) );
			}
		}

		return array();
	}

	/**
	 * Filter rules against the current request or product context.
	 *
	 * @param WC_Product|null $product Product context.
	 * @return array
	 */
	private function get_applicable_rules( $product = null ) {
		$applicable_rules = array();

		foreach ( $this->rules as $rule ) {
			if ( ! empty( $rule['enableConditions'] ) ) {
				if ( ! ConditionEvaluator::evaluate_condition_groups( $rule['conditionGroups'] ?? array(), $product ) ) {
					continue;
				}
			}

			$applicable_rules[] = $rule;
		}

		return $applicable_rules;
	}

	/**
	 * Resolve the current product from the main query when needed.
	 *
	 * @return \WC_Product|null
	 */
	private function get_current_product() {
		global $product;

		if ( $product instanceof \WC_Product ) {
			return $product;
		}

		$product_id = get_queried_object_id();
		if ( $product_id > 0 ) {
			$current_product = wc_get_product( $product_id );
			if ( $current_product instanceof \WC_Product ) {
				return $current_product;
			}
		}

		return null;
	}
}
