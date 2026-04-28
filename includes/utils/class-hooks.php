<?php //phpcs:ignore
/**
 * Class Hooks
 */

namespace SYZEQL\Includes\Utils;

use SYZEQL\Includes\DB;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Hooks class.
 */
class Hooks {

	/**
	 * Constructor
	 */
	public function __construct() {
		// All Woo Hook Related Work goes here.
		$this->maybe_enable_decimal_quantities();
		add_filter( 'syzeql_get_allowed_html_tags', array( $this, 'allowed_html_tags' ), 10, 1 );
	}

	/**
	 * Enable decimal WooCommerce quantities when any saved rule uses decimal values.
	 *
	 * @return void
	 */
	private function maybe_enable_decimal_quantities() {
		$rules = DB::get_instance()->get_rules();

		if ( ! $this->has_decimal_quantity_rules( $rules ) ) {
			return;
		}

		remove_filter( 'woocommerce_stock_amount', 'intval' );
		add_filter( 'woocommerce_stock_amount', array( $this, 'stock_amount' ), 10 );
	}

	/**
	 * Normalize WooCommerce stock amounts to floats when decimal quantity rules exist.
	 *
	 * @param int|float|string $amount Stock amount.
	 * @return int|float
	 */
	public function stock_amount( $amount ) {
		if ( ! is_numeric( $amount ) ) {
			return intval( $amount );
		}

		return (float) $amount;
	}

	/**
	 * Determine whether any saved rule uses decimal quantity values.
	 *
	 * @param array $rules Rules to inspect.
	 * @return bool
	 */
	private function has_decimal_quantity_rules( $rules ) {
		foreach ( $rules as $rule ) {
			if ( $this->rule_uses_decimal_quantities( $rule ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Determine whether a rule uses any decimal quantity values.
	 *
	 * @param array $rule Rule configuration.
	 * @return bool
	 */
	private function rule_uses_decimal_quantities( $rule ) {
		$fields = array(
			$rule['minQuantity'] ?? null,
			$rule['maxQuantity'] ?? null,
			$rule['step'] ?? null,
			$rule['initialQuantity'] ?? null,
		);

		if ( ! empty( $rule['enableFixedQuantity'] ) ) {
			$fields[] = $rule['fixedQuantity'] ?? null;
		}

		foreach ( $fields as $value ) {
			if ( $this->is_decimal_number( $value ) ) {
				return true;
			}
		}

		return false;
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
	 * Set Allowed Html
	 *
	 * @param array $extras Allowed htmls.
	 *
	 * @return array
	 */
	public function allowed_html_tags( $extras = array() ) {
		$allowed = array(
			'del'      => array(),
			'ins'      => array(),
			'select'   => array(
				'multiple' => true,
				'data-*'   => true,
			),
			'option'   => array(
				'value'  => true,
				'data-*' => true,
			),
			'strong'   => array(),
			'b'        => array(),
			'input'    => array(
				'data-*'       => true,
				'type'         => true,
				'value'        => true,
				'placeholder'  => true,
				'name'         => true,
				'id'           => true,
				'min'          => true,
				'max'          => true,
				'format'       => true,
				'class'        => true,
				'step'         => true,
				'disabled'     => true,
				'readonly'     => true,
				'required'     => true,
				'maxlength'    => true,
				'minlength'    => true,
				'pattern'      => true,
				'autocomplete' => true,
				'accept'       => true,
			),
			'textarea' => array(
				'data-*'       => true,
				'type'         => true,
				'value'        => true,
				'placeholder'  => true,
				'name'         => true,
				'id'           => true,
				'min'          => true,
				'max'          => true,
				'rows'         => true,
				'format'       => true,
				'class'        => true,
				'disabled'     => true,
				'readonly'     => true,
				'required'     => true,
				'maxlength'    => true,
				'minlength'    => true,
				'pattern'      => true,
				'autocomplete' => true,
				'accept'       => true,
			),
			'svg'      => array(
				'xmlns'        => true,
				'width'        => true,
				'height'       => true,
				'viewbox'      => true,
				'fill'         => true,
				'stroke'       => true,
				'stroke-width' => true,
			),
			'g'        => array(
				'fill'            => true,
				'stroke'          => true,
				'opacity'         => true,
				'stroke-linecap'  => true,
				'stroke-linejoin' => true,
				'stroke-width'    => true,
				'clip-path'       => true,
			),
			'path'     => array(
				'd'               => true,
				'fill'            => true,
				'stroke'          => true,
				'stroke-linecap'  => true,
				'stroke-linejoin' => true,
				'stroke-width'    => true,
				'clip-rule'       => true,
			),
			'rect'     => array(
				'rx'           => true,
				'width'        => true,
				'height'       => true,
				'fill'         => true,
				'stroke'       => true,
				'stroke-width' => true,
			),
			'defs'     => array(),
			'clipPath' => array(
				'id' => true,
			),
			'style'    => array(
				'id'     => true,
				'type'   => true,
				'media'  => true,
				'title'  => true,
				'scoped' => true,
				'data-*' => true,
			),
		);

		return array_merge( wp_kses_allowed_html( 'post' ), $allowed, $extras );
	}
}
