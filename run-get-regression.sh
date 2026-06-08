#!/bin/bash

set -e

echo "========================================"
echo "LOGIN ONCE"
echo "========================================"

npx playwright test --project=setup

echo ""
echo "========================================"
echo "RUNNING ALL GET MODULES"
echo "========================================"

npx playwright test \
tests/e2e/item.spec.ts \
tests/e2e/vendor.spec.ts \
tests/e2e/factory.spec.ts \
tests/e2e/customer.spec.ts \
tests/e2e/forwarder.spec.ts \
tests/e2e/vendor-po.spec.ts \
tests/e2e/shipment-advice.spec.ts \
tests/e2e/factory-audit.spec.ts \
tests/e2e/inspection-booking.spec.ts \
tests/e2e/inspection-report.spec.ts \
--project=chromium --workers=1 --no-deps \
--headed

echo ""
echo "========================================"
echo "ALL GET MODULES PASSED"
echo "========================================"
