<?php // phpcs:ignore
/**
 * Initialization Action.
 *
 * @package EAMM
 */
namespace EAMM\Includes;

use EAMM\Includes\Frontend\Frontend;
use EAMM\Includes\Utils\Options;
use EAMM\Includes\Utils\Notice;
use EAMM\Includes\Utils\Hooks;
use EAMM\Includes\Rest\Rest;
use EAMM\Includes\Utils\Deactive;
use EAMM\Includes\Utils\Flags;
use EAMM\Includes\Utils\PluginActions;

defined( 'ABSPATH' ) || exit;

/**
 * Initialization class.
 */
class Init {

	/**
	 * Setup class.
	 */
	public function __construct() {
		add_action( 'activated_plugin', array( $this, 'activation_redirect' ) );
		add_action( 'plugins_loaded', array( $this, 'load' ) );
	}

	/**
	 * Load plugin
	 *
	 * @return void
	 */
	public function load() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}

		new Options();
		new Notice();
		new Deactive();
		new PluginActions();
		new Hooks();
		new Rest();
		new Frontend();
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_scripts_callback' ) );
	}

	/**
	 * Only Backend CSS and JS Scripts
	 *
	 * @return void
	 */
	public function admin_scripts_callback() {
		global $pagenow;
		$page            = sanitize_text_field( wp_unslash( $_GET['page'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$tab             = sanitize_text_field( wp_unslash( $_GET['tab'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$has_zone_id     = (bool) sanitize_text_field( wp_unslash( $_GET['zone_id'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$has_instance_id = (bool) sanitize_text_field( wp_unslash( $_GET['instance_id'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$instance_id     = absint( sanitize_text_field( wp_unslash( $_GET['instance_id'] ?? 0 ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		$in_wc_submenu_page = ( 'admin.php' === $pagenow && 'eamm-dashboard' === $page );

		$in_wc_instance_page = ( 'admin.php' === $pagenow
			&& 'wc-settings' === $page
			&& 'shipping' === $tab
			&& $has_instance_id
			&& ! $has_zone_id );

		$asset_file = EAMM_PATH . 'assets/js/eamm-backend.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		if ( ! is_array( $asset ) ) {
			return;
		}

		if ( $in_wc_submenu_page || $in_wc_instance_page ) {

			$this->load_styles(
				array(
					'asset' => $asset,
				)
			);

			$this->load_scripts(
				array(
					'in_wc_instance_page' => $in_wc_instance_page,
					'instance_id'         => $instance_id,
					'asset'               => $asset,
				)
			);
		}
	}

	/**
	 * Load eamm styles
	 *
	 * @param array $args Arguments.
	 * @return void
	 */
	private function load_styles( $args ) {

		$asset = $args['asset'];

		// WP DataTables CSS.
		$datatable_css_file = is_rtl() ? 'eamm-backend-datatable-rtl.css' : 'eamm-backend-datatable.css';
		wp_enqueue_style( 'eamm-datatable-css', EAMM_URL . "assets/css/{$datatable_css_file}", array(), $asset['version'] );

		// Main CSS.
		$main_css_file = is_rtl() ? 'eamm-backend-rtl.css' : 'eamm-backend.css';
		wp_enqueue_style( 'eamm-editor-css', EAMM_URL . "assets/js/{$main_css_file}", array(), $asset['version'] );
	}

	/**
	 * Load eamm scripts
	 *
	 * @param array $args Arguments.
	 * @return void
	 */
	private function load_scripts( $args ) {
		$in_wc_instance_page = $args['in_wc_instance_page'];
		$instance_id         = $args['instance_id'];
		$asset               = $args['asset'];

		$current_zone_id = null;
		if ( $in_wc_instance_page && class_exists( '\\WC_Shipping_Zones' ) && $instance_id ) {
			$zone = \WC_Shipping_Zones::get_zone_by( 'instance_id', $instance_id );
			if ( $zone && is_object( $zone ) && method_exists( $zone, 'get_id' ) ) {
				$current_zone_id = (int) $zone->get_id();
			}
		}

		$user_info = get_userdata( get_current_user_id() );

		wp_enqueue_editor();

		wp_enqueue_script( 'eamm-editor-script', EAMM_URL . 'assets/js/eamm-backend.js', $asset['dependencies'], $asset['version'], true );

		wp_set_script_translations( 'eamm-editor-script', 'easy-min-max', EAMM_PATH . 'languages/' );

		wp_localize_script(
			'eamm-editor-script',
			'eammAdmin',
			array(
				'ajax'             => admin_url( 'admin-ajax.php' ),
				'url'              => EAMM_URL,
				'db_url'           => admin_url( 'admin.php?page=eamm-dashboard#' ),
				'version'          => EAMM_VER,
				'isActive'         => 1,
				'license'          => get_option( 'edd_eamm_license_key' ),
				'nonce'            => wp_create_nonce( 'eamm-nonce' ),
				'decimal_sep'      => get_option( 'woocommerce_price_decimal_sep', '.' ),
				'num_decimals'     => get_option( 'woocommerce_price_num_decimals', '2' ),
				'currency_pos'     => get_option( 'woocommerce_currency_pos', 'left' ),
				'currencySymbol'   => function_exists( 'get_woocommerce_currency_symbol' ) ? trim( get_woocommerce_currency_symbol() ) : '$',
				'currencyCode'     => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'USD',
				'weightUnit'       => get_option( 'woocommerce_weight_unit' ),
				'dimensionUnit'    => get_option( 'woocommerce_dimension_unit' ),
				'userInfo'         => array(
					'name'  => $user_info->first_name ? $user_info->first_name . ( $user_info->last_name ? ' ' . $user_info->last_name : '' ) : $user_info->user_login,
					'email' => $user_info->user_email,
				),
				'show_lic_page'    => defined( 'EAMM_PRO_VER' ) ? 'true' : 'false',
				'settings'         => DB::get_instance()->get_settings(),
				'flags'            => Flags::get_flags(),
				'currentZoneId'    => $current_zone_id,
				'helloBar'         => Xpo::get_transient_without_cache( 'eamm_helloBar_ysl_2026_1' ),
				'isWooMarketplace' => defined( 'EAMM_WOO_MARKETPLACE' ) && EAMM_WOO_MARKETPLACE === true ? 'true' : 'false',
			)
		);
	}


	/**
	 * Redirect After Active Plugin
	 *
	 * @param string $plugin Plugin name.
	 *
	 * @return void
	 */
	public function activation_redirect( $plugin ) {
		if ( 'easy-min-max/easy-min-max.php' === $plugin ) {
			$action = sanitize_text_field( wp_unslash( $_POST['action'] ?? '' ) ); // phpcs:ignore
			if ( wp_doing_ajax() || is_network_admin() || isset( $_GET['activate-multi'] ) || 'activate-selected' === $action ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				return;
			}
			exit( wp_safe_redirect( admin_url( 'admin.php?page=eamm-dashboard#overview' ) ) ); // phpcs:ignore
		}
	}
}
