#!/usr/bin/env python3
"""
Regression test: diff tool inline highlighting and click-to-jump.

Covers the click-to-jump interaction across all three diff tools (JSON,
CSV, XML) — clicking a summary/compare-table row scrolls to and flashes
the matching highlighted line in the source panel — plus a specific bug
fix: a diff path containing a literal double-quote (e.g. a JSON/XML array
matched by a string-valued key, like [name="Ada"]) used to produce
malformed HTML when written into a data-path="..." attribute, because
escHtml() doesn't escape quotes (correct for text content, unsafe for an
attribute value). That silently broke the click handler for any such row.

This is a DOM/UI-wiring test, not pure logic — it can't be expressed as a
Node unit test the way src/*.test.mjs can (mapJsonPositions/mapXmlPositions
themselves ARE covered there; this tests the browser-side wiring on top of
them), so it's a standalone Playwright script instead, matching every
other UI regression test in this project.

Requirements:
    pip install playwright && playwright install chromium

Run from the repo root (recast-worker/):
    python3 tests/test_diff_click_to_jump.py

Exits 0 on success, 1 on any failed assertion, and prints a line per check.
"""
import sys
import os
from playwright.sync_api import sync_playwright

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

failures = []


def check(label, condition):
    status = 'PASS' if condition else 'FAIL'
    print(f'  [{status}] {label}')
    if not condition:
        failures.append(label)


def url_for(tool_html):
    return 'file://' + os.path.join(REPO_ROOT, 'public', 'tools', tool_html)


def test_json_diff_string_key_click(page, console_errors):
    """The exact bug: a string-valued matched key ([name="Ada"]) must
    produce well-formed HTML and a working click handler, not just the
    numeric-key case."""
    page.goto(url_for('json-diff.html'))
    page.wait_for_timeout(300)
    page.fill('#inputA', '[{"name": "Ada", "role": "Engineer"}]')
    page.fill('#inputB', '[{"name": "Ada", "role": "Senior Engineer"}]')
    page.wait_for_timeout(200)
    page.click('#convertBtn')
    page.wait_for_timeout(400)

    row_path_attr = page.eval_on_selector('.diff-row.changed', 'el => el.getAttribute("data-path")')
    check('string-keyed row has a well-formed data-path attribute (no stray quote breaking it)',
          row_path_attr == '[name="Ada"].role')

    page.click('.diff-row.changed')
    page.wait_for_timeout(300)
    flashed = page.evaluate(
        '() => { const el = document.querySelector("#hlInputB [data-diff-line].diff-flash"); '
        'return el ? el.getAttribute("data-diff-line") : null; }'
    )
    check('clicking a string-keyed changed row flashes a real line (was silently broken before the fix)',
          flashed is not None)
    check('no console errors after string-key click', len(console_errors) == 0)


def test_csv_diff_click_to_jump(page, console_errors):
    page.goto(url_for('csv-diff.html'))
    page.wait_for_timeout(300)
    page.fill('#inputA', 'id,name,role\nid1,Ada,Engineer\nid2,Grace,Admiral\n')
    page.fill('#inputB', 'id,name,role\nid1,Ada,Senior Engineer\nid2,Grace,Admiral\nid3,Katherine,Mathematician\n')
    page.wait_for_timeout(200)
    page.click('#convertBtn')
    page.wait_for_timeout(400)

    check('CSV compare table renders the expected interactive rows',
          page.locator('tr[data-status="changed"], tr[data-status="added"]').count() == 2)

    page.click('tr[data-status="added"]')
    page.wait_for_timeout(300)
    flashed = page.evaluate(
        '() => { const el = document.querySelector("#hlInputB [data-diff-line].diff-flash"); '
        'return el ? el.getAttribute("data-diff-line") : null; }'
    )
    check('clicking the added CSV row flashes the correct line', flashed == '3')
    check('no console errors after CSV click', len(console_errors) == 0)


def test_xml_diff_click_to_jump(page, console_errors):
    page.goto(url_for('xml-diff.html'))
    page.wait_for_timeout(300)
    xml_a = '<root>\n  <customer id="1">\n    <name>Ada</name>\n  </customer>\n</root>'
    xml_b = '<root>\n  <customer id="1">\n    <name>Ada</name>\n    <role>Engineer</role>\n  </customer>\n</root>'
    page.fill('#inputA', xml_a)
    page.fill('#inputB', xml_b)
    page.wait_for_timeout(200)
    page.click('#convertBtn')
    page.wait_for_timeout(400)

    page.click('.diff-row.added')
    page.wait_for_timeout(300)
    flashed = page.evaluate(
        '() => { const el = document.querySelector("#hlInputB [data-diff-line].diff-flash"); '
        'return el ? el.getAttribute("data-diff-line") : null; }'
    )
    check('clicking the added XML row flashes the correct line', flashed == '3')
    check('no console errors after XML click', len(console_errors) == 0)


def test_fullscreen_click_to_jump_stays_in_fullscreen(page, console_errors):
    """The other half of the original request: clicking a summary row
    while in full-screen mode must not exit full screen."""
    page.goto(url_for('json-diff.html'))
    page.wait_for_timeout(300)
    page.fill('#inputA', '[{"id": 1, "role": "Engineer"}]')
    page.fill('#inputB', '[{"id": 1, "role": "Senior Engineer"}]')
    page.wait_for_timeout(200)
    page.click('#convertBtn')
    page.wait_for_timeout(400)

    page.click('#workbenchExpandBtn')
    page.wait_for_timeout(300)
    is_fullscreen_before = page.eval_on_selector(
        '#diffFullscreenWrap', 'el => el.classList.contains("wb-fullscreen")'
    )
    check('entering full screen sets the expected class', is_fullscreen_before is True)

    page.click('.diff-row.changed')
    page.wait_for_timeout(300)
    is_fullscreen_after = page.eval_on_selector(
        '#diffFullscreenWrap', 'el => el.classList.contains("wb-fullscreen")'
    )
    check('clicking a summary row while full screen does not exit full screen',
          is_fullscreen_after is True)
    check('no console errors in fullscreen click flow', len(console_errors) == 0)


def test_xml_structural_view_toggle(page, console_errors):
    """Structural analysis view: toggling, filtering, click-to-jump, and
    that re-comparing doesn't silently snap the user back to tree view."""
    page.goto(url_for('xml-diff.html'))
    page.wait_for_timeout(300)
    xml_a = '<root><customer id="1"><name>Ada</name></customer><customer id="2"><name>Grace</name><role>Admiral</role></customer></root>'
    xml_b = '<root><customer id="1"><name>Ada</name><role>Engineer</role></customer><customer id="2"><name>Grace</name></customer></root>'
    page.fill('#inputA', xml_a)
    page.fill('#inputB', xml_b)
    page.wait_for_timeout(200)
    page.click('#convertBtn')
    page.wait_for_timeout(400)

    page.click('.diff-view-btn[data-view="structural"]')
    page.wait_for_timeout(300)
    struct_visible = page.eval_on_selector('#comparePanel', 'el => el.classList.contains("show")')
    check('structural view becomes visible after toggling', struct_visible is True)

    row_count = page.locator('#compareTableWrap tr[data-status]').count()
    check('structural table renders the expected number of changes', row_count == 2)

    page.click('.compare-filter-btn[data-filter="added"]')
    page.wait_for_timeout(200)
    filtered_count = page.locator('#compareTableWrap tr[data-status]').count()
    check('Added filter narrows the structural table correctly', filtered_count == 1)
    page.click('.compare-filter-btn[data-filter="all"]')
    page.wait_for_timeout(200)

    page.click('#compareTableWrap tr[data-status="added"]')
    page.wait_for_timeout(300)
    flashed = page.evaluate(
        '() => { const el = document.querySelector("#hlInputB [data-diff-line].diff-flash"); '
        'return el ? el.getAttribute("data-diff-line") : null; }'
    )
    check('clicking a structural-table row flashes a real line', flashed is not None)

    # Re-compare while already in structural view must not silently
    # switch back to tree view.
    page.click('#convertBtn')
    page.wait_for_timeout(400)
    still_structural = page.eval_on_selector('#comparePanel', 'el => el.classList.contains("show")')
    check('re-comparing while in structural view stays in structural view', still_structural is True)
    check('no console errors in structural view flow', len(console_errors) == 0)


def test_diff_popout_shows_real_content_and_summary(page, console_errors):
    """Regression test for a real, pre-existing bug: the input pop-out
    button used to mirror a different, hidden textarea (the single-input
    mode's #input, not #inputA/#inputB), so it showed stale/unrelated
    content on every diff tool. Also covers the enhancement requested
    alongside that fix: the pop-out should include the actual summary
    panel, not just the two source files."""
    page.goto(url_for('json-diff.html'))
    page.wait_for_timeout(300)
    page.fill('#inputA', '[{"id": 1, "role": "Engineer"}]')
    page.fill('#inputB', '[{"id": 1, "role": "Senior Engineer"}]')
    page.wait_for_timeout(200)
    page.click('#convertBtn')
    page.wait_for_timeout(400)

    with page.expect_popup() as popup_info:
        page.click('#inputPopoutBtn')
    popup = popup_info.value
    popup.wait_for_timeout(400)

    pane_a_val = popup.eval_on_selector('.pane:nth-child(1) textarea', 'el => el.value')
    pane_b_val = popup.eval_on_selector('.pane:nth-child(2) textarea', 'el => el.value')
    check('popout File A shows the real inputA content, not stale/unrelated data',
          '"Engineer"' in pane_a_val and 'Senior' not in pane_a_val)
    check('popout File B shows the real inputB content', 'Senior Engineer' in pane_b_val)

    summary_html = popup.eval_on_selector('.summary-wrap', 'el => el.innerHTML')
    check('popout summary mirror includes the actual change', 'Senior Engineer' in summary_html)

    # Edit in the popup, click Compare there, and confirm both the sync
    # back to the main tab and the summary refresh actually work.
    popup.fill('.pane:nth-child(2) textarea', '[{"id": 1, "role": "Director"}]')
    popup.wait_for_timeout(300)
    main_tab_b = page.eval_on_selector('#inputB', 'el => el.value')
    check('editing in the popup syncs back to the main tab', 'Director' in main_tab_b)

    popup.click('.compare-btn')
    popup.wait_for_timeout(500)
    updated_summary = popup.eval_on_selector('.summary-wrap', 'el => el.innerHTML')
    check('Compare button inside the popup refreshes the summary mirror', 'Director' in updated_summary)
    popup.close()
    check('no console errors in the diff popout flow', len(console_errors) == 0)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()

        for name, test_fn in [
            ('json_diff_string_key_click', test_json_diff_string_key_click),
            ('csv_diff_click_to_jump', test_csv_diff_click_to_jump),
            ('xml_diff_click_to_jump', test_xml_diff_click_to_jump),
            ('xml_structural_view_toggle', test_xml_structural_view_toggle),
            ('diff_popout_content_and_summary', test_diff_popout_shows_real_content_and_summary),
            ('fullscreen_click_to_jump', test_fullscreen_click_to_jump_stays_in_fullscreen),
        ]:
            console_errors = []
            page = browser.new_page(viewport={'width': 1200, 'height': 900})
            page.on('pageerror', lambda err: console_errors.append(str(err)))
            print(f'\n-- {name} --')
            test_fn(page, console_errors)
            page.close()

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
