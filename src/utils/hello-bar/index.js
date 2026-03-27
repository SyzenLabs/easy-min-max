import { isProUser } from '@/utils';
import UTMLinkGenerator from '@/utils/utm-link-generator';
import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Hellobar = () => {
	const [ helloBar, setHelloBar ] = useState( eammAdmin.helloBar );

	const helloBarAction = () => {
		setHelloBar( 'hide' );
		apiFetch( {
			path: '/eamm/v1/hello_bar',
			method: 'POST',
			data: { type: 'hello_bar' },
		} );
	};

	// YYYY-MM-DD
	const holidayTimeLimit =
		new Date() >= new Date( '2026-01-01' ) &&
		new Date() <= new Date( '2026-02-15' );

	if ( helloBar === 'hide' || isProUser() || ! holidayTimeLimit ) {
		return null;
	}

	return (
		<div>
			<style>
				{ `.eamm-setting-hellobar {
                    background: var(--eamm-color-primary-base);
                    padding: 6px 0;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.85);
                    font-size: 14px;
                }

                .eamm-setting-hellobar a {
                    margin-left: 4px;
                    font-size: 14px;
                    color: #fff;
                }

                .eamm-setting-hellobar strong {
                    color: #fff;
                    font-weight: 700;
                }
                .eamm-ring {
                    -webkit-animation: ring 4s .7s ease-in-out infinite;
                    -moz-animation: ring 4s .7s ease-in-out infinite;
                    animation: ring 4s .7s ease-in-out infinite;
                    margin-right: 5px;
                    font-size: 20px;
                    position: relative;
                    top: 2px;
                    color: #fff;
                }
                .helobarClose {
                    position: absolute;
                    cursor: pointer;
                    right: 15px;
                    svg {
                        height: 16px;
                        color: #fff;
                    }
                }
                @keyframes ring {
                    0% { transform: rotate(0); }
                    1% { transform: rotate(30deg); }
                    3% { transform: rotate(-28deg); }
                    5% { transform: rotate(34deg); }
                    7% { transform: rotate(-32deg); }
                    9% { transform: rotate(30deg); }
                    11% { transform: rotate(-28deg); }
                    13% { transform: rotate(26deg); }
                    15% { transform: rotate(-24deg); }
                    17% { transform: rotate(22deg); }
                    19% { transform: rotate(-20deg); }
                    21% { transform: rotate(18deg); }
                    23% { transform: rotate(-16deg); }
                    25% { transform: rotate(14deg); }
                    27% { transform: rotate(-12deg); }
                    29% { transform: rotate(10deg); }
                    31% { transform: rotate(-8deg); }
                    33% { transform: rotate(6deg); }
                    35% { transform: rotate(-4deg); }
                    37% { transform: rotate(2deg); }
                    39% { transform: rotate(-1deg); }
                    41% { transform: rotate(1deg); }
                    43% { transform: rotate(0); }
                    100% { transform: rotate(0); }
                }` }
			</style>
			<div className="eamm-setting-hellobar">
				<a
					href={ UTMLinkGenerator( {
						utmKey: 'db_hellobar',
						hash: 'pricing',
					} ) }
					target="_blank"
					rel="noreferrer"
				>
					<span className="dashicons dashicons-bell eamm-ring"></span>
					<strong>
						{ __(
							'Fresh New Year Savings:',
							'easy-min-max'
						) }
					</strong>
					&nbsp;
					{ __( 'WowShipping prices', 'easy-min-max' ) }
					&nbsp;
					<strong>
						{ __(
							'starting from just $26 - Get it Now!',
							'easy-min-max'
						) }
					</strong>
					&nbsp; &#10148;
				</a>
				<button
					type="button"
					className="helobarClose"
					onClick={ () => {
						helloBarAction();
					} }
					aria-label={ __(
						'Close notification',
						'easy-min-max'
					) }
					style={ {
						background: 'none',
						border: 'none',
						padding: 0,
						cursor: 'pointer',
					} }
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						fill="none"
						viewBox="0 0 20 20"
					>
						<path stroke="currentColor" d="M15 5 5 15M5 5l10 10" />
					</svg>
				</button>
			</div>
		</div>
	);
};

export default Hellobar;
