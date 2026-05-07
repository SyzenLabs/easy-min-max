=== Easy Min Max - Set Minimum/Maximum Quantity & Price Limits with Step Control for WooCommerce ===
Contributors: f00d, syzenlabs
Tags: minmax, quantity, price, product restrictions
Requires at least: 6.4
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv3
License URI: http://www.gnu.org/licenses/gpl-3.0.html

Set minimum and maximum quantity and price rules for WooCommerce products with flexible conditions and storefront validation.

== Description ==

Easy Min Max helps you control how customers buy products in WooCommerce.

Create publishable rules that enforce minimum quantity, maximum quantity, step quantity, initial quantity, fixed quantity, minimum price, and maximum price. Step and quantity fields can also use decimal values such as 0.5 or 0.25 when your products need fractional purchase increments. Each rule can be targeted with flexible condition groups, so you can apply restrictions only when they are relevant.

The plugin validates rules on product pages, in the cart, during checkout, and through WooCommerce Store API requests. That keeps the same buying restrictions active across classic and block-based flows.

== Key Features ==

* Set minimum and maximum quantity per matching rule
* Set minimum and maximum price thresholds
* Define integer or decimal step quantity increments
* Prefill an initial quantity on product pages
* Lock matching products to a fixed quantity
* Disable minimum quantity when stock falls below the configured minimum
* Create custom validation messages with placeholders such as `[min_quantity]`, `[max_quantity]`, `[min_price]`, and `[max_price]`
* Target rules with condition groups using AND within a group and OR between groups
* Validate add to cart, cart updates, checkout, and Store API quantity constraints
* Manage rules from a dedicated WooCommerce admin interface

== Flexible Rule Conditions ==

Easy Min Max supports a broad set of targeting conditions so you can apply rules only when they should run.

You can build rules based on:

* Cart values such as quantity, total, subtotal, weight, coupons, and dimensions
* Product data such as product, category, tag, shipping class, quantity, price, total, weight, and dimensions
* Customer data such as user, role, email, phone, order history, and spending
* Location data such as country, state, city, and postcode
* Time-based checks such as weekday and time window
* Product attributes when attribute data is available

== Storefront Behavior ==

When a published rule matches, Easy Min Max adjusts WooCommerce quantity handling and validation for the relevant products.

Typical use cases include:

* Require customers to buy at least 6 units of selected products
* Limit specific products to a maximum of 2 per order
* Sell an item only in packs of 5 using step quantity or fixed quantity
* Sell measured or fractional products in increments such as 0.5 or 0.25
* Enforce a minimum or maximum product price threshold before purchase
* Apply different restrictions for specific categories, user roles, or locations

== Installation ==

= Minimum Requirements =

* WordPress 6.4 or greater
* WooCommerce installed and active
* PHP 7.4 or greater
* MySQL 5.6 or greater

= Automatic installation =

1. Go to Plugins > Add New in your WordPress admin.
2. Search for "Easy Min Max".
3. Install and activate the plugin.
4. Make sure WooCommerce is active.

= Manual installation =

1. Upload the plugin folder to `/wp-content/plugins/`.
2. Activate Easy Min Max from the Plugins screen.
3. Ensure WooCommerce is active before configuring rules.

== Frequently Asked Questions ==

= Does Easy Min Max work only for quantity rules? =

No. You can create both quantity-based and price-based restrictions for matching products.

= Can I target rules to specific products or categories? =

Yes. Rules can target products, categories, tags, shipping classes, cart data, customer data, locations, weekdays, time ranges, and more.

= Are multiple conditions supported? =

Yes. Each condition group uses AND logic, and multiple groups use OR logic.

= Does the plugin validate cart and checkout changes too? =

Yes. Validation is applied on add to cart, cart updates, checkout, and WooCommerce Store API quantity handling.

= What happens if WooCommerce is not active? =

The plugin does not load its main functionality until WooCommerce is available.

== Screenshots ==

1. Minimum and maximum quantity/price settings.
2. Advanced Conditions

== Changelog ==

= 1.0.0 - 07 May 2026 =
* Initial release.
