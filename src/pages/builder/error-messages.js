import { TinyEditor } from '@/components/ui/rich-text-editor';
import { useRuleStore } from '@/store/useRuleStore';
import {
	Card,
	CardBody,
	CardHeader,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	Icon,
	Tooltip,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const messageTokenHelp = __(
	'Available placeholders: [min_quantity], [max_quantity], [min_price], [max_price].',
	'easy-min-max'
);

export function ErrorMessages() {
	const {
		state: { rulesForm },
		updateBuilder,
	} = useRuleStore();

	const handleFieldChange = ( field ) => ( nextValue ) => {
		updateBuilder( field, nextValue );
	};

	return (
		<Card>
			<CardHeader>
				<HStack spacing={ 2 } expanded={ false }>
					<Heading level={ 3 }>
						{ __( 'Validation Messages', 'easy-min-max' ) }
					</Heading>
					<Tooltip
						text={ __(
							'Customize the notices shown when customers break a quantity or price rule.',
							'easy-min-max'
						) }
					>
						<span>
							<Icon icon="info-outline" />
						</span>
					</Tooltip>
				</HStack>
			</CardHeader>
			<CardBody>
				<div className="grid gap-4 md:grid-cols-2">
					<TinyEditor
						label={ __(
							'Minimum Quantity Message',
							'easy-min-max'
						) }
						value={ rulesForm.minQuantityMessage }
						help={ messageTokenHelp }
						onChange={ handleFieldChange( 'minQuantityMessage' ) }
					/>
					<TinyEditor
						label={ __(
							'Maximum Quantity Message',
							'easy-min-max'
						) }
						value={ rulesForm.maxQuantityMessage }
						help={ messageTokenHelp }
						onChange={ handleFieldChange( 'maxQuantityMessage' ) }
					/>
					<TinyEditor
						label={ __( 'Minimum Price Message', 'easy-min-max' ) }
						value={ rulesForm.minPriceMessage }
						help={ messageTokenHelp }
						onChange={ handleFieldChange( 'minPriceMessage' ) }
					/>
					<TinyEditor
						label={ __( 'Maximum Price Message', 'easy-min-max' ) }
						value={ rulesForm.maxPriceMessage }
						help={ messageTokenHelp }
						onChange={ handleFieldChange( 'maxPriceMessage' ) }
					/>
				</div>
			</CardBody>
		</Card>
	);
}
