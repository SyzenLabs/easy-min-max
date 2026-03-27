import {
	PopupLayout,
	PopupLayoutBody,
	PopupLayoutHeader,
} from '@/components/layout';
import { Skeleton, SkeletonGroup, SkeletonItems } from '@/components/ui';
import { useShippingOptions } from '@/context/OptionsContext';
import { usePrompt } from '@/context/PromptContext';
import { useRuleStore } from '@/store/useRuleStore';
import {
	Button,
	__experimentalHStack as HStack,
	Icon,
	__experimentalInputControl as InputControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	Tooltip,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Fragment, useCallback, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { Conditions } from './conditions';
import { ErrorMessages } from './error-messages';
import { Rules } from './rules';
// import { newUserTour } from './tour';

function RulesAddEditHeader( { editId } ) {
	const { firePrompt } = usePrompt();
	const { state, submitRule, updateBuilder } = useRuleStore();
	const hasUnsavedChanges = state.hasUnsavedChanges;

	const rule = state.rulesForm;

	const [ showSaveMessage, setShowSaveMessage ] = useState( false );

	const confirmLeaveIfUnsaved = useCallback( async () => {
		if ( ! hasUnsavedChanges ) {
			return true;
		}

		const result = await firePrompt( {
			title: __( 'Unsaved Changes', 'easy-min-max' ),
			message: __(
				'You have unsaved changes. Are you sure you want to leave this page?',
				'easy-min-max'
			),
			type: 'warning',
			confirmText: __( 'Leave', 'easy-min-max' ),
			confirmButtonDesign: 'error',
			cancelText: __( 'Stay', 'easy-min-max' ),
		} );

		return !! result?.ok;
	}, [ firePrompt, hasUnsavedChanges ] );

	const handleExit = async () => {
		const ok = await confirmLeaveIfUnsaved();
		if ( ! ok ) {
			return;
		}
		window.location.hash = 'rules';
	};

	const handleSave = async () => {
		const resp = await submitRule( {} );
		if ( resp?.id ) {
			setShowSaveMessage( true );
			setTimeout( () => {
				setShowSaveMessage( false );
			}, 2000 );
		}
	};

	if ( state.initialLoading ) {
		return (
			<SkeletonItems justifyContent="space-between">
				<Skeleton width="10%" height="39px" />
				<Skeleton width="30%" height="39px" />
				<Skeleton width="20%" height="39px" />
			</SkeletonItems>
		);
	}

	return (
		<div className="flex flex-wrap gap-4 md:grid md:grid-cols-3">
			<HStack expanded={ false } alignment="left">
				<Button
					__next40pxDefaultSize
					icon="exit"
					variant="secondary"
					onClick={ handleExit }
				>
					{ __( 'Exit', 'easy-min-max' ) }
				</Button>
			</HStack>
			<HStack expanded={ false } alignment="center">
				<Tooltip
					text={ __(
						'Specify a name for this rule',
						'easy-min-max'
					) }
				>
					<InputControl
						__next40pxDefaultSize
						className="w-full!"
						placeholder={ __( 'Enter rule name…', 'easy-min-max' ) }
						value={ rule.title || '' }
						onChange={ ( _v ) => {
							updateBuilder( 'title', _v );
						} }
					/>
				</Tooltip>
			</HStack>
			<HStack expanded={ false } alignment="right" spacing={ 2 }>
				{ /* <DarkModeToggle /> */ }

				{ /* <AiButton /> */ }

				<ToggleGroupControl
					label={ __( 'Status', 'easy-min-max' ) }
					isBlock
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					id="eamm-publish-section"
					value={ rule.publishMode }
					onChange={ ( _v ) => updateBuilder( 'publishMode', _v ) }
					hideLabelFromVision
				>
					<ToggleGroupControlOption
						value="draft"
						label={ __( 'Draft', 'easy-min-max' ) }
					/>
					<ToggleGroupControlOption
						value="publish"
						label={ __( 'Publish', 'easy-min-max' ) }
					/>
				</ToggleGroupControl>

				<Button
					__next40pxDefaultSize
					disabled={ state.isSaving }
					isBusy={ state.isSaving }
					onClick={ handleSave }
					variant="primary"
					icon={ showSaveMessage ? <Icon icon={ check } /> : null }
					iconSize={ 32 }
				>
					{ /* eslint-disable-next-line no-nested-ternary */ }
					{ editId
						? showSaveMessage
							? __( 'Updated', 'easy-min-max' )
							: __( 'Update', 'easy-min-max' )
						: showSaveMessage
						? __( 'Saved', 'easy-min-max' )
						: __( 'Save', 'easy-min-max' ) }
				</Button>
			</HStack>
		</div>
	);
}

function ShippingMethodsAddEditBody() {
	const { state } = useRuleStore();

	if ( state.initialLoading ) {
		return (
			<SkeletonItems flexDirection="column">
				{ Array.from( { length: 5 } ).map( ( item, index ) => (
					<Fragment key={ index }>
						<Skeleton width="30%" height="28px" />
						<SkeletonGroup>
							<Skeleton width="20%" height="28px" />
							<Skeleton width="100%" height="40px" />
							<hr />
							<Skeleton width="20%" height="28px" />
							<Skeleton width="100%" height="40px" />
						</SkeletonGroup>
					</Fragment>
				) ) }
			</SkeletonItems>
		);
	}

	return (
		<VStack spacing={ 3 }>
			<Conditions />
			<Rules />
			<ErrorMessages />
		</VStack>
	);
}

export function Builder( { editId } ) {
	const { getAttributeData } = useShippingOptions();
	const {
		state,
		setInitialLoading,
		submitRule,
		getRuleById,
		resetToDefaultState,
	} = useRuleStore();

	// useEffect( () => {
	// 	if ( ! state.initialLoading ) {
	// 		newUserTour();
	// 	}
	// }, [ state.initialLoading ] );

	useEffect( () => {
		const fetchData = async () => {
			setInitialLoading( true );
			if ( ! editId ) {
				resetToDefaultState();
			}
			Promise.all( [
				getAttributeData(),
				editId && getRuleById( editId ),
			] ).finally( () => setInitialLoading( false ) );
		};
		// eslint-disable-next-line react-you-might-not-need-an-effect/no-pass-data-to-parent
		fetchData();
	}, [
		editId,
		getAttributeData,
		getRuleById,
		resetToDefaultState,
		setInitialLoading,
	] );

	// ctl + s for save
	useEffect( () => {
		const handleKeyDown = ( event ) => {
			if ( event.key === 's' && ( event.ctrlKey || event.metaKey ) ) {
				event.preventDefault();
				submitRule( { data: state.rulesForm } );
			}
		};
		window.addEventListener( 'keydown', handleKeyDown );
		return () => {
			window.removeEventListener( 'keydown', handleKeyDown );
		};
	}, [ submitRule, state.rulesForm ] );

	return (
		<PopupLayout>
			<PopupLayoutHeader>
				<RulesAddEditHeader editId={ editId } />
			</PopupLayoutHeader>
			<PopupLayoutBody>
				<ShippingMethodsAddEditBody />
			</PopupLayoutBody>
		</PopupLayout>
	);
}
