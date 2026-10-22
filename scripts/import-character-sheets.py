"""Slice generated, transparent four-age sprite sheets without redrawing them."""
from pathlib import Path
import json, sys
from PIL import Image
from concurrent.futures import ThreadPoolExecutor

source_list=Path(sys.argv[1])
families=json.loads(source_list.read_text(encoding='utf-8'))
folder=Path('public-assets/rebirth/people')
def import_family(family):
    assert family['id'] not in ['aria','lina','sora','noah','mateo','amir'], 'Never replace a legacy identity'
    receipts=[]
    sheet=Image.open(family['source']).convert('RGBA')
    assert sheet.getchannel('A').getextrema()[0]==0, family['id']+' needs transparency'
    projection=sheet.getchannel('A').point(lambda v:255 if v>16 else 0).getprojection()[0]
    cuts=[0]
    for part in [1,2,3]:
        center=sheet.width*part/4
        candidates=[x for x in range(max(cuts[-1]+1,int(center-sheet.width*.12)),min(sheet.width-1,int(center+sheet.width*.12))) if not projection[x]]
        assert candidates, family['id']+' figures overlap'
        cut=min(candidates,key=lambda x:abs(x-center))
        left=right=cut
        while left>cuts[-1]+1 and not projection[left-1]: left-=1
        while right<sheet.width-2 and not projection[right+1]: right+=1
        cuts.append((left+right)//2)
    cuts.append(sheet.width)
    for i,age in enumerate(['baby','young','adult','elder']):
        column=sheet.crop((cuts[i],0,cuts[i+1],sheet.height))
        alpha=column.getchannel('A').point(lambda v:255 if v>16 else 0)
        bbox=alpha.getbbox()
        assert bbox and bbox[2]-bbox[0]>80 and bbox[3]-bbox[1]>120, family['id']+' '+age
        # Subject must fit inside the assigned column; do not silently crop a face or hand.
        assert bbox[0]>1 and bbox[2]<column.width-1, (family['id'],age,'crosses column',bbox,column.size)
        sprite=column.crop((max(0,bbox[0]-6),max(0,bbox[1]-6),min(column.width,bbox[2]+6),min(column.height,bbox[3]+6)))
        sprite.thumbnail((640,640),Image.Resampling.LANCZOS)
        target=folder/(family['id']+'-'+age+'.webp')
        ready=False
        if target.exists():
            try:
                with Image.open(target) as existing:
                    existing.load()
                    ready=existing.size==sprite.size
            except OSError:
                pass  # Recover an interrupted write of this new identity only.
        if not ready:
            pending=target.with_suffix('.pending.webp')
            sprite.save(pending,'WEBP',quality=88,method=4)
            pending.replace(target)
        receipts.append({'id':family['id']+'-'+age,'kind':'people','path':'/'+target.as_posix(),'width':sprite.width,'height':sprite.height,'bytes':target.stat().st_size,'sourceSheet':family['id'],'column':i,'sourceBounds':[cuts[i],cuts[i+1]]})
    print('Imported '+family['id'],flush=True)
    return receipts
with ThreadPoolExecutor(max_workers=4) as pool:
    receipts=[r for group in pool.map(import_family,families) for r in group]
manifest=Path('public-assets/rebirth/manifest.json')
data=json.loads(manifest.read_text(encoding='utf-8'))
assets={r['id']:r for r in data['assets']}
assets.update({r['id']:r for r in receipts})
data['assets']=list(assets.values())
data['count']=len(data['assets'])
data['version']=2
data['people']=sum(r['kind']=='people' for r in data['assets'])
data['scenes']=sum(r['kind']=='scenes' for r in data['assets'])
data['characterLibrary']={'version':2,'identities':len(list(folder.glob('*-adult.webp'))),'ages':4,'newArtwork':'Original four-age sprite sheets, one sheet per identity. Cropped cells are derivatives, not separately generated artworks.','matching':'Presentation-only country candidate groups; not demographic estimates. Existing identity IDs and unversioned legacy selection remain unchanged.'}
sheets={r['sourceSheet'] for r in data['assets'] if 'sourceSheet' in r}
data['characterLibrary']['newSpriteSheets']=len(sheets)
data['characterLibrary']['sourceArtworks']=sum('sourceSheet' not in r for r in data['assets'])+len(sheets)
manifest.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
source_list.with_name('sprite-import'+str(len(families))+'.json').write_text(json.dumps(receipts,indent=2),encoding='utf-8')
print(json.dumps({'families':len(families),'sprites':len(receipts),'totalAssets':data['count']}))
