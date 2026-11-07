"""Create an alternative DNS bootstrap profile without changing trust or scope."""

import argparse
import copy
import ipaddress
from pathlib import Path
import plistlib


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ip', default='103.211.207.247', help='Provider IPv4 address')
    args = parser.parse_args()
    address = str(ipaddress.IPv4Address(args.ip))
    root = Path(__file__).resolve().parent.parent
    source = root / 'AnhhPhuongg.mobileconfig'
    profile = plistlib.loads(source.read_bytes())
    alternative = copy.deepcopy(profile)
    dns = [p for p in alternative['PayloadContent']
           if p['PayloadType'] == 'com.apple.dnsSettings.managed']
    if len(dns) != 1:
        raise ValueError('Expected exactly one DNS payload')
    dns[0]['DNSSettings']['ServerAddresses'] = [address]
    alternative['PayloadDescription'] = (
        'Bản DNS IPv4 dự phòng cho iOS 14 trở lên. '
        'Dùng khi mạng không phân giải được tên miền máy chủ DNS. '
        'Thay thế bản chính; không bảo đảm kích hoạt Gold.'
    )
    # Preserve IDs so this replaces the main profile instead of adding another resolver.
    output = root / 'AnhhPhuongg-IPv4.mobileconfig'
    output.write_bytes(plistlib.dumps(alternative, fmt=plistlib.FMT_XML, sort_keys=False))
    print(f'Created {output.name} ({output.stat().st_size} bytes).')


if __name__ == '__main__':
    main()
