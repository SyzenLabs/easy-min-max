import { cn } from '@/utils';
import { Button, Icon, ProgressBar } from '@wordpress/components';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';

// import './style.scss';

// context
const FileUploaderContext = createContext();

function useFileUploaderContext() {
	return useContext( FileUploaderContext );
}

function FileUploader( {
	multiple = false,
	accept = '.jpeg, .jpg, .png',
	sizeLimit = 10, // TODO: validate file size
	className = '',
	label,
	subtitle,
	dragOverLabel,
	progressText,
	uploadText,
	disabled = false,
	onUpload,
} ) {
	const [ files, setFiles ] = useState( null );
	const [ status, setStatus ] = useState( 'idle' ); //idle, preview, uploading, done

	return (
		<div
			className={ cn(
				'szql-file-uploader-component',
				className,
				disabled && 'szql-is-disabled'
			) }
		>
			<FileUploaderContext.Provider
				value={ {
					files,
					setFiles,
					setStatus,
					multiple,
					disabled,
					uploadText,
					status,
					onUpload,
				} }
			>
				{ status === 'idle' && (
					<FileUploaderContent
						label={ label }
						subtitle={ subtitle }
						accept={ accept }
						sizeLimit={ sizeLimit }
						dragOverLabel={ dragOverLabel }
						onChange={ ( v ) => {
							setFiles( v );
							setStatus( 'preview' );
						} }
					/>
				) }
				{ status === 'preview' && (
					<FileUploaderPreview
						uploadText={ uploadText }
						onUpload={ () => {
							setStatus( 'uploading' );
							onUpload?.( files );
						} }
					/>
				) }
				{ status === 'uploading' && (
					<FileUploaderLoader progressText={ progressText } />
				) }
			</FileUploaderContext.Provider>
		</div>
	);
}

const validateFile = ( file, accept, sizeLimit ) => {
	// Validate file type
	if ( accept ) {
		const acceptedTypes = accept
			.split( ',' )
			.map( ( type ) => type.trim().toLowerCase() );
		const fileExtension = '.' + file.name.split( '.' ).pop().toLowerCase();
		const fileType = file.type.toLowerCase();

		const isTypeValid = acceptedTypes.some( ( type ) => {
			// Check for extensions (e.g., .jpg, .png)
			if ( type.startsWith( '.' ) ) {
				return fileExtension === type;
			}
			// Check for MIME types (e.g., image/*, application/pdf)
			if ( type.endsWith( '/*' ) ) {
				const mimeGroup = type.split( '/' )[ 0 ];
				return fileType.startsWith( mimeGroup );
			}
			// Check exact MIME type
			return fileType === type;
		} );

		if ( ! isTypeValid ) {
			return {
				valid: false,
				error: `File type not allowed. Allowed types: ${ accept }`,
			};
		}
	}

	// Validate file size (sizeLimit is in MB)
	if ( sizeLimit ) {
		const fileSizeMB = file.size / ( 1024 * 1024 ); // Convert bytes to MB
		if ( fileSizeMB > sizeLimit ) {
			return {
				valid: false,
				error: `File size exceeds ${ sizeLimit }MB limit`,
			};
		}
	}

	return { valid: true };
};

function FileUploaderContent( {
	label = __( 'Drag and Drop File Here', 'syzenlabs-quantity-limits' ),
	subtitle = __( `You can upload files`, 'syzenlabs-quantity-limits' ),
	accept,
	sizeLimit, // in MB
	dragOverLabel,
	onChange,
} ) {
	const { multiple, disabled, setFiles, setStatus } =
		useFileUploaderContext();

	const inputRef = useRef( null );
	const dropZoneRef = useRef( null );
	const [ isDragging, setIsDragging ] = useState( false );
	const dragCounter = useRef( 0 );

	const handleFileChange = useCallback(
		( f ) => {
			if ( ! f || ! f.length ) {
				return;
			}

			//  TODO: validate file size
			// Array.from( files ).forEach( ( file ) => {
			// 	const currentSize = file.size / 1024 / 1024;
			// 	if ( currentSize > sizeLimit ) {
			// 		console.log( 'File size exceeds the limit' );
			// 	}
			// } );

			if ( multiple ) {
				setFiles( Array.from( f ) );
				onChange?.( Array.from( f ) );
			} else {
				setFiles( f[ 0 ] );
				onChange?.( f[ 0 ] );
			}

			setStatus( 'preview' );
		},
		[ multiple, onChange, setFiles, setStatus ]
	);

	const handleDragEnter = ( e ) => {
		e.preventDefault();
		e.stopPropagation();

		if ( disabled ) {
			return;
		}

		const items = e.dataTransfer.items;
		if ( items && items.length > 0 ) {
			// Check if any item is a file and validate it
			let hasValidFiles = false;
			for ( let i = 0; i < items.length; i++ ) {
				const item = items[ i ];
				if ( item.kind === 'file' ) {
					const file = item.getAsFile();
					if ( file ) {
						const validation = validateFile(
							file,
							accept,
							sizeLimit
						);
						if ( validation.valid ) {
							hasValidFiles = true;
							break;
						}
					}
				}
			}

			if ( hasValidFiles ) {
				dragCounter.current++;
				setIsDragging( true );
			}
		}
	};

	const handleDragOver = ( e ) => {
		e.preventDefault();
		e.stopPropagation();
		if (
			e.dataTransfer.items &&
			e.dataTransfer.items.length > 0 &&
			! disabled
		) {
			setIsDragging( true );
		}
	};

	const handleDragLeave = ( e ) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current--;
		if ( dragCounter.current === 0 ) {
			setIsDragging( false );
		}
	};

	const handleDrop = ( e ) => {
		e.preventDefault();
		e.stopPropagation();

		setIsDragging( false );
		dragCounter.current = 0;

		if ( disabled ) {
			return;
		}

		const files = e.dataTransfer.files;
		if ( files && files.length > 0 ) {
			const validFiles = [];
			const errors = [];

			// Convert FileList to array and validate each file
			Array.from( files ).forEach( ( file ) => {
				const validation = validateFile( file, accept, sizeLimit );
				if ( validation.valid ) {
					validFiles.push( file );
				} else {
					errors.push( `${ file.name }: ${ validation.error }` );
				}
			} );

			// Show error messages if any
			if ( errors.length > 0 ) {
				// eslint-disable-next-line no-alert
				alert( errors.join( '\n' ) );
			}

			// Proceed only with valid files
			if ( validFiles.length > 0 ) {
				handleFileChange( multiple ? validFiles : [ validFiles[ 0 ] ] );
			}
		}
	};

	const handleInputChange = ( e ) => {
		const files = e.target.files;
		if ( files && files.length > 0 ) {
			const validFiles = [];
			const errors = [];

			Array.from( files ).forEach( ( file ) => {
				const validation = validateFile( file, accept, sizeLimit );
				if ( validation.valid ) {
					validFiles.push( file );
				} else {
					errors.push( `${ file.name }: ${ validation.error }` );
				}
			} );

			if ( errors.length > 0 ) {
				// eslint-disable-next-line no-alert
				alert( errors.join( '\n' ) );
			}

			if ( validFiles.length > 0 ) {
				handleFileChange( multiple ? validFiles : [ validFiles[ 0 ] ] );
			}

			// Reset input value to allow selecting the same file again
			if ( inputRef.current ) {
				inputRef.current.value = '';
			}
		}
	};

	const handleClick = ( e ) => {
		// Prevent event from bubbling up to parent elements
		e.stopPropagation();

		if ( inputRef.current && ! disabled ) {
			inputRef.current.click();
		}
	};

	// Clean up drag counter on unmount
	useEffect( () => {
		return () => {
			dragCounter.current = 0;
			setIsDragging( false );
		};
	}, [] );

	return (
		<div
			ref={ dropZoneRef }
			className={ cn(
				'szql-file-uploader-dropzone',
				isDragging && 'szql-is-dragover'
			) }
			onDragEnter={ handleDragEnter }
			onDragOver={ handleDragOver }
			onDragLeave={ handleDragLeave }
			onDrop={ handleDrop }
			onClick={ handleClick }
			role="button"
			tabIndex={ disabled ? -1 : 0 }
			onKeyDown={ ( e ) =>
				! disabled && e.key === 'Enter' && handleClick( e )
			}
			aria-disabled={ disabled }
		>
			<div className="szql-file-uploader-content">
				<Icon
					className="szql-file-uploader-icon"
					name="download"
					width="48px"
					height="48px"
				/>
				<div>
					<div className="szql-file-uploader-label">
						{ isDragging ? dragOverLabel : label }
					</div>
					<div className="szql-file-uploader-subtitle">
						{ subtitle }
					</div>
				</div>
				<div className="szql-file-uploader-or">
					{ __( 'OR', 'syzenlabs-quantity-limits' ) }
				</div>
				<Button __next40pxDefaultSize variant="primary">
					{ __( 'Browse Files', 'syzenlabs-quantity-limits' ) }
				</Button>
			</div>
			<input
				ref={ inputRef }
				type="file"
				className="szql-file-uploader-input"
				multiple={ multiple }
				accept={ accept }
				onChange={ handleInputChange }
				disabled={ disabled }
				tabIndex="-1"
				aria-hidden="true"
			/>
		</div>
	);
}

function FileUploaderPreview( {
	uploadText = __( 'Continue to upload', 'syzenlabs-quantity-limits' ),
	onUpload,
} ) {
	const { files, multiple } = useFileUploaderContext();
	const modifiedFormat = multiple ? files : [ files ];
	return (
		<div className="szql-file-uploader-preview-component">
			<div className="szql-file-uploader-preview-items">
				{ modifiedFormat.map( ( file ) => (
					<div
						key={ file.name }
						className="szql-file-uploader-preview-item"
					>
						<Icon
							name="paper"
							width="20px"
							height="20px"
							className="szql-file-uploader-preview-item-icon"
						/>
						<div className="szql-file-uploader-filename">
							File name { file.name }
						</div>
					</div>
				) ) }
			</div>
			<div className="szql-file-uploader-preview-item-actions">
				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ onUpload }
				>
					{ uploadText }
				</Button>
			</div>
		</div>
	);
}

function FileUploaderLoader( {
	progressText = __( 'Uploading Files…', 'syzenlabs-quantity-limits' ),
} ) {
	const { files, multiple } = useFileUploaderContext();
	const modifiedFormat = multiple ? files : [ files ];

	return (
		<div className="szql-file-uploader-loader-component">
			<div className="szql-file-uploader-loader-items">
				{ modifiedFormat.map( ( file ) => (
					<div
						key={ file.name }
						className="szql-file-uploader-loader-item"
					>
						<Icon
							name="paper"
							width="20px"
							height="20px"
							className="szql-file-uploader-loader-item-icon"
						/>
						<div className="szql-file-uploader-loader-filename">
							File name { file?.name }
						</div>
					</div>
				) ) }
			</div>

			{ /* <div className="loader"></div> */ }
			<ProgressBar />

			<div className="szql-file-uploader-loader-text">
				{ progressText }
			</div>
		</div>
	);
}

export { FileUploader };

