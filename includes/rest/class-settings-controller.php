<?php

namespace SYZEQL\Includes\Rest;

use SYZEQL\Includes\DB;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit;

class SettingsController {

	/**
	 * DB Instance
	 *
	 * @var \SYZEQL\Includes\DB
	 */
	private $db;

	public function __construct() {
		$this->db = DB::get_instance();
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			'syzeql/v1',
			'/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'can_manage' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'can_manage' ),
					'args'                => array(
						'settings' => array(
							'required' => true,
						),
					),
				),
			)
		);
	}

	public function can_manage() {
		return current_user_can( 'manage_woocommerce' );
	}

	public function get_settings() {
		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => $this->db->get_rules(),
			)
		);
	}

	public function update_settings( WP_REST_Request $request ) {
		$incoming = $request->get_param( 'data' );
		$incoming = is_array( $incoming ) ? $incoming : array();

		$this->db->update_rule( $incoming );

		return rest_ensure_response(
			array(
				'success' => true,
			)
		);
	}
}
