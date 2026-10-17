#!/usr/bin/env python3
"""
Regression test: Data Inspector working dataset (non-destructive
Transform/Query for CSV/XML input).

Covers the bug where clicking "Transform" or "Query" on a field from Data
Inspector, when the current input was CSV or XML, silently overwrote
#input with a converted JSON copy — destroying the user's original source
data. The fix introduces a separate "working dataset" (see
public/lib/working-dataset.js) that Transform Builder and JSONPath read
from instead, while #input itself is never touched.

This is a DOM/UI-wiring test, matching the existing
tests/test_api_playground_response_actions.py in structure and tooling.

Requirements:
    pip install playwright && playwright install chromium

Run from the repo root (recast-worker/):
    python3 tests/test_data_inspector_working_dataset.py
"""
import sys
import os
from playwright.sync_api import sync_playwright

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_HTML_URL = 'file://' + os.path.join(REPO_ROOT, 'public', 'index.html')

failures = []


def check(label, condition):
    status = 'PASS' if condition else 'FAIL'
    print(f'  [{status}] {label}')
    if not condition:
        failures.append(label)


def click_field_action(page, selector):
    page.eval_on_selector(selector, "el => el.scrollIntoView({block: 'center'})")
    page.wait_for_timeout(100)
    page.click(selector)


def open_inspector_with(page, text):
    page.fill('#input', text)
    page.wait_for_timeout(150)
    is_open = page.eval_on_selector('#dataInspectorPanel', 'el => el.classList.contains("show")')
    if not is_open:
        page.click('#dataInspectorToggleBtn')
    page.wait_for_timeout(700)


def test_csv_transform_acceptance(page, console_errors):
    print('\nAcceptance test: CSV -> Data Inspector -> Transform')
    csv_input = 'id,name\n1,John\n2,Sarah'
    open_inspector_with(page, csv_input)

    click_field_action(page, '[data-transform="name"]')
    page.wait_for_timeout(600)

    check('Transform Builder opens', page.eval_on_selector('#transformBuilderPanel', 'el => el.classList.contains("show")'))
    check('original input remains CSV, byte-for-byte',
          page.eval_on_selector('#input', 'el => el.value') == csv_input)

    tb_output = page.eval_on_selector('#tbOutput', 'el => el.value')
    check('Transform Builder operates on the equivalent JSON', '"name": "John"' in tb_output and '"name": "Sarah"' in tb_output)

    banner_text = page.eval_on_selector('#tbWorkingBannerText', 'el => el.textContent')
    check('a clear indicator shows a derived JSON view is in use', 'CSV' in banner_text)

    page.click('#tbCloseBtn')
    page.wait_for_timeout(300)
    check('closing Transform Builder leaves the original CSV intact',
          page.eval_on_selector('#input', 'el => el.value') == csv_input)

    check('no JS errors during this flow', len(console_errors) == 0)


def test_xml_transform_acceptance(page, console_errors):
    print('\nAcceptance test: XML -> Data Inspector -> Transform (repeated with XML)')
    xml_input = '<?xml version="1.0"?><root><id>1</id><name>John</name></root>'
    open_inspector_with(page, xml_input)

    click_field_action(page, '[data-transform="root.name"]')
    page.wait_for_timeout(600)

    check('Transform Builder opens', page.eval_on_selector('#transformBuilderPanel', 'el => el.classList.contains("show")'))
    check('original input remains XML, byte-for-byte',
          page.eval_on_selector('#input', 'el => el.value') == xml_input)

    tb_output = page.eval_on_selector('#tbOutput', 'el => el.value')
    check('Transform Builder operates on the equivalent JSON', 'John' in tb_output)

    banner_text = page.eval_on_selector('#tbWorkingBannerText', 'el => el.textContent')
    check('a clear indicator shows a derived JSON view is in use', 'XML' in banner_text)

    page.click('#tbCloseBtn')
    page.wait_for_timeout(300)
    check('closing Transform Builder leaves the original XML intact',
          page.eval_on_selector('#input', 'el => el.value') == xml_input)

    check('no JS errors during this flow', len(console_errors) == 0)


def test_query_action_non_destructive(page, console_errors):
    print('\nData Inspector -> Query, for CSV input')
    csv_input = 'id,name\n1,John\n2,Sarah'
    open_inspector_with(page, csv_input)

    click_field_action(page, '[data-query="name"]')
    page.wait_for_timeout(500)

    check('mode switches to JSONPath', page.eval_on_selector('.mode-chip.active', 'el => el.dataset.mode') == 'jsonPath')
    check('original input remains CSV, byte-for-byte',
          page.eval_on_selector('#input', 'el => el.value') == csv_input)
    check('JSONPath working-dataset banner is visible',
          page.eval_on_selector('#jsonPathWorkingBanner', 'el => getComputedStyle(el).display') != 'none')

    check('no JS errors during this flow', len(console_errors) == 0)


def test_use_original_input_button(page, console_errors):
    print('\n"Use original input instead" explicitly clears the working dataset')
    csv_input = 'id,name\n1,John\n2,Sarah'
    open_inspector_with(page, csv_input)
    click_field_action(page, '[data-transform="name"]')
    page.wait_for_timeout(600)

    page.click('#tbUseOriginalBtn')
    page.wait_for_timeout(300)
    check('working dataset banner hides after clicking it',
          page.eval_on_selector('#tbWorkingBanner', 'el => getComputedStyle(el).display') == 'none')
    check('working dataset is no longer active',
          not page.evaluate('() => window.RecastWorkingDataset.isActive()'))
    check('original CSV is still intact',
          page.eval_on_selector('#input', 'el => el.value') == csv_input)

    check('no JS errors during this flow', len(console_errors) == 0)


def test_existing_json_behavior_unchanged(page, console_errors):
    print('\nExisting JSON behaviour is unchanged (no working dataset involved)')
    json_input = '[{"id":1,"name":"John"},{"id":2,"name":"Sarah"}]'
    open_inspector_with(page, json_input)

    click_field_action(page, '[data-transform="name"]')
    page.wait_for_timeout(600)

    check('no working-dataset banner appears for JSON input',
          page.eval_on_selector('#tbWorkingBanner', 'el => getComputedStyle(el).display') == 'none')
    check('working dataset was never activated',
          not page.evaluate('() => window.RecastWorkingDataset.isActive()'))
    check('#input is exactly the original JSON (identical object, not a re-copy)',
          page.eval_on_selector('#input', 'el => el.value') == json_input)

    tb_output = page.eval_on_selector('#tbOutput', 'el => el.value')
    check('Transform Builder produced correct output directly from #input',
          '"name": "John"' in tb_output and '"name": "Sarah"' in tb_output)

    check('no JS errors during this flow', len(console_errors) == 0)


def test_pipeline_aware_discovery_still_works(page, console_errors):
    print('\nRegression guard: pipeline-aware field discovery (prior fix) still works')
    page.fill('#input', '[{"first":"John","last":"Smith","age":"42"}]')
    page.wait_for_timeout(150)
    is_open = page.eval_on_selector('#transformBuilderPanel', 'el => el.classList.contains("show")')
    if not is_open:
        page.click('#transformBuilderToggleBtn')
    page.wait_for_timeout(300)
    page.click('#tbResetBtn')  # clear any steps left over from an earlier test in this same session
    page.wait_for_timeout(400)

    page.select_option('#tbAddStep', 'rename')
    page.wait_for_timeout(500)
    page.select_option('#tbStepForm select[data-field-picker]', 'first')
    page.fill('#tbInputTo', 'first_name')
    page.click('#tbFormSubmit')
    page.wait_for_timeout(400)

    page.select_option('#tbAddStep', 'rename')
    page.wait_for_timeout(500)
    field_options = page.eval_on_selector_all('#tbStepForm select[data-field-picker] option', 'els => els.map(e => e.value)')
    check('step 2 sees first_name (renamed by step 1), not first', 'first_name' in field_options and 'first' not in field_options)

    check('no JS errors during this flow', len(console_errors) == 0)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        console_errors = []
        page = browser.new_page(viewport={'width': 1400, 'height': 900})
        page.on('pageerror', lambda err: console_errors.append(str(err)))
        page.goto(INDEX_HTML_URL)
        page.wait_for_timeout(300)

        test_csv_transform_acceptance(page, console_errors)
        test_xml_transform_acceptance(page, console_errors)
        test_query_action_non_destructive(page, console_errors)
        test_use_original_input_button(page, console_errors)
        test_existing_json_behavior_unchanged(page, console_errors)
        test_pipeline_aware_discovery_still_works(page, console_errors)

        browser.close()

    print(f'\n{"=" * 50}')
    if failures:
        print(f'{len(failures)} check(s) FAILED:')
        for f in failures:
            print(f'  - {f}')
        sys.exit(1)
    else:
        print('All checks passed.')
        sys.exit(0)


if __name__ == '__main__':
    main()
