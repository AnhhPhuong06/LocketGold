const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../assets/referral-core.js');

function friend(id, changes = {}) {
  return { id, name: 'Bạn thử', date: '2026-11-07', status: 'sent', note: '', ...changes };
}

test('URL input rejects executable schemes and embedded credentials', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'http://example.com', 'https://alice:secret@example.com', 'not a link']) {
    assert.throws(() => core.normalizeUrl(url));
  }
  assert.equal(core.normalizeUrl(' https://example.com/invite?a=1 '), 'https://example.com/invite?a=1');
  assert.equal(core.normalizeUrl(''), '');
});

test('invalid imports cannot silently erase or corrupt records', () => {
  for (const invalid of [null, {}, { ...core.emptyState(), version: 2 },
    { ...core.emptyState(), friends: [friend('same'), friend('same')] },
    { ...core.emptyState(), friends: [friend('a', { date: '2026-02-30' })] },
    { ...core.emptyState(), friends: [friend('a', { status: '__proto__' })] }]) {
    assert.throws(() => core.validateState(invalid));
  }
});

test('backup round trip retains the link, drafts and personal records', () => {
  const original = { ...core.emptyState(), inviteUrl: 'https://example.com/invite',
    message: 'Chào {name}! {link}', friends: [friend('one', { name: '<Minh>', note: 'Gửi cuối tuần' })] };
  assert.deepEqual(core.validateState(JSON.parse(JSON.stringify(original))), original);
});

test('merge preserves existing records and adds only new IDs', () => {
  const current = { ...core.emptyState(), inviteUrl: 'https://example.com/current', friends: [friend('a', { status: 'rewarded' })] };
  const incoming = { ...core.emptyState(), inviteUrl: 'https://example.com/backup', friends: [friend('a'), friend('b')] };
  const result = core.mergeStates(current, incoming);
  assert.equal(result.added, 1);
  assert.equal(result.skipped, 1);
  assert.equal(result.state.inviteUrl, current.inviteUrl);
  assert.equal(result.state.friends[0].status, 'rewarded');
  assert.equal(current.friends.length, 1);
});

test('draft substitution treats names literally and always includes the link', () => {
  assert.equal(core.buildMessage('Chào {name}: {link}', 'https://example.com/invite', '$&'), 'Chào $&: https://example.com/invite');
  assert.equal(core.buildMessage('Xin chào', 'https://example.com/invite', 'Minh'), 'Xin chào\nhttps://example.com/invite');
  assert.throws(() => core.buildMessage(core.DEFAULT_MESSAGE, '', 'Minh'));
});

test('summary counts user-recorded statuses without asserting account eligibility', () => {
  assert.deepEqual(core.summary([friend('a'), friend('b', { status: 'rewarded' }), friend('c', { status: 'planned' })]),
    { total: 3, planned: 1, sent: 1, rewarded: 1, ineligible: 0 });
  assert.equal(core.searchKey('Đặng Minh'), 'dang minh');
  assert.equal(core.isDate('2024-02-29'), true);
  assert.equal(core.isDate('2025-02-29'), false);
});
