import { BaseControl, Spinner } from '@wordpress/components';
import { useEvent } from '@wordpress/compose';
import { useEffect, useRef, useState } from '@wordpress/element';

export function TinyEditor( {
	value,
	onChange,
	label,
	id = null,
	help = null,
} ) {
	const [ loaded, setLoaded ] = useState( false );

	const textareaRef = useRef( null );

	const idRef = useRef(
		id ? id : `eamm-${ Math.random().toString( 36 ).slice( 2 ) }`
	);

	const isInitializedRef = useRef( false );

	const onChangeCallback = useEvent( onChange );

	useEffect( () => {
		if ( ! window.wp || ! window.wp.editor || isInitializedRef.current ) {
			return;
		}

		const _id = idRef.current + '-editor';

		window.wp.editor.initialize( _id, {
			mediaButtons: false,
			quicktags: true,
			tinymce: {
				forced_root_block: 'div',
				force_br_newlines: true,
				force_p_newlines: false,
				branding: false,
				menubar: false,
				toolbar1:
					'bold italic alignleft aligncenter alignright alignjustify bullist numlist link unlink blockquote undo redo',
				toolbar2: 'removeformat,code',
				wpautop: false,
				resize: true,
				height: 300,
				setup( editor ) {
					editor.on( 'init', () => {
						setLoaded( true );
					} );

					editor.on( 'Change KeyUp', () => {
						onChangeCallback( editor.getContent() );
					} );
				},
			},
		} );

		isInitializedRef.current = true;

		return () => {
			window.wp.editor.remove( _id );
			isInitializedRef.current = false;
		};
	}, [ onChangeCallback ] );

	return (
		<BaseControl
			id={ idRef.current + '-editor' }
			label={ label }
			help={ help }
			__nextHasNoMarginBottom={ true }
			__next40pxDefaultSize={ true }
		>
			<div className="h-[1px] w-[1px]" id={ idRef.current } />
			{ ! loaded && (
				<div className="flex items-center justify-center h-75">
					<Spinner
						style={ {
							width: 56,
							height: 56,
						} }
					/>
				</div>
			) }
			<div
				style={ {
					display: loaded ? 'block' : 'none',
				} }
			>
				<textarea
					id={ idRef.current + '-editor' }
					ref={ textareaRef }
					defaultValue={ value }
				/>
			</div>
		</BaseControl>
	);
}
