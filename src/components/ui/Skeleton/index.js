import { cn } from '@/utils';

// import './style.scss';

function SkeletonGroup( {
	width = '100%',
	height = '100%',
	className = '',
	children,
	...props
} ) {
	return (
		<div
			className={ cn( 'syzeql-skeleton-group-container', className ) }
			style={ { width, height } }
			{ ...props }
		>
			{ children }
		</div>
	);
}

function SkeletonItems( {
	width = '100%',
	justifyContent = 'left',
	alignItems = 'left',
	flexDirection = 'row',
	gap = '1rem',
	className = '',
	children,
	...props
} ) {
	return (
		<div
			className={ cn( 'syzeql-skeleton-items-container', className ) }
			style={ { width, justifyContent, alignItems, flexDirection, gap } }
			{ ...props }
		>
			{ children }
		</div>
	);
}

function Skeleton( {
	width = '100%',
	height = '50px',
	className = '',
	children,
	...props
} ) {
	return (
		<div
			className={ cn( 'syzeql-skeleton-container', className ) }
			style={ { width, height } }
			{ ...props }
		>
			{ children }
		</div>
	);
}

export { Skeleton, SkeletonGroup, SkeletonItems };

