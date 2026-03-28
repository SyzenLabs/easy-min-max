<?php

namespace EAMM\Includes;

defined( 'ABSPATH' ) || exit;

class RestrictionEvaluator {

	public static function get_limits( $rule, $product ) {

		$limits = array(
			'min_qty'     => is_numeric( $rule['minQuantity'] ?? null ) ? (float) $rule['minQuantity'] : null,
			'max_qty'     => is_numeric( $rule['maxQuantity'] ?? null ) ? (float) $rule['maxQuantity'] : null,
			'step_qty'    => is_numeric( $rule['step'] ?? null ) ? (float) $rule['step'] : null,
			'min_price'   => is_numeric( $rule['minPrice'] ?? null ) ? (float) $rule['minPrice'] : null,
			'max_price'   => is_numeric( $rule['maxPrice'] ?? null ) ? (float) $rule['maxPrice'] : null,
			'initial_qty' => is_numeric( $rule['initialQuantity'] ?? null ) ? (float) $rule['initialQuantity'] : null,
		);

		if ( ! empty( $rule['enableFixedQuantity'] ) ) {
			$fixed_qty         = is_numeric( $rule['fixedQuantity'] ?? null ) ? (float) $rule['fixedQuantity'] : null;
			if ( null !== $fixed_qty ) {
				$limits['min_qty'] = $fixed_qty;
				$limits['max_qty'] = $fixed_qty;
				if ( empty( $limits['initial_qty'] ) ) {
					$limits['initial_qty'] = $fixed_qty;
				}
			}
		}

		$disable_min_on_low_stock = ! empty( $rule['disableMinQuantityOnLowStock'] );

		if ( $disable_min_on_low_stock && $product->managing_stock() ) {
			$stock = $product->get_stock_quantity();
			if ( null !== $stock && ! empty( $limits['min_qty'] ) && $stock < (float) $limits['min_qty'] ) {
				$limits['min_qty'] = null;
			}
		}

		return $limits;
	}
}
