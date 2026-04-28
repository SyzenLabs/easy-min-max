<?php // phpcs:ignore
/**
 * Initialization Action.
 *
 * @package SYZEQL
 */
namespace SYZEQL\Includes;

use SYZEQL\Includes\Frontend\Frontend;
use SYZEQL\Includes\Utils\Options;
use SYZEQL\Includes\Rest\Rest;
use SYZEQL\Includes\Utils\Hooks;
use SYZEQL\Includes\Utils\Notice;

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

		new Rest();
		new Hooks();

		if ( is_admin() ) {
			new Options();
			// new Notice();
			add_action( 'admin_enqueue_scripts', array( $this, 'admin_scripts_callback' ) );
		} else {
			new Frontend();
		}
	}

	/**
	 * Only Backend CSS and JS Scripts
	 *
	 * @return void
	 */
	public function admin_scripts_callback() {
		global $pagenow;
		$page = sanitize_text_field( wp_unslash( $_GET['page'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		$in_wc_submenu_page = ( 'admin.php' === $pagenow && 'syzeql-dashboard' === $page );

		$asset_file = SYZEQL_PATH . 'assets/js/syzeql-backend.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		if ( ! is_array( $asset ) ) {
			return;
		}

		if ( $in_wc_submenu_page ) {

			$this->load_styles(
				array(
					'asset' => $asset,
				)
			);

			$this->load_scripts(
				array(
					'asset' => $asset,
				)
			);
		}
	}

	/**
	 * Load syzeql styles
	 *
	 * @param array $args Arguments.
	 * @return void
	 */
	private function load_styles( $args ) {

		$asset = $args['asset'];

		// WP DataTables CSS.
		$datatable_css_file = is_rtl() ? 'syzeql-backend-datatable-rtl.css' : 'syzeql-backend-datatable.css';
		wp_enqueue_style( 'syzeql-datatable-css', SYZEQL_URL . "assets/css/{$datatable_css_file}", array(), $asset['version'] );

		// Main CSS.
		$main_css_file = is_rtl() ? 'syzeql-backend-rtl.css' : 'syzeql-backend.css';
		wp_enqueue_style( 'syzeql-editor-css', SYZEQL_URL . "assets/js/{$main_css_file}", array(), $asset['version'] );
	}

	/**
	 * Load syzeql scripts
	 *
	 * @param array $args Arguments.
	 * @return void
	 */
	private function load_scripts( $args ) {
		$asset = $args['asset'];

		$user_info = get_userdata( get_current_user_id() );

		wp_enqueue_editor();

		wp_enqueue_script( 'syzeql-editor-script', SYZEQL_URL . 'assets/js/syzeql-backend.js', $asset['dependencies'], $asset['version'], true );

		wp_set_script_translations( 'syzeql-editor-script', 'syzenlabs-quantity-limits', SYZEQL_PATH . 'languages/' );

		wp_localize_script(
			'syzeql-editor-script',
			'syzeqlAdmin',
			array(
				'ajax'             => admin_url( 'admin-ajax.php' ),
				'url'              => SYZEQL_URL,
				'db_url'           => admin_url( 'admin.php?page=syzeql-dashboard#' ),
				'version'          => SYZEQL_VER,
				'isActive'         => 1,
				'license'          => get_option( 'edd_syzeql_license_key' ),
				'nonce'            => wp_create_nonce( 'syzeql-nonce' ),
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
				'settings'         => DB::get_instance()->get_settings(),
				'flags'            => array(),
				'isWooMarketplace' => defined( 'SYZEQL_WOO_MARKETPLACE' ) && SYZEQL_WOO_MARKETPLACE === true ? 'true' : 'false',
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
		if ( 'syzenlabs-quantity-limits/syzenlabs-quantity-limits.php' === $plugin ) {
			$action = sanitize_text_field( wp_unslash( $_POST['action'] ?? '' ) ); // phpcs:ignore
			if ( wp_doing_ajax() || is_network_admin() || isset( $_GET['activate-multi'] ) || 'activate-selected' === $action ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				return;
			}
			exit( wp_safe_redirect( admin_url( 'admin.php?page=syzeql-dashboard#overview' ) ) ); // phpcs:ignore
		}
	}
}
