<?php

namespace EAMM\Includes\Frontend;

use EAMM\Includes\ConditionEvaluator;
use EAMM\Includes\DB;

defined( 'ABSPATH' ) || exit;

/**
 * Frontend
 */
class Frontend {

	/**
	 * @var \EAMM\Includes\DB
	 */
	private $db;

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
	 * Retrieves applicable rules and initializes QuantityUi and Validation classes
	 * if rules are available.
	 *
	 * @return void
	 */
	public function init() {
		$this->db = DB::get_instance();
		$rules    = $this->get_applicable_rules();

		if ( empty( $rules ) ) {
			return;
		}

		new QuantityUi( $rules );
		new Validation( $rules );
	}

	/**
	 * Get applicable rules
	 *
	 * @return array
	 */
	private function get_applicable_rules() {
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
}
