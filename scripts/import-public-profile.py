"""Save an avatar exposed by a public Locket profile, without running its scripts.

Usage: python scripts/import-public-profile.py anhhphuongg06
This imports public profile artwork only; it never checks Gold or subscription data.
"""
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen


class PublicPage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.avatar = None

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'img' and 'profile-pic-img' in values.get('class', '').split():
            self.avatar = values.get('src')


def fetch(url, limit):
    with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=20) as response:
        data = response.read(limit + 1)
        if len(data) > limit:
            raise ValueError('Public resource exceeds size limit')
        return data, response.headers.get_content_type()


def main():
    username = sys.argv[1] if len(sys.argv) == 2 else ''
    if not re.fullmatch(r'[A-Za-z0-9_.-]{1,100}', username) or username in ('.', '..'):
        raise ValueError('Provide one Locket username')
    root = Path(__file__).resolve().parents[1]
    source = 'https://locket.cam/' + username
    html, _ = fetch(source, 512 * 1024)
    page = PublicPage()
    page.feed(html.decode('utf-8', errors='replace'))
    if not page.avatar:
        raise ValueError('The public page does not expose an avatar')
    parsed = urlparse(page.avatar)
    if parsed.scheme != 'https' or not parsed.hostname or not parsed.hostname.endswith('.locketcamera.com'):
        raise ValueError('Unexpected avatar host')
    data, mime = fetch(page.avatar, 5 * 1024 * 1024)
    extension = {'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png'}.get(mime)
    if not extension:
        raise ValueError('Unexpected avatar image format')
    digest = hashlib.sha256(data).hexdigest()
    relative = 'assets/public-profiles/profile-' + username + '-' + digest[:12] + '.' + extension
    (root / relative).parent.mkdir(exist_ok=True, parents=True)
    (root / relative).write_bytes(data)
    catalog = root / 'assets/public-profiles.json'
    profiles = json.loads(catalog.read_text(encoding='utf-8')) if catalog.exists() else {}
    profiles[username] = {
        'username': username,
        'displayName': None,
        'avatar': './' + relative,
        'source': source,
        'checkedAt': datetime.now(timezone.utc).isoformat(),
        'avatarSha256': digest,
    }
    serialized = json.dumps(profiles, indent=2, ensure_ascii=True)
    catalog.write_text(serialized + '\n', encoding='utf-8')
    (root / 'assets/public-profiles.js').write_text(
        'window.LocketPublicProfiles = JSON.parse(' + json.dumps(serialized) + ');\n', encoding='utf-8'
    )
    print('Imported public avatar for', username, '(' + str(len(data)) + ' bytes)')


if __name__ == '__main__':
    main()
