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
	'Available placeholders: [current_quantity], [min_quantity], [max_quantity], [min_price], [max_price], [product_name], [step_quantity], [inputed_quantity], [variation_name], [fixed_quanitity].',
	'syzenlabs-quantity-limits'
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
						{ __(
							'Validation Messages',
							'syzenlabs-quantity-limits'
						) }
					</Heading>
					<Tooltip
						text={ __(
							'Customize the notices shown when customers break a quantity or price rule.',
							'syzenlabs-quantity-limits'
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
							'syzenlabs-quantity-limits'
						) }
						value={ rulesForm.minQuantityMessage }
						help={ messageTokenHelp }
						onChange={ handleFieldChange( 'minQuantityMessage' ) }
					/>
					<TinyEditor
						label={ __(
							'Maximum Quantity Message',
							'syzenlabs-quantity-limits'
						) }
						value={ rulesForm.maxQuantityMessage }
						help={ messageTokenHelp }
						onChange={ handleFieldChange( 'maxQuantityMessage' ) }
					/>
					<TinyEditor
						label={ __(
							'Step Quantity Message',
							'syzenlabs-quantity-limits'
						) }
						value={ rulesForm.stepQuantityMessage || '' }
						help={ messageTokenHelp }
						onChange={ handleFieldChange( 'stepQuantityMessage' ) }
					/>
					<TinyEditor
						label={ __(
							'Minimum Price Message',
							'syzenlabs-quantity-limits'
						) }
						value={ rulesForm.minPriceMessage }
						help={ messageTokenHelp }
						onChange={ handleFieldChange( 'minPriceMessage' ) }
					/>
					<TinyEditor
						label={ __(
							'Maximum Price Message',
							'syzenlabs-quantity-limits'
						) }
						value={ rulesForm.maxPriceMessage }
						help={ messageTokenHelp }
						onChange={ handleFieldChange( 'maxPriceMessage' ) }
					/>
				</div>
			</CardBody>
		</Card>
	);
}
