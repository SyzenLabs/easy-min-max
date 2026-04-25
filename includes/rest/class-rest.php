<?php //phpcs:ignore
/**
 * Options Action.
 *
 * @package SYZEQL\Options
 */

namespace SYZEQL\Includes\Rest;

defined( 'ABSPATH' ) || exit;

/**
 * Rest class.
 */
class Rest {

	/**
	 * Setup class.
	 */
	public function __construct() {
		new MetaController();
		new SettingsController();
		new RulesController();
		new BuilderRest();
	}
}
