const importAll = ( r ) => {
	return r.keys().reduce( ( acc, curr ) => {
		// remove './' prefix and '.svg' from file name
		const key = curr.replace( './', '' ).replace( '.svg', '' );
		return {
			...acc,
			[ key ]: r( curr ).default || r( curr ),
		};
	}, {} );
};

const icons = importAll( require.context( './', false, /\.svg$/ ) );

export default icons;
