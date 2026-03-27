<?php

namespace EAMM\Includes\Rest;

use WC_Shipping_Zones;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit;

class MetaController {
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			'eamm/v1',
			'/meta',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_meta' ),
					'permission_callback' => array( $this, 'can_manage' ),
				),
			)
		);
	}

	public function can_manage() {
		return current_user_can( 'manage_woocommerce' );
	}

	public function get_meta( WP_REST_Request $request ) {
		return rest_ensure_response(
			array(
				'products'         => $this->get_products(),
				'variations'       => $this->get_variations(),
				'categories'       => $this->get_terms( 'product_cat' ),
				'tags'             => $this->get_terms( 'product_tag' ),
				'colors'           => $this->get_terms( 'pa_color' ),
				'sizes'            => $this->get_terms( 'pa_size' ),
				'attributes'       => $this->get_attributes(),
				'shipping_classes' => $this->get_terms( 'product_shipping_class' ),
				'shipping_zones'   => $this->get_shipping_zones(),
				'shipping_methods' => $this->get_shipping_methods(),
				'payment_methods'  => $this->get_payment_methods(),
				'coupons'          => $this->get_coupons(),
				'roles'            => $this->get_roles(),
				'visibility'       => $this->get_terms( 'product_visibility' ),
				'stock_statuses'   => function_exists( 'wc_get_product_stock_status_options' ) ? wc_get_product_stock_status_options() : array(),
			)
		);
	}

	private function get_products() {
		$product_ids = get_posts(
			array(
				'post_type'      => 'product',
				'post_status'    => 'publish',
				'posts_per_page' => 200,
				'fields'         => 'ids',
			)
		);
		$results     = array();
		foreach ( $product_ids as $product_id ) {
			$results[] = array(
				'id'   => $product_id,
				'name' => get_the_title( $product_id ),
			);
		}
		return $results;
	}

	private function get_variations() {
		$variation_ids = get_posts(
			array(
				'post_type'      => 'product_variation',
				'post_status'    => array( 'publish', 'private' ),
				'posts_per_page' => 200,
				'fields'         => 'ids',
			)
		);
		$results       = array();
		foreach ( $variation_ids as $variation_id ) {
			$results[] = array(
				'id'        => $variation_id,
				'name'      => get_the_title( $variation_id ),
				'parent_id' => (int) wp_get_post_parent_id( $variation_id ),
			);
		}
		return $results;
	}

	private function get_terms( $taxonomy ) {
		if ( ! taxonomy_exists( $taxonomy ) ) {
			return array();
		}
		$terms = get_terms(
			array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
			)
		);
		if ( is_wp_error( $terms ) ) {
			return array();
		}
		return array_map(
			function ( $term ) {
				return array(
					'id'   => $term->term_id,
					'name' => $term->name,
				);
			},
			$terms
		);
	}

	private function get_attributes() {
		if ( ! function_exists( 'wc_get_attribute_taxonomies' ) ) {
			return array();
		}
		$taxonomies = wc_get_attribute_taxonomies();
		$results    = array();
		foreach ( $taxonomies as $tax ) {
			$results[] = array(
				'id'   => $tax->attribute_id,
				'name' => $tax->attribute_label,
				'slug' => 'pa_' . $tax->attribute_name,
			);
		}
		return $results;
	}

	private function get_shipping_zones() {
		if ( ! class_exists( 'WC_Shipping_Zones' ) ) {
			return array();
		}
		$zones   = array();
		$entries = WC_Shipping_Zones::get_zones();
		foreach ( $entries as $entry ) {
			$zones[] = array(
				'id'   => $entry['id'],
				'name' => $entry['zone_name'],
			);
		}
		$zones[] = array(
			'id'   => 0,
			'name' => 'Rest of the world',
		);
		return $zones;
	}

	private function get_shipping_methods() {
		if ( ! function_exists( 'WC' ) || ! WC()->shipping ) {
			return array();
		}
		$methods = WC()->shipping->get_shipping_methods();
		$results = array();
		foreach ( $methods as $method ) {
			$results[] = array(
				'id'   => $method->id,
				'name' => $method->method_title,
			);
		}
		return $results;
	}

	private function get_payment_methods() {
		if ( ! function_exists( 'WC' ) ) {
			return array();
		}
		$gateways = WC()->payment_gateways ? WC()->payment_gateways->get_available_payment_gateways() : array();
		$results  = array();
		foreach ( $gateways as $gateway ) {
			$results[] = array(
				'id'   => $gateway->id,
				'name' => $gateway->get_title(),
			);
		}
		return $results;
	}

	private function get_coupons() {
		$coupons = get_posts(
			array(
				'post_type'      => 'shop_coupon',
				'post_status'    => 'publish',
				'posts_per_page' => 200,
				'fields'         => 'ids',
			)
		);
		$results = array();
		foreach ( $coupons as $coupon_id ) {
			$results[] = array(
				'id'   => $coupon_id,
				'name' => get_the_title( $coupon_id ),
			);
		}
		return $results;
	}

	private function get_roles() {
		$roles = wp_roles();
		if ( ! $roles ) {
			return array();
		}
		$results = array();
		foreach ( $roles->roles as $key => $role ) {
			$results[] = array(
				'id'   => $key,
				'name' => $role['name'],
			);
		}
		return $results;
	}
}
