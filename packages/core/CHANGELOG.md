# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 1.1.0-alpha.0 (2019-05-21)


### Bug Fixes

* **core:** Fix type error (missing isPrivate property) ([4d1cd65](https://github.com/vendure-ecommerce/vendure/commit/4d1cd65))
* Enable noImplicitAny on core and fix all tsc errors ([e24b33e](https://github.com/vendure-ecommerce/vendure/commit/e24b33e))
* **core:** Add missing timestamp fields to Asset GraphQL type ([1c543db](https://github.com/vendure-ecommerce/vendure/commit/1c543db))
* **core:** Add property resolver for Collection.featuredAsset ([cd367a7](https://github.com/vendure-ecommerce/vendure/commit/cd367a7))
* **core:** Check existence of ProductVariant before updating ([fe5eedd](https://github.com/vendure-ecommerce/vendure/commit/fe5eedd))
* **core:** Correctly intercept top-level Assets ([d767a9d](https://github.com/vendure-ecommerce/vendure/commit/d767a9d))
* **core:** Correctly update country in customer address ([75f9492](https://github.com/vendure-ecommerce/vendure/commit/75f9492))
* **core:** Fix bad import paths ([e126d2e](https://github.com/vendure-ecommerce/vendure/commit/e126d2e))
* **core:** Fix bug which created new address for each order placed ([8703e25](https://github.com/vendure-ecommerce/vendure/commit/8703e25))
* **core:** Fix error when updating variant stock level ([57c5499](https://github.com/vendure-ecommerce/vendure/commit/57c5499))
* Fix @Ctx() decorator with latest Nest version ([16508ee](https://github.com/vendure-ecommerce/vendure/commit/16508ee))
* Update @nestjs/graphql to fix missing context issue ([b048295](https://github.com/vendure-ecommerce/vendure/commit/b048295))
* **core:** Fix reordering of collections ([75f8858](https://github.com/vendure-ecommerce/vendure/commit/75f8858)), closes [#75](https://github.com/vendure-ecommerce/vendure/issues/75)
* **core:** Fix search.facetValues resolver error ([ecfbf56](https://github.com/vendure-ecommerce/vendure/commit/ecfbf56))
* **core:** Implement property resolver for Collection.children ([e5f614e](https://github.com/vendure-ecommerce/vendure/commit/e5f614e))
* **core:** Prevent race conditions when updating search index ([8872a94](https://github.com/vendure-ecommerce/vendure/commit/8872a94))
* **core:** Typo in mock product data ([cf0f842](https://github.com/vendure-ecommerce/vendure/commit/cf0f842))
* **docs:** Fix links to index files ([b3ad8c9](https://github.com/vendure-ecommerce/vendure/commit/b3ad8c9))


### Features

* create @vendure/create package ([7c63386](https://github.com/vendure-ecommerce/vendure/commit/7c63386)), closes [#84](https://github.com/vendure-ecommerce/vendure/issues/84)
* Extract AdminUiPlugin into own package ([97b45e5](https://github.com/vendure-ecommerce/vendure/commit/97b45e5))
* **core:** Correctly handle disabled field for grouped search ([56cad72](https://github.com/vendure-ecommerce/vendure/commit/56cad72)), closes [#62](https://github.com/vendure-ecommerce/vendure/issues/62)
* Get data population working for the dev-server package ([592b1ee](https://github.com/vendure-ecommerce/vendure/commit/592b1ee))
* **admin-ui:** Add ApiType to RequestContext ([9b55c17](https://github.com/vendure-ecommerce/vendure/commit/9b55c17))
* **admin-ui:** Link up product filters with url ([8aab908](https://github.com/vendure-ecommerce/vendure/commit/8aab908))
* **core:** Add "enabled" field to Product & ProductVariant ([a877853](https://github.com/vendure-ecommerce/vendure/commit/a877853)), closes [#62](https://github.com/vendure-ecommerce/vendure/issues/62)
* **core:** Add "enabled" field to search index, add & fix e2e tests ([fcd3086](https://github.com/vendure-ecommerce/vendure/commit/fcd3086)), closes [#62](https://github.com/vendure-ecommerce/vendure/issues/62)
* **core:** Add endpoint logging on bootstrap ([d791f32](https://github.com/vendure-ecommerce/vendure/commit/d791f32))
* **core:** Add isPrivate flag to Collection ([848c8b4](https://github.com/vendure-ecommerce/vendure/commit/848c8b4)), closes [#71](https://github.com/vendure-ecommerce/vendure/issues/71)
* **core:** Create entities & fields needed for stock control ([aace38f](https://github.com/vendure-ecommerce/vendure/commit/aace38f)), closes [#81](https://github.com/vendure-ecommerce/vendure/issues/81)
* **core:** Create Logger service ([65445cb](https://github.com/vendure-ecommerce/vendure/commit/65445cb)), closes [#86](https://github.com/vendure-ecommerce/vendure/issues/86)
* **core:** Create Sale stock movements when Order is completed ([e0a0441](https://github.com/vendure-ecommerce/vendure/commit/e0a0441)), closes [#81](https://github.com/vendure-ecommerce/vendure/issues/81)
* **core:** Create StockMovements when variant stock changed ([f8521db](https://github.com/vendure-ecommerce/vendure/commit/f8521db)), closes [#81](https://github.com/vendure-ecommerce/vendure/issues/81)
* **core:** Create workflow for updating a Customer email address ([f8065de](https://github.com/vendure-ecommerce/vendure/commit/f8065de)), closes [#87](https://github.com/vendure-ecommerce/vendure/issues/87)
* **core:** Export populate-collections CLI command ([0aef0b7](https://github.com/vendure-ecommerce/vendure/commit/0aef0b7))
* **core:** Expose init CLI command ([4d5f0d9](https://github.com/vendure-ecommerce/vendure/commit/4d5f0d9))
* **core:** Implement CollectionFilter based on ProductVariant name ([18549c7](https://github.com/vendure-ecommerce/vendure/commit/18549c7)), closes [#71](https://github.com/vendure-ecommerce/vendure/issues/71)
* **core:** Implement private Facets ([b6c3240](https://github.com/vendure-ecommerce/vendure/commit/b6c3240)), closes [#80](https://github.com/vendure-ecommerce/vendure/issues/80)
* **core:** Implement tax on shipping ([1b13aa3](https://github.com/vendure-ecommerce/vendure/commit/1b13aa3)), closes [#54](https://github.com/vendure-ecommerce/vendure/issues/54)
* Move default email plugin to own package ([3d5a7e6](https://github.com/vendure-ecommerce/vendure/commit/3d5a7e6))
* Move DefaultAssetServer to own package ([96abd13](https://github.com/vendure-ecommerce/vendure/commit/96abd13))
* **core:** Improved logging messages on bootstrap ([9efada8](https://github.com/vendure-ecommerce/vendure/commit/9efada8)), closes [#86](https://github.com/vendure-ecommerce/vendure/issues/86)
* **core:** Publish events on login/logout ([5ab83da](https://github.com/vendure-ecommerce/vendure/commit/5ab83da)), closes [#53](https://github.com/vendure-ecommerce/vendure/issues/53)
* **core:** Richer mock data ([089282e](https://github.com/vendure-ecommerce/vendure/commit/089282e)), closes [#96](https://github.com/vendure-ecommerce/vendure/issues/96)
* **core:** Update import CSV format to include stock fields ([3f732ab](https://github.com/vendure-ecommerce/vendure/commit/3f732ab)), closes [#81](https://github.com/vendure-ecommerce/vendure/issues/81)
* **core:** Use Logger to log TypeORM logs ([5966bec](https://github.com/vendure-ecommerce/vendure/commit/5966bec)), closes [#86](https://github.com/vendure-ecommerce/vendure/issues/86)
* **docs:** Clean up various docs ([f65790d](https://github.com/vendure-ecommerce/vendure/commit/f65790d)), closes [#89](https://github.com/vendure-ecommerce/vendure/issues/89)
* **email-plugin:** Generate test emails from dev mailbox ([35105ec](https://github.com/vendure-ecommerce/vendure/commit/35105ec))
