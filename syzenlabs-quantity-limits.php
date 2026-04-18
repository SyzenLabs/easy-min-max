<?php
/**
 * Plugin Name: SyzenLabs Quantity Limits
 * Description: Set minimum and maximum quantity and price rules for WooCommerce products with flexible conditions and storefront validation.
 * Version:     1.0.1
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

use SZQL\Includes\Init;

defined( 'ABSPATH' ) || exit;

// Define Vars.
define( 'SZQL_VER', '1.0.1' );
define( 'SZQL_URL', plugin_dir_url( __FILE__ ) );
define( 'SZQL_BASE', plugin_basename( __FILE__ ) );
define( 'SZQL_PATH', plugin_dir_path( __FILE__ ) );
define( 'SZQL_RULE_VER', '1' );
define( 'SZQL_WOO_MARKETPLACE', false );

if ( ! function_exists( 'szql_autoloader' ) ) {
	/**
	 * Autoloader function
	 *
	 * @param string $class_name class name.
	 * @return void
	 */
	function szql_autoloader( $class_name ) {
		$namespace = 'SZQL\\';
		$base_dir  = SZQL_PATH;

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

spl_autoload_register( 'szql_autoloader' );

if ( ! function_exists( 'szql_init' ) ) {
	/**
	 * Init plugin
	 *
	 * @return void
	 */
	function szql_init() {
		new Init();
	}
}

szql_init();
