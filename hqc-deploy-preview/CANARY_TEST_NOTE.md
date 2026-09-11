# HQC canary intake smoke-test note

The upload and manual-entry smoke paths must remain independent browser contexts. Once a quote file has been selected and the `Analyse my quote` action is enabled, the upload path must not attempt the manual-entry fallback. The manual path should be exercised from a fresh context.

If Playwright's actionability click on `#hqc-enter-manual` hangs after the element is already visible, enabled and stable, use a DOM click (`locator.evaluate(el => el.click())`) for this test and keep the observable assertion that editable manual-entry fields increase afterwards. This avoids treating a Playwright actionability timeout as a product failure while still verifying the actual fallback behavior.
