<?php

namespace SZQL\Includes\Rest;

use SZQL\Includes\DB;
use SZQL\Includes\Utils;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit;

class RulesController {

	/**
	 * DB Instance
	 *
	 * @var \SZQL\Includes\DB
	 */
	private $db;

	public function __construct() {
		$this->db = DB::get_instance();
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			'szql/v1',
			'/rules',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_rules' ),
					'permission_callback' => array( $this, 'can_manage' ),
				),
			)
		);

		register_rest_route(
			'szql/v1',
			'/rules/(?P<id>[a-zA-Z0-9_-]+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_rule_by_id' ),
					'permission_callback' => array( $this, 'can_manage' ),
				),
			)
		);

		register_rest_route(
			'szql/v1',
			'/rules',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'update_rule' ),
				'permission_callback' => array( $this, 'can_manage' ),
			),
		);

		register_rest_route(
			'szql/v1',
			'/rules/(?P<id>[a-zA-Z0-9_-]+)',
			array(
				'methods'             => 'DELETE',
				'callback'            => array( $this, 'delete_rule' ),
				'args'                => array(
					'id' => array(
						'required'          => true,
						'validate_callback' => function ( $param ) {
							return sanitize_text_field( $param ) === $param;
						},
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
				'permission_callback' => array( $this, 'can_manage' ),
			),
		);
	}

	public function get_rules() {
		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => $this->db->get_rules(),
			)
		);
	}

	public function get_rule_by_id( WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );
		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => $this->db->get_rule_by_id( $id ),
			)
		);
	}

	public function update_rule( WP_REST_Request $request ) {
		$rule = $request->get_json_params();
		$res  = $this->db->update_rule( $rule );
		return rest_ensure_response(
			array(
				'success' => ! is_wp_error( $res ),
				'data'    => array(
					'is_new' => is_wp_error( $res ) ? null : $res,
					'rule'   => $rule,
					'error'  => is_wp_error( $res ) ? $res->get_error_message() : null,
				),
			)
		);
	}

	public function delete_rule( WP_REST_Request $request ) {
		$id  = $request->get_param( 'id' );
		$res = $this->db->delete_rule( $id );
		return rest_ensure_response(
			array(
				'success' => ! is_wp_error( $res ),
				'data'    => is_wp_error( $res ) ? $res->get_error_message() : null,
			)
		);
	}

	public function can_manage() {
		return Utils::is_user_admin();
	}
}
