const test = require('node:test');
const assert = require('node:assert/strict');
const { parse } = require('../assets/locket-link.js');

test('public profile links normalize without tracking query or fragment', () => {
  assert.deepEqual(parse('  https://locket.cam/AnhhPhuongg/?source=share#profile  '), {
    username: 'AnhhPhuongg', url: 'https://locket.cam/AnhhPhuongg'
  });
  assert.equal(parse('https://locket.cam/name_01.test-user').username, 'name_01.test-user');
});

test('usernames and @usernames normalize to public profile links', () => {
  for (const value of ['anhhphuongg06', '@anhhphuongg06', '  @anhhphuongg06  ']) {
    assert.deepEqual(parse(value), { username: 'anhhphuongg06', url: 'https://locket.cam/anhhphuongg06' });
  }
  assert.equal(parse('@nga.2007').username, 'nga.2007');
});

test('rejects executable schemes, lookalike hosts, credentials and arbitrary routes', () => {
  for (const value of [
    '', null, 42, '@', '.', '..', '@..', '@a/b', 'user name', 'x'.repeat(101), 'http://locket.cam/user', 'javascript:alert(1)',
    'https://locket.cam.evil.example/user', 'https://evil.example/locket.cam/user',
    'https://locket.cam@evil.example/user', 'https://someone@locket.cam/user',
    'https://locket.cam:8443/user', 'https://locket.cam/', 'https://locket.cam/a/b',
    'https://locket.cam/user name', 'https://locket.cam/%3Cscript%3E',
    'https://locket.cam/..', 'https://locket.cam/' + 'x'.repeat(101),
    'https://locket.cam/user\\name', 'https://locket.cam/user\nname'
  ]) assert.throws(() => parse(value), undefined, String(value));
});
