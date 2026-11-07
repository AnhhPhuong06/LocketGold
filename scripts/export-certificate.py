"""Export the public CA already embedded in the downloadable DNS profile."""
from pathlib import Path
import hashlib
import json
import plistlib
from cryptography import x509


def main():
    root = Path(__file__).resolve().parent.parent
    profile = plistlib.loads((root / 'AnhhPhuongg.mobileconfig').read_bytes())
    certificates = [p for p in profile['PayloadContent'] if p['PayloadType'] == 'com.apple.security.root']
    if len(certificates) != 1:
        raise ValueError('Expected exactly one public root certificate')
    der = certificates[0]['PayloadContent']
    certificate = x509.load_der_x509_certificate(der)
    dns = next(p['DNSSettings'] for p in profile['PayloadContent'] if p['PayloadType'] == 'com.apple.dnsSettings.managed')
    (root / 'LocketGold-CA.cer').write_bytes(der)
    info = {
        'certificate': {'file': 'LocketGold-CA.cer', 'subject': certificate.subject.rfc4514_string(), 'issuer': certificate.issuer.rfc4514_string(), 'notBefore': certificate.not_valid_before_utc.isoformat(), 'notAfter': certificate.not_valid_after_utc.isoformat(), 'sha256': hashlib.sha256(der).hexdigest().upper()},
        'dns': {'protocol': dns['DNSProtocol'], 'serverUrl': dns['ServerURL'], 'domains': dns['SupplementalMatchDomains']},
        'profiles': {name: {'bytes': (root / name).stat().st_size, 'sha256': hashlib.sha256((root / name).read_bytes()).hexdigest()} for name in ('AnhhPhuongg.mobileconfig', 'AnhhPhuongg-IPv4.mobileconfig')},
    }
    text = json.dumps(info, ensure_ascii=False, indent=2) + '\n'
    (root / 'assets' / 'profile-info.json').write_text(text, encoding='utf-8')
    (root / 'assets' / 'profile-info.js').write_text('window.LocketProfileInfo = ' + text.rstrip() + ';\n', encoding='utf-8')
    print('Exported public CA and profile metadata; original profiles unchanged.')


if __name__ == '__main__':
    main()
