<?php

namespace EAMM\Includes\Frontend;

use EAMM\Includes\ConditionEvaluator;
use EAMM\Includes\DB;

defined( 'ABSPATH' ) || exit;

class Frontend {

	/**
	 * @var \EAMM\Includes\DB
	 */
	private $db;

	public function __construct() {
		add_action( 'init', array( $this, 'init' ) );
	}

	public function init() {
		$this->db = DB::get_instance();
		$rules     = $this->get_applicable_rules();

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

			if ( ConditionEvaluator::evaluate_condition_groups( $rule['conditionGroups'] ?? array() ) ) {
				$valid_rules[] = $rule;
			}
		}

		return $valid_rules;
	}
}
