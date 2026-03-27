<?php

namespace EAMM\Includes\Frontend;

use EAMM\Includes\RestrictionEvaluator;

defined( 'ABSPATH' ) || exit;

class QuantityUi {

	/**
	 * Rules
	 *
	 * @var array
	 */
	private $rules = array();

	public function __construct( $rules ) {
		$this->rules = $this->normalize_rules( $rules );

		add_filter( 'woocommerce_quantity_input_args', array( $this, 'quantity_input_args' ), 10, 2 );
		add_filter( 'woocommerce_quantity_input', array( $this, 'maybe_render_dropdown' ), 10, 2 );
		add_filter( 'woocommerce_available_variation', array( $this, 'variation_data' ), 10, 3 );
		add_action( 'woocommerce_after_shop_loop_item', array( $this, 'archive_quantity_input' ), 15 );
		// add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'wp_head', array( $this, 'custom_css' ) );
		add_action( 'woocommerce_before_add_to_cart_button', array( $this, 'total_price_markup' ) );
	}

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

	public function maybe_render_dropdown( $html, $product ) {
		if ( ! $this->has_enabled_rule_flag( 'showQuantityDropdown' ) ) {
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

		return '<select name="quantity" class="eamm-qty-select">' . $options . '</select>';
	}

	public function variation_data( $data, $product, $variation ) {
		$limits                   = $this->get_combined_limits( $variation );
		$data['eamm_min_qty']     = $limits['min_qty'];
		$data['eamm_max_qty']     = $limits['max_qty'];
		$data['eamm_step_qty']    = $limits['step_qty'];
		$data['eamm_initial_qty'] = $limits['initial_qty'];
		return $data;
	}

	public function archive_quantity_input() {
		if ( ! $this->has_enabled_rule_flag( 'showQuantityInArchive' ) ) {
			return;
		}
		global $product;
		if ( ! $product || ! $product->is_purchasable() ) {
			return;
		}
		woocommerce_quantity_input( array(), $product, false );
	}

	// public function enqueue_assets() {
	// 	wp_enqueue_style( 'eamm-frontend', EAMM_URL . 'assets/css/frontend.css', array(), '0.1.0' );
	// 	wp_enqueue_script( 'eamm-frontend', EAMM_URL . 'assets/js/frontend.js', array( 'jquery' ), '0.1.0', true );
	// 	wp_localize_script(
	// 		'eamm-frontend',
	// 		'eammSettings',
	// 		array(
	// 			'totalPriceEnabled' => $this->settings->get( 'total_price_by_qty' ) === 'yes',
	// 			'qtyDropdown'       => $this->settings->get( 'qty_dropdown' ) === 'yes',
	// 		)
	// 	);
	// }

	public function custom_css() {
		$css_chunks = array();

		foreach ( $this->rules as $rule ) {
			if ( empty( $rule['customCss'] ) ) {
				continue;
			}

			$css_chunks[] = wp_strip_all_tags( $rule['customCss'] );
		}

		if ( ! empty( $css_chunks ) ) {
			echo '<style>' . esc_html( implode( "\n", $css_chunks ) ) . '</style>';
		}
	}

	public function total_price_markup() {
		if ( ! $this->has_enabled_rule_flag( 'showPriceByQuantity' ) ) {
			return;
		}
		global $product;
		if ( ! $product ) {
			return;
		}
		$price = (float) $product->get_price();
		echo '<div class="eamm-total-price" data-price="' . esc_attr( $price ) . '"></div>';
	}

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
	 * Determine whether any applicable rule enables a boolean storefront flag.
	 *
	 * @param string $flag Flag key.
	 * @return bool
	 */
	private function has_enabled_rule_flag( $flag ) {
		foreach ( $this->rules as $rule ) {
			if ( ! empty( $rule[ $flag ] ) ) {
				return true;
			}
		}

		return false;
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
		foreach ( $this->rules as $rule ) {
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
}
