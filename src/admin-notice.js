/* global syzeqlNotice */
( function () {
	function request( action, nonce, done ) {
		const body = new URLSearchParams();
		body.append( 'action', syzeqlNotice.ajaxAction );
		body.append( 'notice_action', action );
		body.append( 'nonce', nonce );

		window
			.fetch( syzeqlNotice.ajaxUrl, {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type':
						'application/x-www-form-urlencoded; charset=UTF-8',
				},
				body: body.toString(),
			} )
			.then( function () {
				if ( typeof done === 'function' ) {
					done();
				}
			} );
	}

	document.addEventListener( 'click', function ( event ) {
		const button = event.target.closest( '.syzeql-notice-action' );

		if ( ! button ) {
			return;
		}

		const action = button.getAttribute( 'data-notice-action' );
		const nonce = button.getAttribute( 'data-nonce' );

		if ( ! action || ! nonce ) {
			return;
		}

		const notice = button.closest( '.syzeql-admin-notice' );
		if ( button.tagName.toLowerCase() === 'a' ) {
			event.preventDefault();
			const href = button.getAttribute( 'href' ) || '';

			request( action, nonce, function () {
				if ( notice ) {
					notice.remove();
				}

				if ( href ) {
					window.open( href, '_blank', 'noopener,noreferrer' );
				}
			} );
			return;
		}

		request( action, nonce, function () {
			if ( notice ) {
				notice.remove();
			}
		} );
	} );
} )();
