<?php
/**
 * Plugin Name: Easy Min Max
 * Description: Set minimum and maximum quantity and price rules for WooCommerce products with flexible conditions and storefront validation.
 * Version:     1.0.0
 * Author:      SyzenLabs
 * Author URI:  https://yaser.com.bd
 * Requires Plugins: woocommerce
 * Text Domain: easy-min-max
 * Domain Path: /languages
 * License:     GPLv3
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 *
 * @package easy-min-max
 */

use EAMM\Includes\Init;

defined( 'ABSPATH' ) || exit;

// Define Vars.
define( 'EAMM_VER', '1.0.0' );
define( 'EAMM_URL', plugin_dir_url( __FILE__ ) );
define( 'EAMM_BASE', plugin_basename( __FILE__ ) );
define( 'EAMM_PATH', plugin_dir_path( __FILE__ ) );
define( 'EAMM_RULE_VER', '1' );
define( 'EAMM_WOO_MARKETPLACE', false );

if ( ! function_exists( 'eamm_autoloader' ) ) {
	/**
	 * Autoloader function
	 *
	 * @param string $class_name class name.
	 * @return void
	 */
	function eamm_autoloader( $class_name ) {
		$namespace = 'EAMM\\';
		$base_dir  = EAMM_PATH;

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

spl_autoload_register( 'eamm_autoloader' );

if ( ! function_exists( 'eamm_init' ) ) {
	/**
	 * Init plugin
	 *
	 * @return void
	 */
	function eamm_init() {
		new Init();
	}
}

eamm_init();
