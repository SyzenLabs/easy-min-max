# Easy Min Max Project Guidelines

## Architecture

-   This plugin mixes a PHP WooCommerce backend with a React admin app and a small frontend runtime.
-   Start from [syzenlabs-quantity-limits.php](\app\public\wp-content\plugins\syzenlabs-quantity-limits\syzenlabs-quantity-limits.php): it bootstraps the autoloader and calls `Init::load()`.
-   Keep PHP business logic in `includes/`, REST controllers in `includes/rest/`, storefront behavior in `includes/frontend/`, and shared utility code in `includes/utils/`.
-   Edit source files in `src/` and `src/scss/`; treat `assets/` as generated build output unless the task is explicitly about packaged assets.

## Build And Validation

-   Run commands from the plugin root: `c:\Users\hp\Local Sites\shippingrule\app\public\wp-content\plugins\syzenlabs-quantity-limits`.
-   Use `npm install` or `npm run setup` for initial setup.
-   Use `npm run dev` for normal development, `npm run start` for JS-only watch mode, and `gulp watch` when only SCSS/Tailwind output matters.
-   Use `npm run build` for a production package and `npm run release` only after updating the version and changelog.
-   Use `npm run lint` and `npm run format` for changes under `src/`.
-   There is no dedicated automated test suite in this plugin. After edits, prefer the narrowest available validation: lint/format for frontend changes, then manual verification in the local WordPress + WooCommerce site.

## Conventions

-   PHP classes use the `SYZEQL\` namespace and are autoloaded from kebab-case files such as `includes/class-init.php` and `includes/frontend/class-quantity-ui.php`.
-   Reuse `traits/trait-singleton.php` for long-lived service classes instead of inventing new lifecycle patterns.
-   Rule and settings data live in WordPress options as JSON through `includes/class-db.php`; do not introduce new storage patterns unless the task requires it.
-   React source can import from `@/` because the alias maps to `src/`.
-   Follow existing REST patterns: register routes in `includes/rest/`, gate admin operations with the existing permission helpers, and return `WP_Error` for request failures.

## Pitfalls

-   Versioning is strict: keep `package.json`, the plugin header/version constant in `syzenlabs-quantity-limits.php`, and `readme.txt` in sync. Use `scripts/ver-updater.js` and add the changelog entry before running `npm run release`.
-   The admin UI depends on generated asset metadata such as `assets/js/syzeql-backend.asset.php`; if webpack output is missing, the admin app will not enqueue correctly.
-   REST endpoints use both `syzeql/v1` and `syzenlabs-quantity-limits/v1`. Check the existing namespace before adding or consuming endpoints.

## Key References

-   See `README.md` for the rule data shape used by the builder.
-   See `package.json` for the canonical script list.
-   See `scripts/ver-updater.js` for release/version synchronization rules.
