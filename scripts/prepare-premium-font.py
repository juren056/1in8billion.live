"""Rebuild the OFL font derivative from a licensed NotoSansCJKjp-Regular.otf.
Usage: python scripts/prepare-premium-font.py /path/to/NotoSansCJKjp-Regular.otf
Requires fonttools4.67.0. Never run during ordinary website builds.
Source: https://github.com/notofonts/noto-cjk (Sans/OTF/Japanese), SIL OFL1.1.
"""
import sys
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
font=TTFont(sys.argv[1]);sub=subset.Subsetter(subset.Options())
sub.populate(unicodes=list(range(32,0x530))+list(range(0x2000,0x3200))+list(range(0x3400,0xa000))+list(range(0xac00,0xd7a4))+list(range(0xff00,0xfff0)));sub.subset(font)
order=font.getGlyphOrder();gs=font.getGlyphSet();glyphs={}
for name in order:
 pen=TTGlyphPen(gs);gs[name].draw(Cu2QuPen(pen,1.0,reverse_direction=True));glyphs[name]=pen.glyph()
fb=FontBuilder(font['head'].unitsPerEm,isTTF=True);fb.setupGlyphOrder(order);fb.setupCharacterMap(font.getBestCmap());fb.setupGlyf(glyphs);fb.setupHorizontalMetrics(font['hmtx'].metrics);fb.setupHorizontalHeader(ascent=font['hhea'].ascent,descent=font['hhea'].descent)
fb.setupNameTable({'familyName':'Keepsake Sans','styleName':'Regular','uniqueFontIdentifier':'KeepsakeSans-v1','fullName':'Keepsake Sans Regular','psName':'KeepsakeSans-Regular','version':'Version 1.0','licenseDescription':'SIL Open Font License1.1; derivative of Noto Sans CJK. Original license accompanies this font.','licenseInfoURL':'https://openfontlicense.org/'})
fb.setupOS2(sTypoAscender=font['OS/2'].sTypoAscender,sTypoDescender=font['OS/2'].sTypoDescender,usWinAscent=font['OS/2'].usWinAscent,usWinDescent=font['OS/2'].usWinDescent);fb.setupPost();fb.setupMaxp();fb.save('vendor/premium/KeepsakeSans-Regular.ttf')
