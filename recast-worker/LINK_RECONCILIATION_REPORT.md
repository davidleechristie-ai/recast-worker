# V37 Site-wide link reconciliation

## Scope
- 79 HTML pages audited
- 7317 HTML anchor references resolved
- Internal relative links, root-relative links and same-domain absolute links checked
- Fragment targets checked against target-page IDs
- Primary Tools menus reconciled site-wide

## Result
- Broken internal links: 0
- Invalid internal fragment targets: 0
- Legacy Tools menu category buttons routing back to homepage/workbench: 0

## Tools menu canonical destinations
- Convert → /tools/json-to-csv.html
- Transform → /tools/flatten-json.html
- Query → /tools/jsonpath-tester.html
- Validate → /tools/json-validator.html
- Compare → /tools/json-diff.html
- Inspect → /tools/json-schema-generator.html
- See all tools → /tools/index.html

## Additional reconciliation
- Old API links pointing to homepage #api now point to /api/index.html.
- Contextual How-To/blog CTAs that pointed to the old homepage #tool were mapped to the relevant dedicated tool page where the page intent made the destination unambiguous.
- Non-workbench informational-page utility links that still pointed to the removed/moved homepage #tool now route to the Tools directory rather than a stale homepage location.
- Homepage logo/home navigation remains intentionally linked to the homepage.
- Pricing remains an intentional homepage section anchor.
- Workflow/Automation homepage anchors remain where those product surfaces still live.
