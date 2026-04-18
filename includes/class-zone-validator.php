<?php // phpcs:ignore

namespace SZQL\Includes;

defined( 'ABSPATH' ) || exit;

/**
 * Zone Validation.
 */
class ZoneValidator {

	public const DELIMITER       = '.';
	public const DELIMITER_STATE = '#';

	/**
	 * Get customer region with enhanced logic.
	 *
	 * @return array{
	 *   continent: string|null,
	 *   country: string|null,
	 *   state: string|null,
	 *   city: string|null,
	 *   postcode: string|null,
	 *   address1: string|null,
	 *   address2: string|null
	 * }
	 */
	public static function get_customer_region() { // phpcs:ignore WordPress.NamingConventions.ValidFunctionName.MethodNameInvalid
		static $cache = null;
		if ( null !== $cache ) {
			return $cache;
		}

		if ( ! function_exists( 'WC' ) || empty( WC()->customer ) ) {
			$cache = array(
				'continent' => null,
				'country'   => null,
				'state'     => null,
				'city'      => null,
				'postcode'  => null,
				'address1'  => null,
				'address2'  => null,
			);
			return $cache;
		}

		$customer = WC()->customer; // WC_Customer instance.

		// Primary attempt: shipping fields.
		$country  = $customer->get_shipping_country();
		$state    = $customer->get_shipping_state();
		$city     = $customer->get_shipping_city();
		$postcode = $customer->get_shipping_postcode();
		$address1 = method_exists( $customer, 'get_shipping_address_1' ) ? $customer->get_shipping_address_1() : ( method_exists( $customer, 'get_shipping_address' ) ? $customer->get_shipping_address() : '' );
		$address2 = method_exists( $customer, 'get_shipping_address_2' ) ? $customer->get_shipping_address_2() : '';

		// Fallback wholesale to billing if no shipping country set.
		if ( empty( $country ) ) {
			$country  = $customer->get_billing_country();
			$state    = $customer->get_billing_state();
			$city     = $customer->get_billing_city();
			$postcode = $customer->get_billing_postcode();
			$address1 = method_exists( $customer, 'get_billing_address_1' ) ? $customer->get_billing_address_1() : $address1;
			$address2 = method_exists( $customer, 'get_billing_address_2' ) ? $customer->get_billing_address_2() : $address2;
		}

		$country = $country ? strtoupper( $country ) : '';
		$state   = $state ? strtoupper( $state ) : '';

		$continent = $country ? WC()->countries->get_continent_code_for_country( $country ) : null;

		$cache = array(
			'continent' => ! empty( $continent ) ? $continent : null,
			'country'   => ! empty( $country ) ? $country : null,
			'state'     => ! empty( $state ) ? $state : null,
			'city'      => ! empty( $city ) ? $city : null,
			'postcode'  => ! empty( $postcode ) ? $postcode : null,
			'address1'  => ! empty( $address1 ) ? $address1 : null,
			'address2'  => ! empty( $address2 ) ? $address2 : null,
		);

		return $cache;
	}
}
