"""Import visual assets from the local public snapshot; do not import its backend."""
from pathlib import Path
import hashlib
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT.parent.parent / 'uplocket-public'
DEST = ROOT / 'assets' / 'uplocket'


def main():
    snapshot = json.loads((SOURCE / '_mirror/manifest.json').read_text(encoding='utf-8'))
    records = {r['path']: r for r in snapshot['files'] if 'path' in r}
    imported = []

    def copy(source, target):
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        record = records[source.relative_to(SOURCE).as_posix()]
        imported.append({'path': target.relative_to(ROOT).as_posix(), 'source': record['url'], 'sha256': record['sha256']})

    for folder in ('index', 'logos'):
        for source in sorted((SOURCE / 'assets' / folder).rglob('*')):
            if source.is_file():
                copy(source, DEST / folder / source.relative_to(SOURCE / 'assets' / folder))
    copy(SOURCE / 'assets/js/lenis.min.js', DEST / 'lenis.min.js')
    fredoka = next((SOURCE / '_next/static/media').glob('fredoka-latin-wght-normal.*.woff2'))
    copy(fredoka, DEST / 'fredoka-latin.woff2')
    seen = set()
    catalog = []
    sources = sorted((SOURCE / 'uploads/frames').rglob('*.png'), key=lambda p: ('ctv' in p.parts, p.name))
    for source in sources:
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        if digest in seen:
            continue
        seen.add(digest)
        name = re.sub(r'__[a-f0-9]{12}$', '', source.stem)
        target = DEST / 'frames' / (name + '-' + digest[:8] + '.png')
        copy(source, target)
        label = re.sub(r'^(?:baked_)?frame_', '', name)
        label = re.sub(r'_s\d+_sx\d+_sy\d+_ox-?\d+_oy-?\d+$', '', label).replace('_', ' ').strip().title()
        catalog.append({'id': digest[:16], 'name': label, 'src': './' + target.relative_to(ROOT).as_posix(), 'group': 'ctv' if 'ctv' in source.parts else 'main'})
    (DEST / 'frames.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (DEST / 'frames.js').write_text('window.LocketFrames = ' + json.dumps(catalog, ensure_ascii=False) + ';\n', encoding='utf-8')
    (DEST / 'asset-manifest.json').write_text(json.dumps(imported, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'imported': len(imported), 'uniqueFrames': len(catalog), 'bytes': sum((ROOT / r['path']).stat().st_size for r in imported)}))


if __name__ == '__main__':
    main()
