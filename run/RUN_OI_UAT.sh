#!/bin/bash
export BASE_URL=https://oi-uat.tradebeyond.com
: "${CBX_USERNAME:?Set CBX_USERNAME before running this script}"
: "${CBX_PASSWORD:?Set CBX_PASSWORD before running this script}"
export CBX_USERNAME
export CBX_PASSWORD
npx playwright test
