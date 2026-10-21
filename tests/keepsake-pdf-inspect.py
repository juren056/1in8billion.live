"""Inspect and render actual app exports; this never authors or edits PDFs."""
import json, subprocess
from pathlib import Path
from pypdf import PdfReader

root = Path('audit/keepsake-20261021')
expected = json.loads((root / 'pdf-expected.json').read_text(encoding='utf-8'))
exports = [
 ('book-JPN-cinematic-poster-A4', expected['JPN']['pages'], 'A4'),
 ('book-USA-journal-scrapbook-Letter', expected['USA']['pages'], 'Letter'),
 ('book-IND-minimal-data-A4', expected['IND']['pages'], 'A4'),
 ('book-short-chinese-Letter', expected['short']['pages'], 'Letter'),
 ('book-editorial-custom-A4', expected['JPN']['pages'], 'A4'),
 ('book-sparse-chinese-Letter', 5, 'Letter')]
render = root / 'pdf-render'
render.mkdir(exist_ok=True)
rows = []
for name, count, paper in exports:
 file = root / 'exports' / (name + '.pdf')
 reader = PdfReader(file)
 assert len(reader.pages) == count, (name, len(reader.pages), count)
 size = (595.28, 841.89) if paper == 'A4' else (612, 792)
 for page in reader.pages:
  assert all(abs(float(value) - expect) < .02 for value, expect in zip((page.mediabox.width, page.mediabox.height), size))
 text = '\n'.join(p.extract_text() for p in reader.pages[1:])
 assert 'undefined' not in text and 'null' not in text
 assert 'https://1in8billion.live/sources/' in reader.pages[-1].extract_text()
 assert f'{count} / {count}' in reader.pages[-1].extract_text()
 pages = sorted(set([1, (count+1)//2, count]))
 for number in pages:
  subprocess.run(['pdftoppm', '-f', str(number), '-l', str(number), '-singlefile', '-scale-to', '1400', '-png', str(file), str(render / f'{name}-p{number:02d}')], check=True, capture_output=True, timeout=60)
 rows.append(dict(file=str(file), pages=count, paper=paper, size=size, rendered=pages, finalSourceAndNumber=True, sparseClean=True))
(root / 'pdf-acceptance.json').write_text(json.dumps(rows, indent=2), encoding='utf-8')
print('PASS six actual PDFs: exact logical page counts, every page size, source and numbering; first/middle/final pages rendered')
