<?php
/**
 * Plugin Name: SyzenLabs Quantity Limits
 * Description: Set minimum and maximum quantity and price rules for WooCommerce products with flexible conditions and storefront validation.
 * Version:     1.0.3
 * Author:      SyzenLabs
 * Author URI:  https://profiles.wordpress.org/syzenlabs
 * Requires Plugins: woocommerce
 * Text Domain: syzenlabs-quantity-limits
 * Domain Path: /languages
 * License:     GPLv3
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 *
 * @package syzenlabs-quantity-limits
 */

use SYZEQL\Includes\Init;

defined( 'ABSPATH' ) || exit;

// Define Vars.
define( 'SYZEQL_VER', '1.0.3' );
define( 'SYZEQL_URL', plugin_dir_url( __FILE__ ) );
define( 'SYZEQL_BASE', plugin_basename( __FILE__ ) );
define( 'SYZEQL_PATH', plugin_dir_path( __FILE__ ) );
define( 'SYZEQL_RULE_VER', '1' );
define( 'SYZEQL_WOO_MARKETPLACE', false );

if ( ! function_exists( 'syzeql_autoloader' ) ) {
	/**
	 * Autoloader function
	 *
	 * @param string $class_name class name.
	 * @return void
	 */
	function syzeql_autoloader( $class_name ) {
		$namespace = 'SYZEQL\\';
		$base_dir  = SYZEQL_PATH;

		$len = strlen( $namespace );
		if ( strncmp( $namespace, $class_name, $len ) !== 0 ) {
			return;
		}

		$relative_class = substr( $class_name, $len );

		$segments  = explode( '\\', $relative_class );
		$file_name = array_pop( $segments );
		$subfolder = strtolower( implode( '/', $segments ) );

		$prefix = ( strpos( $subfolder, 'traits' ) !== false ) ? 'trait-' : 'class-';

		$file_name = strtolower(
			preg_replace( '/([a-z])([A-Z])/', '$1-$2', $file_name )
		);

		$file = rtrim( $base_dir . $subfolder, '/' ) . '/' . $prefix . $file_name . '.php';

		if ( file_exists( $file ) ) {
			require_once $file;
			return;
		}
	}

}

spl_autoload_register( 'syzeql_autoloader' );

if ( ! function_exists( 'syzeql_init' ) ) {
	/**
	 * Init plugin
	 *
	 * @return void
	 */
	function syzeql_init() {
		new Init();
	}
}

syzeql_init();
