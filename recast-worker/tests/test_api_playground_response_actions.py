#!/usr/bin/env python3
"""
Regression test: API Playground "Use response in" actions.

Covers the bug fix where "Use response in -> Inspect" incorrectly opened
the Schema/Graph view instead of the Data Inspector panel. Also
re-verifies the other 5 response actions (Transform, Query, Validate,
Compare, Create Recipe) so a future change to this handler can't silently
regress one while fixing another.

This is a DOM/UI-wiring test (which button click opens which panel), not
pure logic — it can't be expressed as a Node unit test the way
src/*.test.mjs can, so it's a standalone Playwright script instead. It
tests public/index.html directly via file://, matching how every other UI
feature in this codebase has been manually verified during development.

Requirements:
    pip install playwright && playwright install chromium

Run from the repo root (recast-worker/):
    python3 tests/test_api_playground_response_actions.py

Exits 0 on success, 1 on any failed assertion, and prints a line per check.
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


def run_playground(page, mode, input_text):
    page.eval_on_selector('#api', "el => el.scrollIntoView()")
    page.wait_for_timeout(150)
    page.select_option('#playgroundMode', mode)
    page.fill('#playgroundInput', input_text)
    page.wait_for_timeout(150)
    page.click('#playgroundRunBtn')
    page.wait_for_timeout(300)
    return page.eval_on_selector('#playgroundOutput', 'el => el.textContent')


def test_inspect_action(page, console_errors):
    print('\nUse response in -> Inspect')
    response = run_playground(
        page, 'csv2json',
        'id,name,email\n1,Ada,ada@x.com\n1,Grace,ok@y.com\n1,Alan,ok2@z.com'
    )
    page.click('[data-response-action="inspect"]')
    page.wait_for_timeout(900)

    input_val = page.eval_on_selector('#input', 'el => el.value')
    check('response copied into #input', input_val == response)
    check('response content is byte-for-byte unaltered', input_val == response)

    di_open = page.eval_on_selector('#dataInspectorPanel', 'el => el.classList.contains("show")')
    check('Data Inspector panel is open', di_open)

    graph_active = page.eval_on_selector('#inputGraphBtn', 'el => el.classList.contains("active")')
    check('graph view was NOT opened', not graph_active)

    active_group = page.eval_on_selector('.mode-group-btn.active', 'el => el ? el.dataset.group : null')
    check('mode group was NOT switched to schema', active_group != 'schema')

    summary_text = page.eval_on_selector('#diSummary', 'el => el.textContent')
    check('record count shown', '3' in summary_text and 'Records' in summary_text)
    check('field count shown', 'Fields' in summary_text)
    check('estimated size shown', 'Estimated size' in summary_text)
    check('nesting depth shown', 'Nesting depth' in summary_text)

    warnings_text = page.eval_on_selector('#diWarnings', 'el => el.textContent')
    check('quality warning (duplicate id) detected automatically', 'duplicate' in warnings_text.lower())

    field_rows = page.eval_on_selector_all('#diFieldsBody tr', 'els => els.length')
    check('field profile rows rendered', field_rows == 3)

    action_buttons = set(page.eval_on_selector_all('.di-field-actions button', 'els => els.map(e => e.textContent)'))
    check('Transform/Query/Copy field actions present', {'Transform', 'Query', 'Copy'}.issubset(action_buttons))

    panel_top = page.eval_on_selector('#dataInspectorPanel', 'el => el.getBoundingClientRect().top')
    check('page scrolled to the Data Inspector panel', abs(panel_top) < 5)

    check('no JS errors during this flow', len(console_errors) == 0)


def test_other_actions_unaffected(page, console_errors):
    print('\nOther "Use response in" actions (regression guard)')

    run_playground(page, 'json2csv', '[{"id":1,"name":"Ada"}]')
    page.click('[data-response-action="transform"]')
    page.wait_for_timeout(500)
    check('Transform Response still opens Transform Builder',
          page.eval_on_selector('#transformBuilderPanel', 'el => el.classList.contains("show")'))

    run_playground(page, 'json2csv', '[{"id":1,"name":"Ada"}]')
    page.click('[data-response-action="query"]')
    page.wait_for_timeout(300)
    check('Query Response still opens JSONPath',
          page.eval_on_selector('.mode-chip.active', 'el => el.dataset.mode') == 'jsonPath')

    run_playground(page, 'json2csv', '[{"id":1,"name":"Ada"}]')
    page.click('[data-response-action="validate"]')
    page.wait_for_timeout(300)
    check('Validate Response still opens a validator',
          page.eval_on_selector('.mode-chip.active', 'el => el.dataset.mode') in ('validateJson', 'validateXml'))

    run_playground(page, 'json2xml', '[{"id":1,"name":"Ada"}]')
    page.click('[data-response-action="validate"]')
    page.wait_for_timeout(300)
    check('Validate Response picks validateXml for an XML response',
          page.eval_on_selector('.mode-chip.active', 'el => el.dataset.mode') == 'validateXml')

    run_playground(page, 'json2csv', '[{"id":1,"name":"Ada"}]')
    page.click('[data-response-action="compare"]')
    page.wait_for_timeout(300)
    check('Compare Response still opens a diff mode',
          page.eval_on_selector('.mode-chip.active', 'el => el.dataset.mode') in ('diffJson', 'diffXml'))

    run_playground(page, 'json2csv', '[{"id":1,"name":"Ada"}]')
    page.click('[data-response-action="recipe"]')
    page.wait_for_timeout(500)
    check('Create Recipe still opens Recipe Builder 2.0',
          page.eval_on_selector('#recipeBuilder2Panel', 'el => el.classList.contains("show")'))

    check('no JS errors during this flow', len(console_errors) == 0)


def test_normal_workbench_inspect_unchanged(page, console_errors):
    print('\nNormal workbench "Inspect" nav item (must stay unchanged)')
    page.click('.nav-group[data-nav-group="tools"] .nav-group-btn')
    page.wait_for_timeout(150)
    page.click('.nav-dropdown-item[data-group="schema"]')
    page.wait_for_timeout(300)
    active_group = page.eval_on_selector('.mode-group-btn.active', 'el => el.dataset.group')
    check('nav Inspect item still switches to the schema/types group', active_group == 'schema')
    check('no JS errors during this flow', len(console_errors) == 0)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        console_errors = []
        page = browser.new_page(viewport={'width': 1400, 'height': 900})
        page.on('pageerror', lambda err: console_errors.append(str(err)))
        page.goto(INDEX_HTML_URL)
        page.wait_for_timeout(300)

        test_inspect_action(page, console_errors)
        test_other_actions_unaffected(page, console_errors)
        test_normal_workbench_inspect_unchanged(page, console_errors)

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
