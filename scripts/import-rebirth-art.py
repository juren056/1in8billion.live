from pathlib import Path
import sys,json
from PIL import Image
source,asset,kind=sys.argv[1:4]
root=Path('public-assets/rebirth')
folder=root/('scenes' if kind=='scene' else 'people');folder.mkdir(parents=True,exist_ok=True)
im=Image.open(source).convert('RGBA' if kind=='person' else 'RGB')
if kind=='scene':
 im.thumbnail((1440,810),Image.Resampling.LANCZOS);im.save(folder/(asset+'.pending.webp'),'WEBP',quality=84,method=6);(folder/(asset+'.pending.webp')).replace(folder/(asset+'.webp'))
 thumb=im.copy();thumb.thumbnail((480,270),Image.Resampling.LANCZOS);(root/'thumbs').mkdir(exist_ok=True);thumb.save(root/'thumbs'/(asset+'.webp'),'WEBP',quality=77,method=6)
else:
 im.thumbnail((640,640),Image.Resampling.LANCZOS);im.save(folder/(asset+'.pending.webp'),'WEBP',quality=88,method=6);(folder/(asset+'.pending.webp')).replace(folder/(asset+'.webp'))
meta={'id':asset,'kind':kind,'source':str(source),'width':im.width,'height':im.height,'alpha':kind=='person','bytes':(folder/(asset+'.webp')).stat().st_size}
receipts=Path('audit/rebirth-source-receipts');receipts.mkdir(parents=True,exist_ok=True);(receipts/(asset+'.json')).write_text(json.dumps(meta),encoding='utf-8')
print(json.dumps({k:meta[k] for k in ['id','kind','width','height','bytes']}))
