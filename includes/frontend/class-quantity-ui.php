<?php

namespace EAMM\Includes\Frontend;

use EAMM\Includes\ConditionEvaluator;
use EAMM\Includes\RestrictionEvaluator;

defined( 'ABSPATH' ) || exit;

/**
 * Quantity UI
 */
class QuantityUi {

	/**
	 * Rules
	 *
	 * @var array
	 */
	private $rules = array();

	/**
	 * Constructor.
	 *
	 * Normalises the provided rules and registers all WooCommerce hooks
	 * needed to apply quantity limits and UI customisations on the storefront.
	 *
	 * @param array|mixed $rules A single rule array or a list of rule arrays.
	 */
	public function __construct( $rules ) {
		$this->rules = $this->normalize_rules( $rules );

		add_filter( 'woocommerce_quantity_input_args', array( $this, 'quantity_input_args' ), 9999, 2 );
		add_filter( 'woocommerce_quantity_input', array( $this, 'maybe_render_dropdown' ), 10, 2 );
		add_filter( 'woocommerce_available_variation', array( $this, 'variation_data' ), 10, 3 );
		add_action( 'woocommerce_after_shop_loop_item', array( $this, 'archive_quantity_input' ), 15 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'wp_head', array( $this, 'custom_css' ) );
		add_action( 'woocommerce_before_add_to_cart_button', array( $this, 'total_price_markup' ) );
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

		if ( isset( $_REQUEST['quantity'] ) ) {
			$input_value = wc_clean( wp_unslash( $_REQUEST['quantity'] ) );
		}

		$options = '';
		foreach ( $values as $value ) {
			$selected = selected( $input_value, $value, false );
			$options .= '<option value="' . esc_attr( $value ) . '"' . $selected . '>' . esc_html( $value ) . '</option>';
		}

		return '<select name="quantity" class="qty eamm-qty-select">' . $options . '</select>';
	}

	/**
	 * Append EAMM quantity limits to variation data.
	 *
	 * Adds `eamm_min_qty`, `eamm_max_qty`, `eamm_step_qty`,
	 * `eamm_initial_qty`, and `eamm_dropdown_values` keys to the variation data array so the frontend
	 * script can update the quantity field when a variation is selected.
	 *
	 * @param array                 $data      Variation data array.
	 * @param \WC_Product_Variable  $product   Parent variable product.
	 * @param \WC_Product_Variation $variation Selected variation.
	 * @return array Modified variation data.
	 */
	public function variation_data( $data, $product, $variation ) {
		$limits                   = $this->get_combined_limits( $variation );
		$data['eamm_min_qty']     = $limits['min_qty'];
		$data['eamm_max_qty']     = $limits['max_qty'];
		$data['eamm_step_qty']    = $limits['step_qty'];
		$data['eamm_initial_qty'] = $limits['initial_qty'];
		$data['eamm_dropdown_values'] = $this->get_dropdown_values( $variation );
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

		$asset = require EAMM_PATH . 'assets/js/eamm-frontend.asset.php';

		$dependencies = ! empty( $asset['dependencies'] ) && is_array( $asset['dependencies'] )
			? $asset['dependencies']
			: array();

		if ( ! in_array( 'jquery', $dependencies, true ) ) {
			$dependencies[] = 'jquery';
		}

		$css_file = is_rtl() ? 'style-eamm-frontend-rtl.css' : 'style-eamm-frontend.css';
		$css_path = EAMM_PATH . 'assets/js/' . $css_file;
		$js_path  = EAMM_PATH . 'assets/js/eamm-frontend.js';

		$script_version = file_exists( $js_path ) ? (string) filemtime( $js_path ) : ( $asset['version'] ?? EAMM_VER );
		$style_version  = file_exists( $css_path ) ? (string) filemtime( $css_path ) : $script_version;

		wp_enqueue_style( 'eamm-frontend', EAMM_URL . 'assets/js/' . $css_file, array(), $style_version );

		wp_enqueue_script( 'eamm-frontend', EAMM_URL . 'assets/js/eamm-frontend.js', $dependencies, $script_version, true );

		wp_localize_script(
			'eamm-frontend',
			'eammSettings',
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
			echo '<style>' . esc_html( implode( "\n", $css_chunks ) ) . '</style>';
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
		echo '<div class="eamm-total-price" data-price="' . esc_attr( $price ) . '"></div>';
	}

	/**
	 * Normalize the constructor input to a li2st of rule arrays.
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
				'totalLabel' => __( 'Total:', 'easy-min-max' ),
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
	 * @param \WC_Product|null $product Product context.
	 * @return array
	 */
	private function get_applicable_rules( $product = null ) {
		$applicable_rules = array();

		foreach ( $this->rules as $rule ) {
			if ( ConditionEvaluator::evaluate_condition_groups( $rule['conditionGroups'] ?? array(), $product ) ) {
				$applicable_rules[] = $rule;
			}
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
