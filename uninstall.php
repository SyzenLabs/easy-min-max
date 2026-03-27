<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package easy-min-max
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

/**
 * Determine whether this site has enabled cleanup on uninstall.
 *
 * @return bool
 */
function eamm_should_cleanup_on_uninstall() {
	$settings = get_option( 'eamm-settings', array() );

	if ( ! is_array( $settings ) ) {
		return false;
	}

	$settings = wp_parse_args(
		$settings,
		array(
			'cleanUpOnUninstall' => false,
		)
	);

	return (bool) $settings['cleanUpOnUninstall'];
}

/**
 * Cleanup plugin data for the current blog.
 *
 * @return bool True if cleanup ran.
 */
function eamm_cleanup_current_blog() {
	if ( ! eamm_should_cleanup_on_uninstall() ) {
		return false;
	}

	global $wpdb;

	// Core plugin options.
	// delete_option( 'eamm-settings' );
	// delete_option( 'eamm-shipping-rules' );
	// delete_option( 'eamm_rule_import_job_status' );

	// Remove any cached transients created by the plugin (direct DB to support wildcard).
	$patterns = array(
		'_transient_eamm_%',
		'_transient_timeout_eamm_%',
		'_site_transient_eamm_%',
		'_site_transient_timeout_eamm_%',
	);

	foreach ( $patterns as $pattern ) {
		$like = $wpdb->esc_like( rtrim( $pattern, '%' ) ) . '%';
		$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare( "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $like )
		);
	}
	// Clear scheduled events that belong to this plugin (best-effort).
	$crons = _get_cron_array();
	if ( is_array( $crons ) ) {
		foreach ( $crons as $timestamp => $hooks ) {
			if ( ! is_array( $hooks ) ) {
				continue;
			}
			foreach ( $hooks as $hook => $events ) {
				if ( 0 !== strpos( (string) $hook, 'eamm_' ) ) {
					continue;
				}
				wp_clear_scheduled_hook( $hook );
			}
		}
	}

	return true;
}

$did_any_cleanup = false;

// if ( is_multisite() && function_exists( 'get_sites' ) ) {
// $sites = get_sites( array( 'fields' => 'ids' ) );

// if ( is_array( $sites ) ) {
// foreach ( $sites as $site_id ) {
// switch_to_blog( (int) $site_id );
// $did_any_cleanup = eamm_cleanup_current_blog() || $did_any_cleanup;
// restore_current_blog();
// }
// }

// If we cleaned any site, also remove network-level transients for the same prefix.
// if ( $did_any_cleanup ) {
// global $wpdb;
// if ( ! empty( $wpdb->sitemeta ) ) {
// $site_patterns = array(
// '_site_transient_eamm_%',
// '_site_transient_timeout_eamm_%',
// );

// foreach ( $site_patterns as $pattern ) {
// $like = $wpdb->esc_like( rtrim( $pattern, '%' ) ) . '%';
// $wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
// $wpdb->prepare( "DELETE FROM {$wpdb->sitemeta} WHERE meta_key LIKE %s", $like )
// );
// }
// }
// }
// } else {
// $did_any_cleanup = eamm_cleanup_current_blog();
// }
