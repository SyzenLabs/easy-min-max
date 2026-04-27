<?php // phpcs:ignore

namespace SYZEQL\Includes\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * Class Analytics
 */
class Analytics {

	public const DEACTIVATE_ACTION    = 'deactive';
	public const NOTICE_ACCEPT_ACTION = 'notice-accept';
	const PLUGIN_SLUG                 = 'syzenlabs-quantity-limits';
	const URL                         = 'https://script.google.com/macros/s/AKfycbxEq9h_wRGa3r-ZhkHiikDtu5Wok0CMco9Wn57FdiGL3Szh_OmG1ai8d7Ms0Lj3SbJZnA/exec';

	/**
	 * Send data to Durbin
	 *
	 * @param string $action_type Action Type.
	 * @return void
	 */
	public static function send( $action_type ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$data = self::get_common_data();

		$data['action'] = $action_type;

		if ( self::DEACTIVATE_ACTION === $action_type ) {

			$id = isset( $_POST['cause_id'] ) ? sanitize_key( wp_unslash( $_POST['cause_id'] ) ) : null; // phpcs:ignore

			if ( ! empty( $id ) ) {
				$data['data']['feedback'] = array(
					'id'      => $id,
					'details' => isset( $_POST['cause_details'] ) ? sanitize_text_field( wp_unslash( $_POST['cause_details'] ) ) : null, // phpcs:ignore
				);
			}
		}

		wp_remote_post(
			self::URL,
			array(
				'timeout'     => 30,
				'redirection' => 5,
				'sslverify'   => false,
				'headers'     => array(
					'user-agent' => 'syzenlabs/' . md5( esc_url( home_url() ) ) . ';',
					'Accept'     => 'application/json',
				),
				'blocking'    => true,
				'body'        => wp_json_encode( $data ),
			)
		);
	}

	/**
	 * Get All the Installed Plugin Data
	 *
	 * @return array
	 */
	private static function get_installed_plugins() {
		if ( ! function_exists( 'get_plugins' ) ) {
			include ABSPATH . '/wp-admin/includes/plugin.php';
		}

		$active         = array();
		$inactive       = array();
		$all_plugins    = get_plugins();
		$active_plugins = get_option( 'active_plugins', array() );
		if ( is_multisite() ) {
			$active_plugins = array_merge( $active_plugins, array_keys( get_site_option( 'active_sitewide_plugins', array() ) ) );
		}

		foreach ( $all_plugins as $key => $plugin ) {
			$slug = dirname( $key );
			if ( empty( $slug ) || self::PLUGIN_SLUG === $slug ) {
				continue;
			}

			if ( in_array( $key, $active_plugins, true ) ) {
				$active[] = $slug;
			} else {
				$inactive[] = $slug;
			}
		}

		return array(
			'active'   => $active,
			'inactive' => $inactive,
		);
	}

	/**
	 * Get Country Code
	 *
	 * @return string|null
	 */
	private static function get_country_code() {

		$cached = get_transient( 'syze_analytics_country_code' );

		if ( false !== $cached ) {
			return $cached;
		}

		$res = wp_remote_get(
			'https://ipinfo.io/json',
			array( 'timeout' => 30 )
		);

		if ( is_wp_error( $res ) || 200 !== wp_remote_retrieve_response_code( $res ) ) {
			return null;
		}

		$body = wp_remote_retrieve_body( $res );
		$data = json_decode( $body, true );

		$country = isset( $data['country'] ) ? $data['country'] : null;

		if ( ! empty( $country ) ) {
			set_transient( 'syze_analytics_country_code', $country, 180 * DAY_IN_SECONDS );
		}

		return $country;
	}

	/**
	 * Get common data
	 *
	 * @return array
	 */
	private static function get_common_data() {
		$user         = wp_get_current_user();
		$plugins_data = self::get_installed_plugins();
		$user_name    = $user->user_firstname ? $user->user_firstname . ( $user->user_lastname ? ' ' . $user->user_lastname : '' ) : $user->display_name;

		$data = array(
			'email'   => $user->user_email,
			'name'    => $user_name,
			'website' => esc_url( home_url() ),
			'product' => self::PLUGIN_SLUG,
			'theme'   => get_stylesheet(),
			'plugins' => $plugins_data,
			'country' => self::get_country_code(),
			'data'    => array(),
		);

		return $data;
	}
}
