<?php // phpcs:ignore

namespace EAMM\Includes\Utils;

use EAMM\Includes\Xpo;

defined( 'ABSPATH' ) || exit;

/**
 * Plugin Actions
 */
class PluginActions {

	/**
	 * Constructor
	 */
	public function __construct() {
		add_filter( 'plugin_action_links_' . EAMM_BASE, array( $this, 'plugin_action_links_callback' ) );
		add_filter( 'plugin_row_meta', array( $this, 'plugin_settings_meta' ), 10, 2 );
	}

	/**
	 * Adds quick action links below the plugin name.
	 *
	 * @param array $links Default plugin action links.
	 * @return array Modified plugin action links.
	 */
	public function plugin_action_links_callback( $links ) {
		$setting_link = array(
			'eamm_rules'     => '<a href="' . esc_url( admin_url( 'admin.php?page=eamm-dashboard#shipping-methods' ) ) . '">' . esc_html__( 'Methods', 'easy-min-max' ) . '</a>',

			'eamm_analytics' => '<a href="' . esc_url( admin_url( 'admin.php?page=eamm-dashboard#logs-analytics' ) ) . '">' . esc_html__( 'Analytics', 'easy-min-max' ) . '</a>',
		);

		$upgrade_link = array();

		// Free user or expired license user.
		if ( ! defined( 'EAMM_PRO_VER' ) || Xpo::is_lc_expired() ) {

			$license_key = Xpo::get_lc_key() ?? '';

			if ( Xpo::is_lc_expired() ) {
				$text = esc_html__( 'Renew License', 'easy-min-max' );
				$url  = 'https://account.wpxpo.com/checkout/?edd_license_key=' . $license_key;
			} else {

				$text = esc_html__( 'Upgrade to Pro', 'easy-min-max' );
				$url  = Xpo::generate_utm_link();

				// Determine if a promotional window is currently active.
				$is_offer_running = true;

				if ( $is_offer_running ) {
					$current_time = gmdate( 'U' );
					$start        = '2026-01-01 00:00 Asia/Dhaka';
					$end          = '2026-02-15 23:59 Asia/Dhaka';
					$notice_start = gmdate( 'U', strtotime( $start ) );
					$notice_end   = gmdate( 'U', strtotime( $end ) );
					if ( $current_time >= $notice_start && $current_time <= $notice_end ) {
						$url  = Xpo::generate_utm_link(
							array(
								'utmKey' => 'new_year',
								'hash'   => '#pricing',
							)
						);
						$text = esc_html__( 'New Year Sale!', 'easy-min-max' );
					}
				}
			}

			$upgrade_link['eamm_pro'] = '<a style="color: #0062ff; font-weight: bold;" target="_blank" href="' . esc_url( $url ) . '">' . $text . '</a>';
		}

		return array_merge( $setting_link, $links, $upgrade_link );
	}

	/**
	 * Adds extra links to the plugin row meta on the plugins page.
	 *
	 * @param array  $links Existing plugin meta links.
	 * @param string $file  Plugin file path.
	 * @return array Modified plugin meta links.
	 */
	public function plugin_settings_meta( $links, $file ) {
		if ( strpos( $file, 'easy-min-max.php' ) !== false ) {
			$new_links = array(
				'eamm_docs'    => '<a href="https://wpxpo.com/docs/wowshipping/" target="_blank">' . esc_html__( 'Docs', 'easy-min-max' ) . '</a>',
				'eamm_support' => '<a href="https://www.wpxpo.com/contact/" target="_blank">' . esc_html__( 'Support', 'easy-min-max' ) . '</a>',
			);
			$links     = array_merge( $links, $new_links );
		}
		return $links;
	}
}
