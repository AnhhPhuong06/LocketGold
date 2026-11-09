(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LocketLink = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function parse(value) {
    const error = 'Nhập username, @username hoặc link https://locket.cam/ten_cua_ban.';
    if (typeof value !== 'string') throw new Error(error);
    const text = value.trim();
    if (!text || text.length > 512 || /[\s\\\u0000-\u001f\u007f]/.test(text)) throw new Error(error);
    const username = /^@?([A-Za-z0-9_.-]{1,100})$/.exec(text);
    if (username) {
      if (username[1] === '.' || username[1] === '..') throw new Error(error);
      return { username: username[1], url: 'https://locket.cam/' + username[1] };
    }
    let url;
    try { url = new URL(text.startsWith('locket.cam/') ? 'https://' + text : text); } catch (_) { throw new Error(error); }
    if (url.protocol !== 'https:' || url.hostname !== 'locket.cam' || url.port || url.username || url.password) throw new Error(error);
    const match = /^\/([A-Za-z0-9_.-]{1,100})\/?$/.exec(url.pathname);
    if (!match || match[1] === '.' || match[1] === '..') throw new Error(error);
    return { username: match[1], url: 'https://locket.cam/' + match[1] };
  }
  return { parse: parse };
}));
