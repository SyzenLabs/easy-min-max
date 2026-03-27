import { Pro } from '@/components/ui';

function ConditionGroup( { pro = false, children, ...props } ) {
	return (
		<div className="eamm-condition-group-component" { ...props }>
			{ pro && <Pro className="eamm-condition-group-pro" /> }
			{ children }
		</div>
	);
}

export { ConditionGroup };
