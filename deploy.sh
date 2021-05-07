#!/bin/bash

# Pushes the app for deployment, then tags it using sentry
git push

# Sets the app version from the package.json
REACT_APP_VERSION=$(node -p 'require("./package.json").version')

npm run build

sentry-cli releases new -p dota-hero-hunt $REACT_APP_VERSION
sentry-cli releases set-commits --auto $REACT_APP_VERSION
sentry-cli releases -p dota-hero-hunt files $REACT_APP_VERSION upload-sourcemaps --no-rewrite ./build/static/js/ --url-prefix "~/static/js"
sentry-cli releases finalize $REACT_APP_VERSION
sentry-cli releases -p dota-hero-hunt deploys $REACT_APP_VERSION new -e production