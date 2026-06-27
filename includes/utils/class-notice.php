<?php // phpcs:ignore

namespace SYZEQL\Includes\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * Admin notices for consent and rating prompts.
 */
class Notice {

	const ACTIVATION_PENDING_KEY = 'syzeql_notice_activation_pending';
	const ACTIVATION_DONE_KEY    = 'syzeql_notice_activation_done';
	const RATING_DONE_KEY        = 'syzeql_notice_rating_done';
	const RATING_REMIND_KEY      = 'syzeql_notice_rating_remind';
	const NOTICE_NONCE_ACTION    = 'syzeql_notice_nonce';
	const AJAX_ACTION            = 'syzeql_notice_response';
	const RATING_URL             = 'https://wordpress.org/support/plugin/syzenlabs-quantity-limits/reviews';

	/**
	 * Setup hooks.
	 */
	public function __construct() {
		add_action( 'activated_plugin', array( $this, 'on_plugin_activation' ) );
		add_action( 'admin_notices', array( $this, 'render_notices' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_notice_script' ) );
		add_action( 'wp_ajax_' . self::AJAX_ACTION, array( $this, 'handle_notice_response' ) );
	}

	/**
	 * Initialize activation and install transients when plugin is activated.
	 *
	 * @param string $plugin Plugin slug.
	 * @return void
	 */
	public function on_plugin_activation( $plugin ) {
		if ( SYZEQL_BASE !== $plugin ) {
			return;
		}

		set_transient( self::ACTIVATION_PENDING_KEY, 1, 1 * DAY_IN_SECONDS );
		set_transient( self::RATING_REMIND_KEY, 1, 7 * DAY_IN_SECONDS );
	}

	/**
	 * Render admin notices.
	 *
	 * @return void
	 */
	public function render_notices() {
		if ( ! is_admin() || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$this->render_activation_notice();
		$this->render_rating_notice();
	}

	/**
	 * Should show leads notice.
	 *
	 * @return boolean
	 */
	private function should_show_leads_notice() {
		$pending = get_transient( self::ACTIVATION_PENDING_KEY );
		$done    = get_option( self::ACTIVATION_DONE_KEY, false );

		if ( false !== $pending || 1 === $done ) {
			return false;
		}

		return true;
	}

	/**
	 * Should show admin review notice.
	 *
	 * @return boolean
	 */
	private function should_show_review_admin_notice() {
		$remind = get_transient( self::RATING_REMIND_KEY );
		$done   = get_option( self::RATING_DONE_KEY, false );

		if ( false !== $remind || 1 === $done ) {
			return false;
		}

		return true;
	}

	/**
	 * Render initial data collection consent notice.
	 *
	 * @return void
	 */
	private function render_activation_notice() {

		if ( ! $this->should_show_leads_notice() ) {
			return;
		}

		$nonce = wp_create_nonce( self::NOTICE_NONCE_ACTION );
		?>
		<div class="notice notice-info syzeql-admin-notice" data-type="activation" style="position: relative; padding: 12px 40px 12px 12px;">
			<button type="button" class="notice-dismiss syzeql-notice-action" data-notice-action="consent-reject" data-nonce="<?php echo esc_attr( $nonce ); ?>" style="top: 6px; right: 4px;"><span class="screen-reader-text"><?php esc_html_e( 'Dismiss', 'syzenlabs-quantity-limits' ); ?></span></button>
			<p>
				<strong><?php esc_html_e( 'Easy Min Max is a 100% free non-profit plugin, built with the spirit of open-source and for helping small business owners.', 'syzenlabs-quantity-limits' ); ?></strong>
				<?php esc_html_e( 'Can we collect anonymous usage data to improve features and stability?', 'syzenlabs-quantity-limits' ); ?>
			</p>
			<p>
				<button type="button" class="button button-primary syzeql-notice-action" data-notice-action="consent-accept" data-nonce="<?php echo esc_attr( $nonce ); ?>"><?php esc_html_e( 'Accept', 'syzenlabs-quantity-limits' ); ?></button>
			</p>
		</div>
		<?php
	}

	/**
	 * Render 7-day rating notice.
	 *
	 * @return void
	 */
	private function render_rating_notice() {

		if ( ! $this->should_show_review_admin_notice() ) {
			return;
		}

		$nonce = wp_create_nonce( self::NOTICE_NONCE_ACTION );
		?>
		<div class="notice notice-success syzeql-admin-notice" data-type="rating" style="padding: 12px;">
			<p>
				<strong><?php esc_html_e( 'Enjoying Easy Min Max?', 'syzenlabs-quantity-limits' ); ?></strong>
				<?php esc_html_e( 'A quick 5-star review helps us a lot.', 'syzenlabs-quantity-limits' ); ?>
			</p>
			<p>
				<a class="button button-primary syzeql-notice-action" data-notice-action="rating-open" data-nonce="<?php echo esc_attr( $nonce ); ?>" href="<?php echo esc_url( self::RATING_URL ); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'Leave a 5-star review', 'syzenlabs-quantity-limits' ); ?></a>
				<button type="button" class="button syzeql-notice-action" data-notice-action="rating-remind" data-nonce="<?php echo esc_attr( $nonce ); ?>"><?php esc_html_e( 'Remind me next week', 'syzenlabs-quantity-limits' ); ?></button>
				<button type="button" class="button syzeql-notice-action" data-notice-action="rating-reviewed" data-nonce="<?php echo esc_attr( $nonce ); ?>"><?php esc_html_e( 'I already reviewed', 'syzenlabs-quantity-limits' ); ?></button>
			</p>
		</div>
		<?php
	}

	/**
	 * Handle AJAX actions for notice responses.
	 *
	 * @return void
	 */
	public function handle_notice_response() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized.', 'syzenlabs-quantity-limits' ) ), 403 );
		}

		check_ajax_referer( self::NOTICE_NONCE_ACTION, 'nonce' );

		$action = sanitize_text_field( wp_unslash( $_POST['notice_action'] ?? '' ) ); // phpcs:ignore

		switch ( $action ) {
			case 'consent-accept': // Intentional fallthrough.
				Analytics::send( Analytics::NOTICE_ACCEPT_ACTION );
			case 'consent-reject':
				update_option( self::ACTIVATION_DONE_KEY, 1 );
				delete_transient( self::ACTIVATION_PENDING_KEY );
				break;

			case 'rating-open':
			case 'rating-remind':
				set_transient( self::RATING_REMIND_KEY, time() + ( 7 * DAY_IN_SECONDS ), 7 * DAY_IN_SECONDS );
				break;

			case 'rating-reviewed':
				update_option( self::RATING_DONE_KEY, 1 );
				delete_transient( self::RATING_REMIND_KEY );
				break;

			default:
				wp_send_json_error( array( 'message' => __( 'Invalid action.', 'syzenlabs-quantity-limits' ) ), 400 );
		}

		wp_send_json_success();
	}

	/**
	 * Enqueue JS for notice AJAX submission.
	 *
	 * @return void
	 */
	public function enqueue_notice_script() {
		if ( ! is_admin() || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( ! $this->should_show_leads_notice() && ! $this->should_show_review_admin_notice() ) {
			return;
		}

		$asset_file = SYZEQL_PATH . 'assets/js/syzeql-admin-notice.asset.php';
		$asset      = file_exists( $asset_file ) ? require $asset_file : array();

		wp_enqueue_script(
			'syzeql-admin-notice',
			SYZEQL_URL . 'assets/js/syzeql-admin-notice.js',
			$asset['dependencies'] ?? array(),
			$asset['version'] ?? SYZEQL_VER,
			true
		);

		wp_localize_script(
			'syzeql-admin-notice',
			'syzeqlNotice',
			array(
				'ajaxAction' => self::AJAX_ACTION,
				'ajaxUrl'    => admin_url( 'admin-ajax.php' ),
			)
		);
	}
}
