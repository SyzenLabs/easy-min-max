<?php // phpcs:ignore

namespace SZQL\Traits;

/**
 * Singleton trait to implement singleton pattern in classes.
 *
 * @package SZQL\Traits
 */
trait Singleton {
	/**
	 * The single instance of the class.
	 *
	 * @var static|null
	 */
	private static $instance = null;

	/**
	 * Constructor.
	 */
	protected function __construct() {}

	/**
	 * Get the single instance of the class.
	 *
	 * @return static
	 */
	final public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	/**
	 * Prevent cloning.
	 */
	private function __clone() {}
}
