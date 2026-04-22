<?php // phpcs:ignore

namespace SYZEQL\Includes;

defined( 'ABSPATH' ) || exit;

/**
 * Core class for managing plugin actions and integrations.
 */
class Utils {


	/**
	 * Checks if the current user is an administrator.
	 *
	 * @return boolean
	 */
	public static function is_user_admin() {
		return current_user_can( 'manage_options' );
	}
}
