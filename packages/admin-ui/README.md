# BUILD AND DEPLOY

`yarn build`

upload `dist/vendure-admin` folder on S3

# DEV
`yarn dev`

# test build su DB locale:
`yarn build-dev`
`yarn serve`

# Vendure Admin UI

This is the administration interface for Vendure.

It is an Angular application built with the Angular CLI.

The UI is powered by the [Clarity Design System](https://vmware.github.io/clarity/).

## Localization

Localization of UI strings is handled by [ngx-translate](http://www.ngx-translate.com/). The translation strings should use the [ICU MessageFormat](http://userguide.icu-project.org/formatparse/messages).

Translation keys are automatically extracted by running:
```
yarn extract-translations
```
This will add any new translation keys to the default language file located in [`./src/i18n-messages/en.json`](./src/i18n-messages/en.json).

From this master translation file, other language versions can be created by copying and updating the values for the new language.
