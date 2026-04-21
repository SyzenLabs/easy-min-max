<?php // phpcs:ignore

namespace SZQL\Includes;

use DateTime;
use SZQL\Traits\Singleton;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Database Class
 */
class DB {

	use Singleton;

	/**
	 * WordPress option key for storing shipping rules.
	 */
	private const OPTION_KEY = 'szql-rules';

	/**
	 * WordPress option key for storing plugin settings.
	 */
	private const SETTINGS_KEY = 'szql-settings';

	/**
	 * Get plugin settings
	 *
	 * @return array
	 */
	public function get_settings() {
		$settings = get_option(
			self::SETTINGS_KEY,
			array(),
		);

		return $this->sanitize_settings(
			$settings,
		);
	}

	/**
	 * Update plugin settings
	 *
	 * @param array $new_settings new settings.
	 * @return void
	 */
	public function update_settings( $new_settings ) {
		$args = $this->sanitize_settings( wp_parse_args( $new_settings, $this->get_settings() ) );
		update_option( self::SETTINGS_KEY, $args, true );
	}

	/**
	 * Get all shipping rules from the database.
	 *
	 * @return array Array of shipping rules.
	 */
	public function get_rules() {
		$rules = get_option( self::OPTION_KEY, array() );

		if ( ! is_array( $rules ) ) {
			return array();
		}

		return array_values(
			array_filter(
				array_map( array( $this, 'sanitize_rule' ), $rules ),
				'is_array'
			)
		);
	}


	/**
	 * Update or add a rule.
	 *
	 * @param array $rule_data The rule data to save.
	 * @return bool|WP_Error True if new rule created, false if updated.
	 */
	public function update_rule( $rule_data ) {
		$rule_data = $this->sanitize_rule( $rule_data );

		if ( empty( $rule_data['id'] ) ) {
			return new WP_Error( 'missing_id', 'Rule ID is required', array( 'status' => 400 ) );
		}

		$is_new         = false;
		$existing_rules = $this->get_rules();

		$rule_index = null;
		foreach ( $existing_rules as $index => $existing_rule ) {
			if ( isset( $existing_rule['id'] ) && $existing_rule['id'] === $rule_data['id'] ) {
				$rule_index = $index;
				break;
			}
		}

		if ( null !== $rule_index ) {
			$existing_rules[ $rule_index ] = $rule_data;
		} else {
			$existing_rules[] = $rule_data;
			$is_new           = true;
		}

		update_option( self::OPTION_KEY, $existing_rules );

		return $is_new;
	}


	/**
	 * Update or add a shipping rule batch.
	 *
	 * @param array $rules The rules to save/update.
	 * @return bool
	 */
	public function update_rule_batch( $rules ) {
		foreach ( $rules as $rule ) {
			$this->update_rule( $rule );
		}
		return true;
	}

	/**
	 * Get a single shipping rule by ID.
	 *
	 * @param int $rule_id The rule ID.
	 * @return array|null Rule data or null if not found.
	 */
	public function get_rule_by_id( $rule_id ) {
		$rules = $this->get_rules();

		foreach ( $rules as $rule ) {
			if ( isset( $rule['id'] ) && $rule['id'] === $rule_id ) {
				return $rule;
			}
		}

		return null;
	}

	/**
	 * Delete a rule by ID.
	 *
	 * @param int $rule_id The ID of the rule to delete.
	 * @return bool|WP_Error True on success, WP_Error on failure.
	 */
	public function delete_rule( $rule_id ) {
		if ( empty( $rule_id ) ) {
			return new \WP_Error( 'missing_id', 'Rule ID is required', array( 'status' => 400 ) );
		}

		$existing_rule = $this->get_rule_by_id( $rule_id );

		if ( ! $existing_rule ) {
			return new \WP_Error( 'rule_not_found', 'Rule not found', array( 'status' => 404 ) );
		}

		$updated_rules = array_filter(
			$this->get_rules(),
			function ( $rule ) use ( $rule_id ) {
				return isset( $rule['id'] ) && $rule['id'] !== $rule_id;
			}
		);

		return update_option( self::OPTION_KEY, $updated_rules );
	}

	/**
	 * Get dates between two dates
	 *
	 * @param string $start_date start date.
	 * @param string $end_date end date.
	 * @param string $format date format.
	 * @return array
	 */
	private function get_dates_between( $start_date, $end_date, $format = 'Y-m-d' ) {
		$dates = array();

		$start = new DateTime( $start_date );
		$end   = new DateTime( $end_date );

		$step = ( $start <= $end ) ? 1 : -1;

		while ( ( $step > 0 && $start <= $end ) || ( $step < 0 && $start >= $end ) ) {
			$dates[] = $start->format( $format );
			$start->modify( ( $step > 0 ? '+1 day' : '-1 day' ) );
		}

		return $dates;
	}

	/**
	 * Sanitize plugin settings for storage and output.
	 *
	 * @param array $settings Raw settings.
	 * @return array
	 */
	private function sanitize_settings( $settings ) {
		$settings = is_array( $settings ) ? $settings : array();

		return wp_parse_args(
			array(
				'debugMode'          => ! empty( $settings['debugMode'] ),
				'cleanUpOnUninstall' => ! empty( $settings['cleanUpOnUninstall'] ),
			),
			array(
				'debugMode'          => false,
				'cleanUpOnUninstall' => false,
			)
		);
	}

	/**
	 * Sanitize a single quantity-limit rule.
	 *
	 * @param mixed $rule_data Raw rule data.
	 * @return array
	 */
	private function sanitize_rule( $rule_data ) {
		if ( ! is_array( $rule_data ) ) {
			return array();
		}

		$rule_id = isset( $rule_data['id'] ) ? preg_replace( '/[^A-Za-z0-9_-]/', '', (string) $rule_data['id'] ) : '';

		return array(
			'id'                           => $rule_id,
			'title'                        => sanitize_text_field( $rule_data['title'] ?? '' ),
			'publishMode'                  => in_array( $rule_data['publishMode'] ?? 'draft', array( 'draft', 'publish' ), true ) ? $rule_data['publishMode'] : 'draft',
			'minQuantity'                  => $this->sanitize_decimal_value( $rule_data['minQuantity'] ?? '' ),
			'maxQuantity'                  => $this->sanitize_decimal_value( $rule_data['maxQuantity'] ?? '' ),
			'minPrice'                     => $this->sanitize_decimal_value( $rule_data['minPrice'] ?? '' ),
			'maxPrice'                     => $this->sanitize_decimal_value( $rule_data['maxPrice'] ?? '' ),
			'step'                         => $this->sanitize_decimal_value( $rule_data['step'] ?? 1, 1 ),
			'initialQuantity'              => $this->sanitize_decimal_value( $rule_data['initialQuantity'] ?? 1, 1 ),
			'enableFixedQuantity'          => ! empty( $rule_data['enableFixedQuantity'] ),
			'fixedQuantity'                => $this->sanitize_decimal_value( $rule_data['fixedQuantity'] ?? 1, 1 ),
			'hideCheckoutButton'           => ! empty( $rule_data['hideCheckoutButton'] ),
			'showPriceByQuantity'          => ! empty( $rule_data['showPriceByQuantity'] ),
			'disableMinQuantityOnLowStock' => ! empty( $rule_data['disableMinQuantityOnLowStock'] ),
			'showQuantityInArchive'        => ! empty( $rule_data['showQuantityInArchive'] ),
			'showQuantityDropdown'         => ! empty( $rule_data['showQuantityDropdown'] ),
			'quantityDropdownOptions'      => $this->sanitize_dropdown_options( $rule_data['quantityDropdownOptions'] ?? array() ),
			'minQuantityMessage'           => wp_kses_post( (string) ( $rule_data['minQuantityMessage'] ?? '' ) ),
			'maxQuantityMessage'           => wp_kses_post( (string) ( $rule_data['maxQuantityMessage'] ?? '' ) ),
			'minPriceMessage'              => wp_kses_post( (string) ( $rule_data['minPriceMessage'] ?? '' ) ),
			'maxPriceMessage'              => wp_kses_post( (string) ( $rule_data['maxPriceMessage'] ?? '' ) ),
			'conditionGroups'              => $this->sanitize_condition_groups( $rule_data['conditionGroups'] ?? array() ),
		);
	}

	/**
	 * Sanitize quantity dropdown options.
	 *
	 * @param mixed $options Raw dropdown options.
	 * @return array
	 */
	private function sanitize_dropdown_options( $options ) {
		if ( ! is_array( $options ) ) {
			return array();
		}

		$sanitized = array();

		foreach ( $options as $option ) {
			$raw_value = '';
			$raw_label = '';

			if ( is_array( $option ) ) {
				$raw_value = $option['value'] ?? '';
				$raw_label = $option['label'] ?? $raw_value;
			} else {
				$raw_value = $option;
				$raw_label = $option;
			}

			$sanitized_value = $this->sanitize_decimal_value( $raw_value );

			if ( '' === $sanitized_value ) {
				continue;
			}

			$sanitized[] = array(
				'value' => $sanitized_value,
				'label' => sanitize_text_field( (string) $raw_label ),
			);
		}

		return $sanitized;
	}

	/**
	 * Sanitize builder condition groups.
	 *
	 * @param mixed $groups Raw condition groups.
	 * @return array
	 */
	private function sanitize_condition_groups( $groups ) {
		if ( ! is_array( $groups ) ) {
			return array();
		}

		$sanitized_groups = array();

		foreach ( $groups as $group ) {
			if ( ! is_array( $group ) ) {
				continue;
			}

			$sanitized_group = array();

			foreach ( $group as $condition ) {
				if ( ! is_array( $condition ) ) {
					continue;
				}

				$sanitized_group[] = array(
					'type'      => sanitize_text_field( $condition['type'] ?? '' ),
					'field'     => sanitize_text_field( $condition['field'] ?? '' ),
					'operator'  => null === ( $condition['operator'] ?? null ) ? null : sanitize_text_field( (string) $condition['operator'] ),
					'value'     => $this->sanitize_condition_value( $condition['value'] ?? array() ),
					'min_range' => $this->sanitize_condition_value( $condition['min_range'] ?? '' ),
					'max_range' => $this->sanitize_condition_value( $condition['max_range'] ?? '' ),
				);
			}

			if ( ! empty( $sanitized_group ) ) {
				$sanitized_groups[] = array_values( $sanitized_group );
			}
		}

		return $sanitized_groups;
	}

	/**
	 * Sanitize condition values recursively.
	 *
	 * @param mixed $value Raw condition value.
	 * @return mixed
	 */
	private function sanitize_condition_value( $value ) {
		if ( is_array( $value ) ) {
			$sanitized = array();

			foreach ( $value as $key => $item ) {
				if ( is_string( $key ) ) {
					$key = sanitize_key( $key );
				}

				$sanitized[ $key ] = $this->sanitize_condition_value( $item );
			}

			return $sanitized;
		}

		if ( is_bool( $value ) ) {
			return $value;
		}

		if ( is_int( $value ) || is_float( $value ) ) {
			return $value;
		}

		if ( null === $value ) {
			return '';
		}

		return sanitize_text_field( (string) $value );
	}

	/**
	 * Sanitize decimal-like values while preserving empty strings.
	 *
	 * @param mixed $value Raw value.
	 * @param mixed $fallback Default when value is invalid.
	 * @return string|int|float
	 */
	private function sanitize_decimal_value( $value, $fallback = '' ) {
		if ( '' === $value || null === $value ) {
			return $fallback;
		}

		if ( is_int( $value ) || is_float( $value ) ) {
			return $value;
		}

		$value = wc_format_decimal( (string) $value, false, true );

		return '' === $value ? $fallback : $value;
	}
}
