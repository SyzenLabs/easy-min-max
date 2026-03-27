<?php //phpcs:ignore

namespace EAMM\Includes\Utils;

use EAMM\Includes\Xpo;

defined( 'ABSPATH' ) || exit;

/**
 * Plugin Notice
 */
class Notice {


	/**
	 * Notice version
	 *
	 * @var string
	 */
	private $notice_version = 'v101';

	/**
	 * Notice JS/CSS applied
	 *
	 * @var boolean
	 */
	private $notice_js_css_applied = false;


	/**
	 * Notice Constructor
	 */
	public function __construct() {
		add_action( 'admin_notices', array( $this, 'admin_notices_callback' ) );
		add_action( 'admin_init', array( $this, 'set_dismiss_notice_callback' ) );

		// REST API routes.
		add_action( 'rest_api_init', array( $this, 'register_rest_route' ) );

		// Woocommerce Install Action.
		add_action( 'wp_ajax_eamm_install', array( $this, 'install_activate_plugin' ) );
	}


	/**
	 * Registers REST API endpoints.
	 *
	 * @return void
	 */
	public function register_rest_route() {
		$routes = array(
			// Hello Bar.
			array(
				'endpoint'            => 'hello_bar',
				'methods'             => 'POST',
				'callback'            => array( $this, 'hello_bar_callback' ),
				'permission_callback' => function () {
					return Flags::is_user_admin();
				},
			),
		);

		foreach ( $routes as $route ) {
			register_rest_route(
				'eamm/v1',
				$route['endpoint'],
				array(
					array(
						'methods'             => $route['methods'],
						'callback'            => $route['callback'],
						'permission_callback' => $route['permission_callback'],
					),
				)
			);
		}
	}

	/**
	 * Handles Hello Bar dismissal action via REST API .
	 *
	 * @param \WP_REST_Request $request REST request object .
	 * @return \WP_REST_Response
	 */
	public function hello_bar_callback( \WP_REST_Request $request ) {
		$request_params = $request->get_params();
		$type           = isset( $request_params['type'] ) ? $request_params['type'] : '';

		if ( 'hello_bar' === $type ) {
			Xpo::set_transient_without_cache( 'eamm_helloBar_ysl_2026_1', 'hide', 1296000 );
		}

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Hello Bar Action performed', 'easy-min-max' ),
			),
			200
		);
	}

	/**
	 * Set Notice Dismiss Callback
	 *
	 * @return void
	 */
	public function set_dismiss_notice_callback() {

		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['wpnonce'] ?? '' ) ), 'eamm-nonce' ) ) {
			return;
		}

		$durbin_key = sanitize_text_field( wp_unslash( $_GET['eamm_durbin_key'] ?? '' ) );

		// Durbin notice dismiss.
		if ( ! empty( $durbin_key ) ) {
			Xpo::set_transient_without_cache( 'eamm_durbin_notice_' . $durbin_key, 'off' );

			if ( 'get' === sanitize_text_field( wp_unslash( $_GET['eamm_get_durbin'] ?? '' ) ) ) {
				DurbinClient::send( DurbinClient::ACTIVATE_ACTION );
			}
		}

		// Install notice dismiss.
		$install_key = sanitize_text_field( wp_unslash( $_GET['eamm_install_key'] ?? '' ) );
		if ( ! empty( $install_key ) ) {
			Xpo::set_transient_without_cache( 'eamm_install_notice_' . $install_key, 'off' );
		}

		$notice_key = sanitize_text_field( wp_unslash( $_GET['disable_eamm_notice'] ?? '' ) );
		if ( ! empty( $notice_key ) ) {
			$interval = (int) sanitize_text_field( wp_unslash( $_GET['eamm_interval'] ?? '' ) );
			if ( ! empty( $interval ) ) {
				Xpo::set_transient_without_cache( 'eamm_get_pro_notice_' . $notice_key, 'off', $interval );
			} else {
				Xpo::set_transient_without_cache( 'eamm_get_pro_notice_' . $notice_key, 'off' );
			}
		}
	}

	/**
	 * Admin Notices Callback
	 *
	 * @return void
	 */
	public function admin_notices_callback() {
		$this->eamm_dashboard_notice_callback();
		$this->eamm_dashboard_durbin_notice_callback();
	}

	/**
	 * Admin Dashboard Notice Callback
	 *
	 * @return void
	 */
	public function eamm_dashboard_notice_callback() {
		$this->eamm_dashboard_content_notice();
		$this->eamm_dashboard_banner_notice();
	}

	/**
	 * Dashboard Banner Notice
	 *
	 * @return void
	 */
	public function eamm_dashboard_banner_notice() {
		$eamm_db_nonce  = wp_create_nonce( 'eamm-nonce' );
		$banner_notices = array(
			array(
				'key'        => 'eamm_ysl_2026_1',
				'start'      => '2026-01-01 00:00 Asia/Dhaka',
				'end'        => '2026-01-06 23:59 Asia/Dhaka', // format YY-MM-DD always set time 23:59 and zone Asia/Dhaka.
				'banner_src' => EAMM_URL . 'assets/img/banners/ship1.png',
				'url'        => 'https://www.wpxpo.com/table-rate-shipping-for-woocommerce/#pricing',
				'visibility' => ! Xpo::is_lc_active(),
			),
			array(
				'key'        => 'eamm_ysl_2026_2',
				'start'      => '2026-01-17 00:00 Asia/Dhaka',
				'end'        => '2026-01-22 23:59 Asia/Dhaka', // format YY-MM-DD always set time 23:59 and zone Asia/Dhaka.
				'banner_src' => EAMM_URL . 'assets/img/banners/ship2.png',
				'url'        => 'https://www.wpxpo.com/table-rate-shipping-for-woocommerce/#pricing',
				'visibility' => ! Xpo::is_lc_active(),
			),
			array(
				'key'        => 'eamm_ysl_2026_3',
				'start'      => '2026-02-02 00:00 Asia/Dhaka',
				'end'        => '2026-02-07 23:59 Asia/Dhaka', // format YY-MM-DD always set time 23:59 and zone Asia/Dhaka.
				'banner_src' => EAMM_URL . 'assets/img/banners/ship3.png',
				'url'        => 'https://www.wpxpo.com/table-rate-shipping-for-woocommerce/#pricing',
				'visibility' => ! Xpo::is_lc_active(),
			),
		);

		foreach ( $banner_notices as $key => $notice ) {
			$notice_key = isset( $notice['key'] ) ? $notice['key'] : $this->notice_version;
			if ( isset( $_GET['disable_eamm_notice'] ) && $notice_key === sanitize_text_field(wp_unslash($_GET['disable_eamm_notice'])) ) { // phpcs:ignore
				return;
			}

			$current_time = gmdate( 'U' );
			$notice_start = gmdate( 'U', strtotime( $notice['start'] ) );
			$notice_end   = gmdate( 'U', strtotime( $notice['end'] ) );
			if ( $current_time >= $notice_start && $current_time <= $notice_end && $notice['visibility'] ) {

				$notice_transient = Xpo::get_transient_without_cache( 'eamm_get_pro_notice_' . $notice_key );

				if ( 'off' !== $notice_transient ) {
					if ( ! $this->notice_js_css_applied ) {
						$this->eamm_banner_notice_css();
						$this->notice_js_css_applied = true;
					}
					$query_args = array(
						'disable_eamm_notice' => $notice_key,
						'wpnonce'             => $eamm_db_nonce,
					);
					if ( isset( $notice['repeat_interval'] ) && $notice['repeat_interval'] ) {
						$query_args['eamm_interval'] = $notice['repeat_interval'];
					}
					?>
					<div class="eamm-notice-wrapper notice wc-install eamm-free-notice">
						<div class="wc-install-body eamm-image-banner">
							<a class="wc-dismiss-notice" href="
							<?php
							echo esc_url(
								add_query_arg(
									$query_args
								)
							);
							?>
							"><?php esc_html_e( 'Dismiss', 'easy-min-max' ); ?></a>
							<a class="eamm-btn-image" target="_blank" href="<?php echo esc_url( $notice['url'] ); ?>">
								<img loading="lazy" src="<?php echo esc_url( $notice['banner_src'] ); ?>" alt="Discount Banner"/>
							</a>
						</div>
					</div>
					<?php
				}
			}
		}
	}

	/**
	 * Dasboard content notice
	 *
	 * @return void
	 */
	public function eamm_dashboard_content_notice() {

		$content_notices = array(
			array(
				'key'                => 'eamm_content_ysl_2026_1',
				'start'              => '2026-01-09 00:00 Asia/Dhaka',
				'end'                => '2026-01-15 23:59 Asia/Dhaka',
				'url'                => 'https://www.wpxpo.com/table-rate-shipping-for-woocommerce/#pricing',
				'visibility'         => ! Xpo::is_lc_active(),
				'content_heading'    => __( 'New Year Sales Offers:', 'easy-min-max' ),
				// translators: %s: Discount percentage.
				'content_subheading' => __( 'WowShipping offers are live - %s with this shipping method builder for WooCommerce!', 'easy-min-max' ),
				'discount_content'   => 'Get Started for just $26',
				'border_color'       => '#3385ff', // product default border color.
				'icon'               => EAMM_URL . 'assets/img/banners/content1.svg',
				'button_text'        => __( 'Claim Your Discount!', 'easy-min-max' ),
				'is_discount_logo'   => true,
			),
			array(
				'key'                => 'eamm_content_ysl_2026_2',
				'start'              => '2026-01-25 00:00 Asia/Dhaka',
				'end'                => '2026-01-30 23:59 Asia/Dhaka',
				'url'                => 'https://www.wpxpo.com/table-rate-shipping-for-woocommerce/#pricing',
				'visibility'         => ! Xpo::is_lc_active(),
				'content_heading'    => __( 'New Year Sales Alert:', 'easy-min-max' ),
				// translators: %s: Discount percentage.
				'content_subheading' => __( 'WowShipping is on Sale - %s with this shipping method builder for WooCommerce!', 'easy-min-max' ),
				'discount_content'   => 'Get Started for just $26',
				'border_color'       => '#3385ff', // product default border color.
				'icon'               => EAMM_URL . 'assets/img/banners/content1.svg',
				'button_text'        => __( 'Claim Your Discount!', 'easy-min-max' ),
				'is_discount_logo'   => true,
			),
			array(
				'key'                => 'eamm_content_ysl_2026_3',
				'start'              => '2026-02-10 00:00 Asia/Dhaka',
				'end'                => '2026-02-15 23:59 Asia/Dhaka',
				'url'                => 'https://www.wpxpo.com/table-rate-shipping-for-woocommerce/#pricing',
				'visibility'         => ! Xpo::is_lc_active(),
				'content_heading'    => __( 'Fresh New Year Deals:', 'easy-min-max' ),
				// translators: %s: Discount percentage.
				'content_subheading' => __( 'WowShipping is on Sale - %s with this shipping method builder for WooCommerce!', 'easy-min-max' ),
				'discount_content'   => 'Get Started for just $26',
				'border_color'       => '#3385ff', // product default border color.
				'icon'               => EAMM_URL . 'assets/img/banners/content1.svg',
				'button_text'        => __( 'Claim Your Discount!', 'easy-min-max' ),
				'is_discount_logo'   => true,
			),
		);

		$eamm_db_nonce = wp_create_nonce( 'eamm-dashboard-nonce' );

		foreach ( $content_notices as $key => $notice ) {
			$notice_key = isset( $notice['key'] ) ? $notice['key'] : $this->notice_version;
			if ( isset( $_GET['disable_eamm_notice'] ) && $notice_key === $_GET['disable_eamm_notice'] ) { // phpcs:ignore
				continue;
			} else {
				$border_color = $notice['border_color'];

				$current_time = gmdate( 'U' );
				$notice_start = gmdate( 'U', strtotime( $notice['start'] ) );
				$notice_end   = gmdate( 'U', strtotime( $notice['end'] ) );
				if ( $current_time >= $notice_start && $current_time <= $notice_end && $notice['visibility'] ) {
					$notice_transient = Xpo::get_transient_without_cache( 'eamm_get_pro_notice_' . $notice_key );

					if ( 'off' !== $notice_transient ) {
						if ( ! $this->notice_js_css_applied ) {
								$this->eamm_banner_notice_css();
								$this->notice_js_css_applied = true;
						}
						$query_args = array(
							'disable_eamm_notice' => $notice_key,
							'eamm_db_nonce'       => $eamm_db_nonce,
						);
						if ( isset( $notice['repeat_interval'] ) && $notice['repeat_interval'] ) {
							$query_args['eamm_interval'] = $notice['repeat_interval'];
						}

						$url = isset( $notice['url'] ) ? $notice['url'] : Xpo::generate_utm_link(
							array(
								'utmKey' => 'year_end_sale_db',
							)
						);

						?>
	<div class="eamm-notice-wrapper notice data_collection_notice" 
	style="border-left: 3px solid <?php echo esc_attr( $border_color ); ?>;"
	> 
						<?php
						if ( $notice['is_discount_logo'] ) {
							?>
		<div class="eamm-notice-discout-icon"> <img src="<?php echo esc_url( $notice['icon'] ); ?>"/>  </div>
							<?php
						} else {
							?>
		<div class="eamm-notice-icon"> <img src="<?php echo esc_url( $notice['icon'] ); ?>"/>  </div>
							<?php
						}
						?>
	  
		<div class="eamm-notice-content-wrapper">
		<div class="">
		<strong><?php printf( esc_html( $notice['content_heading'] ) ); ?> </strong>
						<?php
						printf(
							wp_kses_post( $notice['content_subheading'] ),
							'<strong>' . esc_html( $notice['discount_content'] ) . '</strong>'
						);
						?>
		</div>
		<div class="eamm-notice-buttons">
						<?php if ( isset( $notice['is_discount_logo'] ) && $notice['is_discount_logo'] ) : ?>
		<a class="eamm-discount_btn" href="<?php echo esc_url( $url ); ?>" target="_blank">
							<?php echo esc_html( $notice['button_text'] ); ?>
		</a>
		<?php else : ?>
		<a class="eamm-notice-btn button button-primary" href="<?php echo esc_url( $url ); ?>" target="_blank" style="background-color: <?php echo ! empty( $notice['background_color'] ) ? esc_attr( $notice['background_color'] ) : '#86a62c'; ?>;">
			<?php echo esc_html( $notice['button_text'] ); ?>
		  
		</a>
		<?php endif; ?>
		</div>
		</div>
		<a href=
						<?php
						echo esc_url(
							add_query_arg(
								$query_args
							)
						);
						?>
		class="eamm-notice-close"><span class="eamm-notice-close-icon dashicons dashicons-dismiss"> </span></a>
	</div>
						<?php
					}
				}
			}
		}
	}

	/**
	 * Banner css
	 *
	 * @return void
	 */
	public function eamm_banner_notice_css() {
		?>
	<style id="eamm-notice-css" type="text/css">
	.eamm-notice-wrapper {
	border: 1px solid #c3c4c7;
	border-left: 3px solid #037fff;
	margin: 15px 0px !important;
	display: flex;
	align-items: center;
	background: #ffffff;
	width: 100%;
	padding: 10px 0px;
	position: relative;
	box-sizing: border-box;
	}
	.eamm-notice-wrapper.notice, .eamm-free-notice.wc-install.notice {
	margin: 10px 0px;
	width: calc( 100% - 20px );
	}
	.wrap .eamm-notice-wrapper.notice, .wrap .eamm-free-notice.wc-install {
	width: 100%;
	}
	.eamm-notice-icon {
	margin-left: 15px;
	}
	.eamm-notice-discout-icon {
	margin-left: 5px;
	}
	.eamm-notice-icon img {
	max-width: 42px;
	height: 70px;
	}
	.eamm-notice-discout-icon img {
	height: 70px;
	width: 70px;
	}
	.eamm-notice-btn {
	font-weight: 600;
	text-transform: uppercase !important;
	padding: 2px 10px !important;
	background-color: #86a62c ;
	border: none !important;
	}

	.eamm-discount_btn {
	background-color: #ffffff;
	text-decoration: none;
	border: 1px solid #0c54fc;
	padding: 5px 10px;
	border-radius: 5px;
	font-weight: 500;
	text-transform: uppercase;
	color: #0c54fc !important;
	transition: background-color 200ms;
	}

	.eamm-discount_btn:hover {
		background-color: #0c54fc;
		color: #fff !important;
	}

	.eamm-notice-content-wrapper {
	display: flex;
	flex-direction: column;
	gap: 8px;
	font-size: 14px;
	line-height: 20px;
	margin-left: 15px;
	}
	.eamm-notice-buttons {
	display: flex;
	align-items: center;
	gap: 15px;
	}
	.eamm-notice-dont-save-money {
	font-size: 12px;
	}
	.eamm-notice-close {
	position: absolute;
	right: 2px;
	top: 5px;
	text-decoration: unset;
	color: #b6b6b6;
	font-family: dashicons;
	font-size: 16px;
	font-style: normal;
	font-weight: 400;
	line-height: 20px;
	}
	.eamm-notice-close-icon {
	font-size: 14px;
	}
	.eamm-free-notice.wc-install {
	display: flex;
	align-items: center;
	background: #fff;
	margin-top: 20px;
	width: 100%;
	box-sizing: border-box;
	border: 1px solid #ccd0d4;
	padding: 4px;
	border-radius: 4px;
	border-left: 3px solid #86a62c;
	line-height: 0;
	}   
	.eamm-free-notice.wc-install img {
	margin-right: 0; 
	max-width: 100%;
	}
	.eamm-free-notice .wc-install-body {
	-ms-flex: 1;
	flex: 1;
	position: relative;
	padding: 10px;
	}
	.eamm-free-notice .wc-install-body.eamm-image-banner{
	padding: 0px;
	}
	.eamm-free-notice .wc-install-body h3 {
	margin-top: 0;
	font-size: 24px;
	margin-bottom: 15px;
	}
	.eamm-install-btn {
	margin-top: 15px;
	display: inline-block;
	}
	.eamm-free-notice .wc-install .dashicons{
	display: none;
	animation: dashicons-spin 1s infinite;
	animation-timing-function: linear;
	}
	.eamm-free-notice.wc-install.loading .dashicons {
	display: inline-block;
	margin-top: 12px;
	margin-right: 5px;
	}
	.eamm-free-notice .wc-install-body h3 {
	font-size: 20px;
	margin-bottom: 5px;
	}
	.eamm-free-notice .wc-install-body > div {
	max-width: 100%;
	margin-bottom: 10px;
	}
	.eamm-free-notice .button-hero {
	padding: 8px 14px !important;
	min-height: inherit !important;
	line-height: 1 !important;
	box-shadow: none;
	border: none;
	transition: 400ms;
	}
	.eamm-free-notice .eamm-btn-notice-pro {
	background: #2271b1;
	color: #fff;
	}
	.eamm-free-notice .eamm-btn-notice-pro:hover,
	.eamm-free-notice .eamm-btn-notice-pro:focus {
	background: #185a8f;
	}
	.eamm-free-notice .button-hero:hover,
	.eamm-free-notice .button-hero:focus {
	border: none;
	box-shadow: none;
	}
	@keyframes dashicons-spin {
	0% {
	transform: rotate( 0deg );
	}
	100% {
	transform: rotate( 360deg );
	}
	}
	.eamm-free-notice .wc-dismiss-notice {
	color: #fff;
	background-color: #000000;
	padding-top: 0px;
	position: absolute;
	right: 0;
	top: 0px;
	padding: 10px 10px 14px;
	border-radius: 0 0 0 4px;
	display: inline-block;
	transition: 400ms;
	}
	.eamm-free-notice .wc-dismiss-notice:hover {
	color:red;
	}
	.eamm-free-notice .wc-dismiss-notice .dashicons{
	display: inline-block;
	text-decoration: none;
	animation: none;
	font-size: 16px;
	}
	/* ===== Eid Banner Css ===== */
	.eamm-free-notice .wc-install-body {
	background: linear-gradient(90deg,rgb(0,110,188) 0%,rgb(2,17,196) 100%);
	}
	.eamm-free-notice p{
	color: #fff;
	margin: 5px 0px;
	font-size: 16px;
	font-weight: 300;
	letter-spacing: 1px;
	}
	.eamm-free-notice p.eamm-enjoy-offer {
	display: inline;
	font-weight: bold;
	
	}
	.eamm-free-notice .eamm-get-now {
	font-size: 14px;
	color: #fff;
	background: #14a8ff;
	padding: 8px 12px;
	border-radius: 4px;
	text-decoration: none;
	margin-left: 10px;
	position: relative;
	top: -4px;
	transition: 400ms;
	}
	.eamm-free-notice .eamm-get-now:hover{
	background: #068fe0;
	}
	.eamm-free-notice .eamm-dismiss {
	color: #fff;
	background-color: #000964;
	padding-top: 0px;
	position: absolute;
	right: 0;
	top: 0px;
	padding: 10px 8px 12px;
	border-radius: 0 0 0 4px;
	display: inline-block;
	transition: 400ms;
	}
	.eamm-free-notice .eamm-dismiss:hover {
	color: #d2d2d2;
	}
	/*----- EAMM Into Notice ------*/
	.notice.notice-success.eamm-notice {
	border-left-color: #4D4DFF;
	padding: 0;
	}
	.eamm-notice-container {
	display: flex;
	}
	.eamm-notice-container a{
	text-decoration: none;
	}
	.eamm-notice-container a:visited{
	color: white;
	}
	.eamm-notice-container img {
	height: 100px; 
	width: 100px;
	}
	.eamm-notice-image {
	padding-top: 15px;
	padding-left: 12px;
	padding-right: 12px;
	background-color: #f4f4ff;
	}
	.eamm-notice-image img{
	max-width: 100%;
	}
	.eamm-notice-content {
	width: 100%;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 8px;
	}
	.eamm-notice-eamm-button {
	max-width: fit-content;
	padding: 8px 15px;
	font-size: 16px;
	color: white;
	background-color: #4D4DFF;
	border: none;
	border-radius: 2px;
	cursor: pointer;
	margin-top: 6px;
	text-decoration: none;
	}
	.eamm-notice-heading {
	font-size: 18px;
	font-weight: 500;
	color: #1b2023;
	}
	.eamm-notice-content-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	}
	.eamm-notice-close .dashicons-no-alt {
	font-size: 25px;
	height: 26px;
	width: 25px;
	cursor: pointer;
	color: #585858;
	}
	.eamm-notice-close .dashicons-no-alt:hover {
	color: red;
	}
	.eamm-notice-content-body {
	font-size: 14px;
	color: #343b40;
	}
	.eamm-notice-wholesalex-button:hover {
	background-color: #6C6CFF;
	color: white;
	}
	span.eamm-bold {
	font-weight: bold;
	}
	a.eamm-pro-dismiss:focus {
	outline: none;
	box-shadow: unset;
	}
	.eamm-free-notice .loading, .eamm-notice .loading {
	width: 16px;
	height: 16px;
	border: 3px solid #FFF;
	border-bottom-color: transparent;
	border-radius: 50%;
	display: inline-block;
	box-sizing: border-box;
	animation: rotation 1s linear infinite;
	margin-left: 10px;
	}
	a.eamm-notice-eamm-button:hover {
	color: #fff !important;
	}
	@keyframes rotation {
	0% {
	transform: rotate(0deg);
	}
	100% {
	transform: rotate(360deg);
	}
	}
	</style>
		<?php
	}


	/**
	 * The Durbin Html
	 *
	 * @return void
	 */
	public function eamm_dashboard_durbin_notice_callback() {
		$durbin_key = 'eamm_durbin_dc1';

		if (
			isset( $_GET['eamm_durbin_key'] ) || // phpcs:ignore
			'off' === Xpo::get_transient_without_cache( 'eamm_durbin_notice_' . $durbin_key )
		) {
			return;
		}

		if ( ! $this->notice_js_css_applied ) {
			$this->eamm_banner_notice_css();
			$this->notice_js_css_applied = true;
		}

		$eamm_db_nonce = wp_create_nonce( 'eamm-nonce' );

		?>
		<style>
				.eamm-consent-box {
					width: 656px;
					padding: 16px;
					border: 1px solid #070707;
					border-left-width: 4px;
					border-radius: 4px;
					background-color: #fff;
					position: relative;
				}
				.eamm-consent-content {
					display: flex;
					justify-content: space-between;
					align-items: flex-end;
					gap: 26px;
				}
 
				.eamm-consent-text-first {
					font-size: 14px;
					font-weight: 600;
					color: #070707;
				}
				.eamm-consent-text-last {
					margin: 4px 0 0;
					font-size: 14px;
					color: #070707;
				}
 
				.eamm-consent-accept {
					background-color: #070707;
					color: #fff;
					border: none;
					padding: 6px 10px;
					border-radius: 4px;
					cursor: pointer;
					font-size: 12px;
					font-weight: 600;
					text-decoration: none;
				}
				.eamm-consent-accept:hover {
					background-color:rgb(38, 38, 38);
					color: #fff;
				}
			</style>
			<div class="eamm-consent-box eamm-notice-wrapper notice data_collection_notice">
			<div class="eamm-consent-content">
			<div class="eamm-consent-text">
			<div class="eamm-consent-text-first"><?php esc_html_e( 'Want to help make WowShipping even more awesome?', 'easy-min-max' ); ?></div>
			<div class="eamm-consent-text-last">
					<?php esc_html_e( 'Allow us to collect diagnostic data and usage information. see ', 'easy-min-max' ); ?>
			<a href="https://www.wpxpo.com/data-collection-policy/" target="_blank" ><?php esc_html_e( 'what we collect.', 'easy-min-max' ); ?></a>
			</div>
			</div>
			<a
					class="eamm-consent-accept"
					href=
					<?php
									echo esc_url(
										add_query_arg(
											array(
												'eamm_durbin_key' => $durbin_key,
												'eamm_get_durbin' => 'get',
												'wpnonce' => $eamm_db_nonce,
											)
										)
									);
					?>
									class="eamm-notice-close"
			><?php esc_html_e( 'Accept & Close', 'easy-min-max' ); ?></a>
			</div>
			<a href=
					<?php
								echo esc_url(
									add_query_arg(
										array(
											'eamm_durbin_key' => $durbin_key,
											'wpnonce' => $eamm_db_nonce,
										)
									)
								);
					?>
								class="eamm-notice-close"
			>
				<span class="eamm-notice-close-icon dashicons dashicons-dismiss"> </span></a>
			</div>
		<?php
	}

	/**
	 * Plugin Install and Active Action
	 *
	 * @return void
	 */
	public function install_activate_plugin() {
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['wpnonce'] ?? '' ) ), 'eamm-nonce' ) ) {
			wp_send_json_error( esc_html__( 'Invalid nonce.', 'easy-min-max' ) );
		}

		if ( ! isset( $_POST['install_plugin'] ) || ! Flags::is_user_admin() ) {
			wp_send_json_error( esc_html__( 'Invalid request.', 'easy-min-max' ) );
		}
		$plugin_slug = sanitize_text_field( wp_unslash( $_POST['install_plugin'] ) );

		Xpo::install_and_active_plugin( $plugin_slug );

		$action = sanitize_text_field( wp_unslash( $_POST['action'] ?? '' ) ); // phpcs:ignore

		if ( wp_doing_ajax() || is_network_admin() || isset( $_GET['activate-multi'] ) || 'activate-selected' === $action ) { //phpcs:ignore
			die();
		}

		wp_send_json_success( admin_url( 'admin.php?page=eamm-dashboard#dashboard' ) );
	}

	/**
	 * Installation Notice CSS
	 *
	 * @return void
	 */
	public function install_notice_css() {
		?>
		<style type="text/css">
			.eamm-wc-install {
				display: flex;
				align-items: center;
				background: #fff;
				margin-top: 30px !important;
				/*width: calc(100% - 65px);*/
				border: 1px solid #ccd0d4;
				padding: 4px !important;
				border-radius: 4px;
				border-left: 3px solid #46b450;
				line-height: 0;
				gap: 15px;
				padding: 15px 10px !important;
			}
			.eamm-wc-install img {
				width: 100px;
			}
			.eamm-install-body {
				-ms-flex: 1;
				flex: 1;
			}
			.eamm-install-body.eamm-image-banner {
				padding: 0px !important;
			}
			.eamm-install-body.eamm-image-banner img {
				width: 100%;
			}
			.eamm-install-body>div {
				max-width: 450px;
				margin-bottom: 20px !important;
			}
			.eamm-install-body h3 {
				margin: 0 !important;
				font-size: 20px;
				margin-bottom: 10px !important;
				line-height: 1;
			}
			.eamm-pro-notice .wc-install-btn,
			.wp-core-ui .eamm-wc-active-btn {
				display: inline-flex;
				align-items: center;
				padding: 3px 20px !important;
			}
			.eamm-pro-notice.loading .wc-install-btn {
				opacity: 0.7;
				pointer-events: none;
			}
			.eamm-wc-install.wc-install .dashicons {
				display: none;
				animation: dashicons-spin 1s infinite;
				animation-timing-function: linear;
			}
			.eamm-wc-install.wc-install.loading .dashicons {
				display: inline-block;
				margin-right: 5px !important;
			}
			@keyframes dashicons-spin {
				0% {
					transform: rotate(0deg);
				}
				100% {
					transform: rotate(360deg);
				}
			}
			.eamm-wc-install .wc-dismiss-notice {
				position: relative;
				text-decoration: none;
				float: right;
				right: 5px;
				display: flex;
				align-items: center;
			}
			.eamm-wc-install .wc-dismiss-notice .dashicons {
				display: flex;
				text-decoration: none;
				animation: none;
				align-items: center;
			}
			.eamm-pro-notice {
				position: relative;
				border-left: 3px solid #86a62c;
			}
			.eamm-pro-notice .eamm-install-body h3 {
				font-size: 20px;
				margin-bottom: 5px !important;
			}
			.eamm-pro-notice .eamm-install-body>div {
				max-width: 800px;
				margin-bottom: 0 !important;
			}
			.eamm-pro-notice .button-hero {
				padding: 8px 14px !important;
				min-height: inherit !important;
				line-height: 1 !important;
				box-shadow: none;
				border: none;
				transition: 400ms;
				background: #46b450;
			}
			.eamm-pro-notice .button-hero:hover,
			.wp-core-ui .eamm-pro-notice .button-hero:active {
				background: #389e41;
			}
			.eamm-pro-notice .eamm-btn-notice-pro {
				background: #e5561e;
				color: #fff;
			}
			.eamm-pro-notice .eamm-btn-notice-pro:hover,
			.eamm-pro-notice .eamm-btn-notice-pro:focus {
				background: #ce4b18;
			}
			.eamm-pro-notice .button-hero:hover,
			.eamm-pro-notice .button-hero:focus {
				border: none;
				box-shadow: none;
			}
			.eamm-pro-notice .eamm-promotional-dismiss-notice {
				background-color: #000000;
				padding-top: 0px !important;
				position: absolute;
				right: 0;
				top: 0px;
				padding: 10px 10px 14px !important;
				border-radius: 0 0 0 4px;
				border: 1px solid;
				display: inline-block;
				color: #fff;
			}
			.eamm-eid-notice p {
				margin: 0 !important;
				color: #f7f7f7;
				font-size: 16px;
			}
			.eamm-eid-notice p.eamm-eid-offer {
				color: #fff;
				font-weight: 700;
				font-size: 18px;
			}
			.eamm-eid-notice p.eamm-eid-offer a {
				background-color: #ffc160;
				padding: 8px 12px !important;
				border-radius: 4px;
				color: #000;
				font-size: 14px;
				margin-left: 3px !important;
				text-decoration: none;
				font-weight: 500;
				position: relative;
				top: -4px;
			}
			.eamm-eid-notice p.eamm-eid-offer a:hover {
				background-color: #edaa42;
			}
			.eamm-install-body .eamm-promotional-dismiss-notice {
				right: 4px;
				top: 3px;
				border-radius: unset !important;
				padding: 10px 8px 12px !important;
				text-decoration: none;
			}
			.eamm-notice {
				background: #fff;
				border: 1px solid #c3c4c7;
				border-left-color: #86a62c !important;
				border-left-width: 4px;
				border-radius: 4px 0px 0px 4px;
				box-shadow: 0 1px 1px rgba(0, 0, 0, .04);
				padding: 0px !important;
				margin: 40px 20px 0 2px !important;
				clear: both;
			}
			.eamm-notice .eamm-notice-container {
				display: flex;
				width: 100%;
			}
			.eamm-notice .eamm-notice-container a {
				text-decoration: none;
			}
			.eamm-notice .eamm-notice-container a:visited {
				color: white;
			}
			.eamm-notice .eamm-notice-container img {
				width: 100%;
				max-width: 30px !important;
				padding: 12px !important;
			}
			.eamm-notice .eamm-notice-image {
				display: flex;
				align-items: center;
				flex-direction: column;
				justify-content: center;
				background-color: #f4f4ff;
			}
			.eamm-notice .eamm-notice-image img {
				max-width: 100%;
			}
			.eamm-notice .eamm-notice-content {
				width: 100%;
				margin: 5px !important;
				padding: 8px !important;
				display: flex;
				flex-direction: column;
				gap: 0px;
			}
			.eamm-notice .eamm-notice-eamm-button {
				max-width: fit-content;
				text-decoration: none;
				padding: 7px 12px !important;
				font-size: 12px;
				color: white;
				border: none;
				border-radius: 2px;
				cursor: pointer;
				margin-top: 6px !important;
				background-color: #e5561e;
			}
			.eamm-notice-heading {
				font-size: 18px;
				font-weight: 500;
				color: #1b2023;
			}
			.eamm-notice-content-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
			}
			.eamm-notice-close .dashicons-no-alt {
				font-size: 25px;
				height: 26px;
				width: 25px;
				cursor: pointer;
				color: #585858;
			}
			.eamm-notice-close .dashicons-no-alt:hover {
				color: red;
			}
			.eamm-notice-content-body {
				font-size: 12px;
				color: #343b40;
			}
			.eamm-bold {
				font-weight: bold;
			}
			a.eamm-pro-dismiss:focus {
				outline: none;
				box-shadow: unset;
			}
			.eamm-free-notice .loading,
			.eamm-notice .loading {
				width: 16px;
				height: 16px;
				border: 3px solid #FFF;
				border-bottom-color: transparent;
				border-radius: 50%;
				display: inline-block;
				box-sizing: border-box;
				animation: rotation 1s linear infinite;
				margin-left: 10px !important;
			}
			a.eamm-notice-eamm-button:hover {
				color: #fff !important;
			}
			.eamm-notice .eamm-link-wrap {
				margin-top: 10px !important;
			}
			.eamm-notice .eamm-link-wrap a {
				margin-right: 4px !important;
			}
			.eamm-notice .eamm-link-wrap a:hover {
				background-color: #ce4b18;
			}
			body .eamm-notice .eamm-link-wrap>a.eamm-notice-skip {
				background: none !important;
				border: 1px solid #e5561e;
				color: #e5561e;
				padding: 6px 15px !important;
			}
			body .eamm-notice .eamm-link-wrap>a.eamm-notice-skip:hover {
				background: #ce4b18 !important;
			}
			@keyframes rotation {
				0% {
					transform: rotate(0deg);
				}
				100% {
					transform: rotate(360deg);
				}
			}

			.eamm-install-btn-wrap {
				display: flex;
				align-items: stretch;
				gap: 10px;
			}
			.eamm-install-btn-wrap .eamm-install-cancel {
				position: static !important;
				padding: 3px 20px;
				border: 1px solid #a0a0a0;
				border-radius: 2px;
			}
		</style>
		<?php
	}

	/**
	 * Installation Notice JS
	 *
	 * @return void
	 */
	public function install_notice_js() {
		?>
		<script type="text/javascript">
			jQuery(document).ready(function($) {
				'use strict';
				$(document).on('click', '.wc-install-btn.eamm-install-btn', function(e) {
					e.preventDefault();
					const $that = $(this);
					console.log($that.attr('data-plugin-slug'));
					$.ajax({
						type: 'POST',
						url: ajaxurl,
						data: {
							install_plugin: $that.attr('data-plugin-slug'),
							action: 'eamm_install',
							wpnonce: '<?php echo esc_js( wp_create_nonce( 'eamm-nonce' ) ); ?>',
						},
						beforeSend: function() {
							$that.parents('.wc-install').addClass('loading');
						},
						success: function(response) {
							window.location.reload()
						},
						complete: function() {
							// $that.parents('.wc-install').removeClass('loading');
						}
					});
				});
			});
		</script>
		<?php
	}
}
