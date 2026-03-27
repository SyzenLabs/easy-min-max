<?php // phpcs:ignore

namespace EAMM\Includes;

use DateTime;
use EAMM\Traits\Singleton;
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
	private const OPTION_KEY = 'eamm-rules';

	/**
	 * WordPress option key for storing plugin settings.
	 */
	private const SETTINGS_KEY = 'eamm-settings';

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

		return wp_parse_args(
			$settings,
			array()
		);
	}

	/**
	 * Update plugin settings
	 *
	 * @param array $new_settings new settings.
	 * @return void
	 */
	public function update_settings( $new_settings ) {
		$args = wp_parse_args( $new_settings, self::get_settings() );
		update_option( self::SETTINGS_KEY, $args, true );
	}

	/**
	 * Get all shipping rules from the database.
	 *
	 * @return array Array of shipping rules.
	 */
	public function get_rules() {
		return get_option( self::OPTION_KEY, array() );
	}


	/**
	 * Update or add a rule.
	 *
	 * @param array $rule_data The rule data to save.
	 * @return bool|WP_Error True if new rule created, false if updated.
	 */
	public function update_rule( $rule_data ) {
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
	 * @param int    $rule_id The ID of the rule to delete.
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
}
