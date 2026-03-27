/* eslint-disable prettier/prettier */
import { cn } from '@/utils';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

// import './style.scss';

const FileUpload = () => {
	return (
		<input
			type="file"
			name="attachment"
			accept="image/png, image/jpeg"
			className="xpo-input-support"
			id="xpo-support-file-input"
		/>
	);
};

const Support = () => {
	const [ isShow, setIsShow ] = useState( false );
	const [ submitting, setSubmitting ] = useState( false );
	const [ showThanks, setShowThanks ] = useState( false );
	const supportRef = useRef( null );
	const formRef = useRef( null );

	useEffect( () => {
		const ctrl = new AbortController();

		if ( ! isShow ) {
			return;
		}

		document.addEventListener(
			'mousedown',
			( e ) => {
				if (
					supportRef.current &&
					! supportRef.current.contains( e.target )
				) {
					setShowThanks( false );
					setIsShow( false );
				}
			},
			{
				signal: ctrl.signal,
			}
		);

		return () => {
			ctrl.abort();
		};
	}, [ isShow ] );

	const postRequest = ( e ) => {
		if ( submitting ) {
			return;
		}

		e.preventDefault();
		setSubmitting( true );
		const formData = new FormData( e.target );

		fetch( 'https://wpxpo.com/wp-json/v2/support_mail', {
			method: 'POST',
			body: formData,
		} )
			.then( ( response ) => {
				if ( ! response.ok ) {
					throw new Error( 'Failed to submit ticket' );
				}

				setShowThanks( true );
				if ( formRef.current ) {
					formRef.current.reset();
				}
			} )
			.catch( ( err ) => {
				// eslint-disable-next-line no-console
				console.log( err );
			} )
			.finally( () => {
				setSubmitting( false );
			} );
	};

	function isInDhakaOfficeHours() {
		return true; // 24/7 support :)
	}

	return (
		<div ref={ supportRef }>
			<span
				className={ cn(
					'xpo-support-pops-btn xpo-support-pops-btn--small',
					isShow && 'xpo-support-pops-btn--big'
				) }
				onClick={ () => {
					setIsShow( ( prev ) => {
						if ( prev ) {
							setShowThanks( false );
						}
						return ! prev;
					} );
				} }
				aria-label={ __(
					'Open Support Chat',
					'easy-min-max'
				) }
				role="button"
				tabIndex={ -1 }
				onKeyDown={ ( e ) => {
					if ( e.key === 'Enter' ) {
						setIsShow( ( prev ) => {
							if ( prev ) {
								setShowThanks( false );
							}
							return ! prev;
						} );
					}
				} }
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="28"
					height="28"
					fill="none"
					viewBox="0 0 28 28"
				>
					<path
						fill="var(--xpo-support-color-reverse)"
						fillRule="evenodd"
						d="M27.3 14c0 7.4-6 13.3-13.3 13.3H.7l3.9-3.9A13.3 13.3 0 0 1 14 .7c7.4 0 13.3 6 13.3 13.3Zm-19 1.7a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Zm7.4-1.7a1.7 1.7 0 1 1-3.4 0 1.7 1.7 0 0 1 3.4 0Zm5.6 0a1.7 1.7 0 1 1-3.3 0 1.7 1.7 0 0 1 3.3 0Z"
						clipRule="evenodd"
					/>
				</svg>
			</span>
			{ isShow && (
				<div
					className={ cn(
						'xpo-support-pops-container',
						isShow && 'xpo-support-entry-anim',
						! showThanks &&
							'xpo-support-pops-container--full-height'
					) }
				>
					<div className="xpo-support-pops-header">
						<div
							style={ {
								maxHeight: showThanks ? '0px' : '140px',
								opacity: showThanks ? '0' : '1',
								transition: 'max-height 0.3s, opacity 0.3s',
							} }
						>
							<div className="xpo-support-header-bg" />

							<div className="xpo-support-pops-avatars">
								<img
									src={
										eammAdmin.url +
										'assets/img/support/1.png'
									}
									alt="WPXPO"
								/>
								<img
									src={
										eammAdmin.url +
										'assets/img/support/2.jpg'
									}
									alt="A. Owadud Bhuiyan"
								/>
								<img
									src={
										eammAdmin.url +
										'assets/img/support/3.jpg'
									}
									alt="Abdullah Al Mahmud"
								/>
								<div
									className={ cn(
										'xpo-support-signal',
										isInDhakaOfficeHours()
											? 'xpo-support-signal-green'
											: 'xpo-support-signal-red'
									) }
								></div>
							</div>
							<div className="xpo-support-pops-text">
								Questions? Create an Issue!
							</div>
						</div>
					</div>
					<div className="xpo-support-chat-body">
						<div
							style={ {
								maxHeight: showThanks ? '174px' : '0px',
								opacity: showThanks ? '1' : '0',
								transition: 'max-height 0.3s, opacity 0.3s',
							} }
						>
							{ showThanks && (
								<>
									<div className="xpo-support-thankyou-icon">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 52 52"
											className="xpo-support-animation"
										>
											<circle
												className="xpo-support-circle"
												cx="26"
												cy="26"
												r="25"
												fill="none"
											/>
											<path
												className="xpo-support-check"
												fill="none"
												d="M14.1 27.2l7.1 7.2 16.7-16.8"
											/>
										</svg>
									</div>
									<div className="xpo-support-thankyou-title">
										{ __(
											'Thank You!',
											'easy-min-max'
										) }
									</div>
									<div className="xpo-support-thankyou-subtitle">
										{ __(
											'Your message has been received. We will contact you soon on your email with a response. Stay connected and check mail!',
											'easy-min-max'
										) }
									</div>
								</>
							) }
						</div>
						<form
							ref={ formRef }
							onSubmit={ postRequest }
							encType="multipart/form-data"
							style={ {
								maxHeight: showThanks ? '0px' : '376px',
								opacity: showThanks ? '0' : '1',
								transition: 'max-height 0.3s, opacity 0.3s',
							} }
						>
							<input
								type="hidden"
								name="user_name"
								defaultValue={ eammAdmin.userInfo.name }
							/>
							<input
								type="email"
								name="user_email"
								className="xpo-input-support"
								defaultValue={ eammAdmin.userInfo.email }
								required
							/>
							<input
								type="hidden"
								name="subject"
								value="Support from WowShipping"
							/>
							<div className="xpo-support-title">
								{ __( 'Message', 'easy-min-max' ) }
							</div>
							<textarea
								name="desc"
								className="xpo-input-support"
								placeholder="Write your message here..."
							></textarea>
							<FileUpload />
							<button
								type="submit"
								className="xpo-send-button"
								disabled={ submitting }
							>
								{ submitting ? (
									<>
										Sending
										<div className="xpo-support-loading"></div>
									</>
								) : (
									<>
										Send
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="21"
											height="20"
											fill="none"
											viewBox="0 0 21 20"
										>
											<path
												fill="var(--xpo-support-color-reverse)"
												d="M18.4 10c0-.6-.3-1.1-.8-1.4L5 2c-.6-.3-1.2-.3-1.7 0-.6.4-.9 1.3-.7 1.9l1.2 4.8c0 .5.5.8 1 .8h7c.3 0 .6.3.6.6 0 .4-.3.6-.6.6h-7c-.5 0-1 .4-1 .9l-1.3 4.8c-.1.6 0 1.1.5 1.5l.1.2c.5.4 1.2.4 1.8.1l12.5-6.6c.6-.3 1-.9 1-1.5Z"
											/>
										</svg>
									</>
								) }
							</button>
						</form>
					</div>
				</div>
			) }
		</div>
	);
};

export default Support;
