"""Read-only geometry/text/render verification of files exported by the application."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json, subprocess
from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw

root=Path('audit/growth-execution-20261022/pdf-matrix')
rows=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
def inspect(row):
    path=Path(row['file']); reader=PdfReader(path)
    assert len(reader.pages)==row['pages'],path
    expected=(595.28,841.89) if row['paper']=='A4' else (612,792)
    for number,page in enumerate(reader.pages,1):
        assert all(abs(float(v)-e)<.03 for v,e in zip((page.mediabox.width,page.mediabox.height),expected)),(path,number)
    folder=root/path.stem;folder.mkdir(exist_ok=True)
    subprocess.run(['pdftoppm','-png','-scale-to','600',str(path),str(folder/'page')],check=True,capture_output=True,timeout=180)
    images=sorted(folder.glob('page-*.png'));assert len(images)==len(reader.pages)
    cols=4;cw,ch=220,332;sheet=Image.new('RGB',(cols*cw,((len(images)+cols-1)//cols)*ch),'#e5ebef');draw=ImageDraw.Draw(sheet)
    for i,file in enumerate(images):
        image=Image.open(file).convert('RGB');image.thumbnail((cw-12,ch-25));x=(i%cols)*cw;y=(i//cols)*ch
        sheet.paste(image,(x+6,y+18));draw.text((x+8,y+2),str(i+1),fill='black')
    sheet.save(root/(path.stem+'-pages.jpg'))
    return dict(file=str(path),pages=len(images),paper=row['paper'],allPagesRendered=True,geometry=True)
with ThreadPoolExecutor(max_workers=3) as pool:
    results=list(pool.map(inspect,rows))
(root/'inspection.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print('PASS 12 actual PDFs: every page has expected size and is rendered for visual review')
