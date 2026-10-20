"""Check actual exported pages, including body text below the visible sheet.

Usage: python tests/keepsake-pdf-geometry.py audit/acceptance-20261021
Requires pypdf from the workspace document runtime; not a production dependency.
"""
import json
import sys
from pathlib import Path
from pypdf import PdfReader

root = Path(sys.argv[1])
manifest = json.loads((root / 'extended.json').read_text(encoding='utf-8'))
assert len(manifest['files']) == 27, 'Expected nine languages × three actual PDF exports'
assert len({(r['lang'], r['style']) for r in manifest['files']}) == 27
results, failures = [], []
for row in manifest['files']:
    reader = PdfReader(row['file'])
    minimum = 10000.0
    issues = []
    for number, page in enumerate(reader.pages, 1):
        size, y = 0.0, 0.0
        for operands, operator in page.get_contents().operations:
            if operator == b'Tf':
                size = float(operands[1])
            elif operator == b'Tm':
                y = float(operands[5])
            elif operator in (b'Tj', b'TJ'):
                # Footer disclosure (8pt), folio (9pt), and 12pt demo at y=82
                # are intentional. Body rows use 11/13/17/18pt.
                if not operands[0] or size < 10 or (abs(size-12) < .01 and abs(y-82) < .1):
                    continue
                minimum = min(minimum, y)
                if y < 100:
                    issues.append({'page': number, 'y': round(y, 2), 'fontSize': size})
    if len(reader.pages) != row['pages']:
        issues.append({'previewPages': row['pages'], 'actualPages': len(reader.pages)})
    result = {'lang': row['lang'], 'style': row['style'], 'pages': len(reader.pages),
              'minimumBodyY': minimum, 'issues': issues}
    results.append(result)
    print(json.dumps(result), flush=True)
    if issues:
        failures.append(result)
(root / 'pdf-geometry.json').write_text(json.dumps({'results': results, 'failures': failures}, indent=2), encoding='utf-8')
if failures:
    raise SystemExit(1)
print('PASS: all 27 actual PDFs retain body text above the footer and match preview page counts')
