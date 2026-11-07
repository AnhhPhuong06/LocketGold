(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ReferralCore = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const FORMAT = 'anhhphuongg-referrals';
  const STATUS = { planned: 'Chưa gửi', sent: 'Đang chờ', rewarded: 'Đã ghi nhận thưởng', ineligible: 'Không đủ điều kiện' };
  const DEFAULT_MESSAGE = 'Chào {name}, đây là link mời Locket của mình: {link}\nBạn xem điều kiện nhận Gold trong ứng dụng nhé!';
  const MAX_FRIENDS = 500;

  function emptyState() {
    return { format: FORMAT, version: 1, inviteUrl: '', message: DEFAULT_MESSAGE, friends: [] };
  }

  function normalizeUrl(value) {
    if (typeof value !== 'string' || value.trim().length > 2048) throw new Error('Link quá dài hoặc không hợp lệ.');
    const trimmed = value.trim();
    if (!trimmed) return '';
    let parsed;
    try { parsed = new URL(trimmed); } catch (_) { throw new Error('Hãy nhập link HTTPS đầy đủ lấy từ ứng dụng Locket.'); }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || !parsed.hostname) {
      throw new Error('Chỉ nhận link HTTPS không chứa thông tin đăng nhập.');
    }
    return parsed.href;
  }

  function text(value, label, max, allowEmpty) {
    if (typeof value !== 'string') throw new Error(label + ' phải là văn bản.');
    const clean = value.trim();
    if ((!allowEmpty && !clean) || clean.length > max) throw new Error(label + ' không hợp lệ (tối đa ' + max + ' ký tự).');
    return clean;
  }

  function isDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T00:00:00.000Z');
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function validateFriend(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Bản ghi lời mời không hợp lệ.');
    if (typeof value.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(value.id)) throw new Error('Mã lời mời không hợp lệ.');
    if (!Object.prototype.hasOwnProperty.call(STATUS, value.status)) throw new Error('Trạng thái lời mời không hợp lệ.');
    if (!isDate(value.date)) throw new Error('Ngày lời mời không hợp lệ.');
    return {
      id: value.id,
      name: text(value.name, 'Tên bạn', 80, false),
      date: value.date,
      status: value.status,
      note: text(value.note, 'Ghi chú', 300, true)
    };
  }

  function validateState(value) {
    if (!value || value.format !== FORMAT || value.version !== 1) throw new Error('Đây không phải bản sao lưu của tool hoặc phiên bản không được hỗ trợ.');
    if (!Array.isArray(value.friends) || value.friends.length > MAX_FRIENDS) throw new Error('Danh sách tối đa ' + MAX_FRIENDS + ' lời mời.');
    const ids = new Set();
    const friends = value.friends.map(function (friend) {
      const clean = validateFriend(friend);
      if (ids.has(clean.id)) throw new Error('Bản sao lưu chứa mã lời mời trùng nhau.');
      ids.add(clean.id);
      return clean;
    });
    return {
      format: FORMAT,
      version: 1,
      inviteUrl: normalizeUrl(value.inviteUrl),
      message: text(value.message, 'Nội dung lời mời', 2000, false),
      friends: friends
    };
  }

  function mergeStates(currentValue, incomingValue) {
    const current = validateState(currentValue);
    const incoming = validateState(incomingValue);
    const ids = new Set(current.friends.map(function (friend) { return friend.id; }));
    const additions = incoming.friends.filter(function (friend) { return !ids.has(friend.id); });
    if (current.friends.length + additions.length > MAX_FRIENDS) throw new Error('Gộp dữ liệu sẽ vượt giới hạn ' + MAX_FRIENDS + ' lời mời.');
    return {
      state: validateState({
        format: FORMAT, version: 1,
        inviteUrl: current.inviteUrl || incoming.inviteUrl,
        message: current.message === DEFAULT_MESSAGE ? incoming.message : current.message,
        friends: current.friends.concat(additions)
      }),
      added: additions.length,
      skipped: incoming.friends.length - additions.length
    };
  }

  function buildMessage(template, urlValue, name) {
    const url = normalizeUrl(urlValue);
    if (!url) throw new Error('Hãy lưu link mời của bạn trước.');
    const message = text(template, 'Nội dung lời mời', 2000, false);
    const rendered = message.split('{name}').join(name || 'bạn').split('{link}').join(url);
    return message.indexOf('{link}') === -1 ? rendered + '\n' + url : rendered;
  }

  function summary(friends) {
    const counts = { total: friends.length, planned: 0, sent: 0, rewarded: 0, ineligible: 0 };
    friends.forEach(function (friend) { if (Object.prototype.hasOwnProperty.call(STATUS, friend.status)) counts[friend.status] += 1; });
    return counts;
  }

  function searchKey(value) {
    return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  }

  return { FORMAT: FORMAT, STATUS: STATUS, DEFAULT_MESSAGE: DEFAULT_MESSAGE, MAX_FRIENDS: MAX_FRIENDS,
    emptyState: emptyState, normalizeUrl: normalizeUrl, isDate: isDate, validateFriend: validateFriend,
    validateState: validateState, mergeStates: mergeStates, buildMessage: buildMessage, summary: summary, searchKey: searchKey };
}));
