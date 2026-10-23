"""Read-only validation of PDFs exported by the application."""
import json, subprocess
from pathlib import Path
from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw

root=Path('audit/story-v5/exports')
manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
checks=[]
for paper in ['A4','Letter']:
    file=root/f'story-zh-{paper}.pdf'
    pdf=PdfReader(file)
    assert len(pdf.pages)==manifest['pages']
    size=(595.28,841.89) if paper=='A4' else (612,792)
    minimum=10000
    for n,page in enumerate(pdf.pages,1):
        assert all(abs(float(v)-e)<.02 for v,e in zip((page.mediabox.width,page.mediabox.height),size))
        body_size,y=0.,0.
        for operands,op in page.get_contents().operations:
            if op==b'Tf': body_size=float(operands[1])
            elif op==b'Tm': y=float(operands[5])
            elif op in [b'Tj',b'TJ'] and operands[0] and body_size>=10 and not(abs(body_size-12)<.01 and abs(y-82)<.1):
                minimum=min(minimum,y)
                assert y>=100,(paper,n,y)
    text='\n'.join(p.extract_text() for p in pdf.pages)
    assert 'undefined' not in text and '{person}' not in text
    assert 'https://1in8billion.live/sources/' in pdf.pages[-1].extract_text()
    for n in [3,8,14]:
        subprocess.run(['pdftoppm','-f',str(n),'-l',str(n),'-singlefile','-scale-to','1200','-png',str(file),str(root/f'{paper}-chapter-{n}')],check=True,capture_output=True,timeout=60)
    checks.append({'paper':paper,'pages':len(pdf.pages),'minimumBodyY':minimum,'rendered':[3,8,14]})
ids=['clean-modern','cinematic-poster','editorial-magazine','journal-scrapbook','minimal-data','archive-certificate']
sheet=Image.new('RGB',(1200,1180),'#e7edf2')
draw=ImageDraw.Draw(sheet)
for i,id in enumerate(ids):
    tile=Image.open(root/f'{id}-9x16.png').convert('RGB')
    tile.thumbnail((360,550))
    x=(i%3)*400+(400-tile.width)//2; y=(i//3)*590+24
    sheet.paste(tile,(x,y));draw.text(((i%3)*400+20,y+tile.height+8),id,fill='#102d45')
sheet.save(root/'six-template-review.png')
(root/'pdf-acceptance.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
print(f'PASS {sum(r["pages"] for r in checks)} PDF pages: correct dimensions, no body below footer, source notes and six rendered chapter pages')
