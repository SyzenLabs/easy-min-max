<?php //phpcs:ignore
/**
 * Class Hooks
 */

namespace SZQL\Includes\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Hooks class.
 */
class Hooks {

	/**
	 * Constructor
	 */
	public function __construct() {
		// All Woo Hook Related Work goes here.
		add_filter( 'szql_get_allowed_html_tags', array( $this, 'allowed_html_tags' ), 10, 1 );
	}

	/**
	 * Set Allowed Html
	 *
	 * @param array $extras Allowed htmls.
	 *
	 * @return array
	 */
	public function allowed_html_tags( $extras = array() ) {
		$allowed = array(
			'del'      => array(),
			'ins'      => array(),
			'select'   => array(
				'multiple' => true,
				'data-*'   => true,
			),
			'option'   => array(
				'value'  => true,
				'data-*' => true,
			),
			'strong'   => array(),
			'b'        => array(),
			'input'    => array(
				'data-*'       => true,
				'type'         => true,
				'value'        => true,
				'placeholder'  => true,
				'name'         => true,
				'id'           => true,
				'min'          => true,
				'max'          => true,
				'format'       => true,
				'class'        => true,
				'step'         => true,
				'disabled'     => true,
				'readonly'     => true,
				'required'     => true,
				'maxlength'    => true,
				'minlength'    => true,
				'pattern'      => true,
				'autocomplete' => true,
				'accept'       => true,
			),
			'textarea' => array(
				'data-*'       => true,
				'type'         => true,
				'value'        => true,
				'placeholder'  => true,
				'name'         => true,
				'id'           => true,
				'min'          => true,
				'max'          => true,
				'rows'         => true,
				'format'       => true,
				'class'        => true,
				'disabled'     => true,
				'readonly'     => true,
				'required'     => true,
				'maxlength'    => true,
				'minlength'    => true,
				'pattern'      => true,
				'autocomplete' => true,
				'accept'       => true,
			),
			'svg'      => array(
				'xmlns'        => true,
				'width'        => true,
				'height'       => true,
				'viewbox'      => true,
				'fill'         => true,
				'stroke'       => true,
				'stroke-width' => true,
			),
			'g'        => array(
				'fill'            => true,
				'stroke'          => true,
				'opacity'         => true,
				'stroke-linecap'  => true,
				'stroke-linejoin' => true,
				'stroke-width'    => true,
				'clip-path'       => true,
			),
			'path'     => array(
				'd'               => true,
				'fill'            => true,
				'stroke'          => true,
				'stroke-linecap'  => true,
				'stroke-linejoin' => true,
				'stroke-width'    => true,
				'clip-rule'       => true,
			),
			'rect'     => array(
				'rx'           => true,
				'width'        => true,
				'height'       => true,
				'fill'         => true,
				'stroke'       => true,
				'stroke-width' => true,
			),
			'defs'     => array(),
			'clipPath' => array(
				'id' => true,
			),
			'style'    => array(
				'id'     => true,
				'type'   => true,
				'media'  => true,
				'title'  => true,
				'scoped' => true,
				'data-*' => true,
			),
		);

		return array_merge( wp_kses_allowed_html( 'post' ), $allowed, $extras );
	}
}
