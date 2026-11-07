(function () {
  'use strict';
  const core = window.ReferralCore;
  const STORAGE_KEY = 'anhhphuongg.gold-referrals.v1';
  const $ = function (id) { return document.getElementById(id); };
  let data = core.emptyState();
  let recoveryRaw = null;
  let toastTimer;
  let undoAction = null;

  function warning(message) {
    $('storage-warning').hidden = false;
    $('storage-warning-text').textContent = message;
  }

  function notify(message, undo) {
    window.clearTimeout(toastTimer);
    undoAction = undo || null;
    $('toast-message').textContent = message;
    $('toast-undo').hidden = !undoAction;
    $('tracker-toast').classList.add('is-visible');
    toastTimer = window.setTimeout(function () {
      $('tracker-toast').classList.remove('is-visible');
      undoAction = null;
    }, undo ? 9000 : 5500);
  }

  function readStorage() {
    let raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw !== null) data = core.validateState(JSON.parse(raw));
    } catch (error) {
      if (raw !== null) {
        recoveryRaw = raw;
        $('rescue-storage').hidden = false;
        warning('Dữ liệu cũ không đọc được. Hãy tải dữ liệu gốc trước khi lưu hoặc nhập bản sao lưu; tool chưa ghi đè dữ liệu cũ.');
      } else {
        warning('Trình duyệt không cho đọc dữ liệu lưu. Các thay đổi có thể chỉ tồn tại trong phiên này; hãy xuất JSON để sao lưu.');
        $('storage-badge').textContent = 'Bộ nhớ trình duyệt đang bị hạn chế';
      }
    }
  }

  function commit(next, message, undo) {
    if (recoveryRaw !== null) {
      notify('Hãy chọn “Tải dữ liệu gốc” trước để giữ lại dữ liệu cũ.');
      return false;
    }
    const clean = core.validateState(next);
    let persisted = true;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean)); }
    catch (error) {
      persisted = false;
      warning('Không lưu được vào trình duyệt. Danh sách hiện chỉ giữ trong phiên này. Hãy xuất JSON trước khi đóng trang.');
      $('storage-badge').textContent = 'Đang dùng bộ nhớ tạm';
    }
    data = clean;
    render();
    notify(message + (persisted ? '' : ' Chưa lưu được lâu dài; hãy xuất JSON.'), undo);
    return true;
  }

  function today() {
    const date = new Date();
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function newId() {
    if (window.crypto && window.crypto.getRandomValues) {
      const values = new Uint8Array(12);
      window.crypto.getRandomValues(values);
      return 'invite-' + Array.from(values).map(function (value) { return value.toString(16).padStart(2, '0'); }).join('');
    }
    return 'invite-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
  }

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#i-' + name);
    svg.appendChild(use);
    return svg;
  }

  function actionButton(action, friend, label, iconName) {
    const button = element('button', 'row-action');
    button.type = 'button';
    button.dataset.action = action;
    button.dataset.id = friend.id;
    button.setAttribute('aria-label', label + ' ' + friend.name);
    button.title = label;
    button.appendChild(icon(iconName));
    return button;
  }

  function makeRow(friend) {
    const row = element('article', 'friend-row');
    row.dataset.status = friend.status;
    const top = element('div', 'friend-row-top');
    const words = friend.name.split(/\s+/);
    const initials = words.slice(0, 2).map(function (word) { return Array.from(word)[0] || ''; }).join('').toUpperCase();
    top.appendChild(element('span', 'friend-avatar', initials));
    const info = element('div', 'friend-info');
    info.appendChild(element('h3', 'friend-name', friend.name));
    info.appendChild(element('p', 'friend-date', 'Ngày lời mời · ' + friend.date.split('-').reverse().join('/')));
    if (friend.note) info.appendChild(element('p', 'friend-note', friend.note));
    top.appendChild(info);
    row.appendChild(top);
    const bottom = element('div', 'friend-row-bottom');
    const select = element('select');
    select.dataset.id = friend.id;
    select.setAttribute('aria-label', 'Trạng thái của ' + friend.name);
    Object.keys(core.STATUS).forEach(function (status) {
      const option = element('option', '', core.STATUS[status]);
      option.value = status;
      select.appendChild(option);
    });
    select.value = friend.status;
    bottom.appendChild(select);
    const actions = element('div', 'row-actions');
    actions.appendChild(actionButton('copy', friend, 'Sao chép lời mời cho', 'copy'));
    actions.appendChild(actionButton('edit', friend, 'Chỉnh sửa', 'edit'));
    actions.appendChild(actionButton('delete', friend, 'Xóa', 'trash'));
    bottom.appendChild(actions);
    row.appendChild(bottom);
    return row;
  }

  function render() {
    const counts = core.summary(data.friends);
    ['total', 'planned', 'sent', 'rewarded'].forEach(function (key) { $('stat-' + key).textContent = String(counts[key]); });
    $('copy-invite-url').disabled = !data.inviteUrl;
    $('copy-invite-message').disabled = !data.inviteUrl;
    $('saved-link-status').textContent = data.inviteUrl ? 'Link đã lưu: ' + data.inviteUrl : 'Chưa lưu liên kết.';
    const query = core.searchKey($('search-friends').value.trim());
    const status = $('filter-status').value;
    const visible = data.friends.filter(function (friend) {
      return (status === 'all' || friend.status === status) && (!query || core.searchKey(friend.name + ' ' + friend.note).indexOf(query) !== -1);
    }).slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    const list = $('friend-list');
    while (list.firstChild) list.removeChild(list.firstChild);
    visible.forEach(function (friend) { list.appendChild(makeRow(friend)); });
    $('list-caption').textContent = visible.length + ' / ' + counts.total + ' lời mời';
    $('empty-friends').hidden = visible.length > 0;
    $('empty-friends').querySelector('h3').textContent = counts.total ? 'Chưa tìm thấy lời mời phù hợp.' : 'Khởi đầu từ một lời mời.';
    $('empty-friends').querySelector('p').textContent = counts.total ? 'Thử tìm tên khác hoặc chọn tất cả trạng thái.' : 'Thêm tên một người bạn ở phía trên. Danh sách của bạn sẽ hiện tại đây.';
  }

  function resetFriendForm() {
    $('friend-form').reset();
    $('friend-date').value = today();
    $('edit-friend-id').value = '';
    $('friend-form-title').textContent = 'Thêm một người bạn';
    $('save-friend').querySelector('span').textContent = 'Thêm vào danh sách';
    $('cancel-edit').hidden = true;
  }

  async function copyText(value) {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      $('clipboard-panel').hidden = true;
      notify('Đã sao chép. Bạn có thể tự gửi lời mời cho bạn bè.');
    } catch (error) {
      $('clipboard-panel').hidden = false;
      $('clipboard-text').value = value;
      $('clipboard-text').focus();
      $('clipboard-text').select();
    }
  }

  function copyMessage(name) {
    try { copyText(core.buildMessage(data.message, data.inviteUrl, name)); }
    catch (error) { notify(error.message); }
  }

  function downloadFile(content, name, type) {
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const anchor = element('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  $('invite-form').addEventListener('submit', function (event) {
    event.preventDefault();
    try {
      const next = core.validateState({ format: core.FORMAT, version: 1, inviteUrl: $('invite-url').value, message: $('invite-message').value, friends: data.friends });
      if (commit(next, 'Đã lưu link và nội dung lời mời.')) {
        $('invite-url').value = data.inviteUrl;
        $('invite-message').value = data.message;
      }
    } catch (error) { notify(error.message); }
  });

  $('copy-invite-url').addEventListener('click', function () { if (data.inviteUrl) copyText(data.inviteUrl); });
  $('copy-invite-message').addEventListener('click', function () { copyMessage('bạn'); });
  $('close-clipboard').addEventListener('click', function () { $('clipboard-panel').hidden = true; });
  $('cancel-edit').addEventListener('click', resetFriendForm);
  $('search-friends').addEventListener('input', render);
  $('filter-status').addEventListener('change', render);
  $('toast-undo').addEventListener('click', function () { const action = undoAction; undoAction = null; if (action) action(); });

  $('friend-form').addEventListener('submit', function (event) {
    event.preventDefault();
    try {
      const editing = $('edit-friend-id').value;
      const friend = core.validateFriend({ id: editing || newId(), name: $('friend-name').value, date: $('friend-date').value, status: $('friend-status').value, note: $('friend-note').value });
      const friends = data.friends.slice();
      if (editing) {
        const index = friends.findIndex(function (item) { return item.id === editing; });
        if (index === -1) throw new Error('Lời mời này đã được xóa. Hãy hủy chỉnh sửa rồi thêm lại.');
        friends[index] = friend;
      } else friends.push(friend);
      const next = { format: core.FORMAT, version: 1, inviteUrl: data.inviteUrl, message: data.message, friends: friends };
      if (commit(next, editing ? 'Đã cập nhật lời mời.' : 'Đã thêm vào danh sách.')) resetFriendForm();
    } catch (error) { notify(error.message); }
  });

  $('friend-list').addEventListener('change', function (event) {
    const select = event.target;
    if (select.tagName !== 'SELECT') return;
    try {
      const friends = data.friends.map(function (friend) {
        return friend.id === select.dataset.id ? { id: friend.id, name: friend.name, date: friend.date, note: friend.note, status: select.value } : friend;
      });
      commit({ format: core.FORMAT, version: 1, inviteUrl: data.inviteUrl, message: data.message, friends: friends }, 'Đã lưu trạng thái bạn ghi nhận.');
    } catch (error) { notify(error.message); render(); }
  });

  $('friend-list').addEventListener('click', function (event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const index = data.friends.findIndex(function (friend) { return friend.id === button.dataset.id; });
    if (index === -1) return;
    const friend = data.friends[index];
    if (button.dataset.action === 'copy') { copyMessage(friend.name); return; }
    if (button.dataset.action === 'edit') {
      $('edit-friend-id').value = friend.id;
      $('friend-name').value = friend.name;
      $('friend-date').value = friend.date;
      $('friend-status').value = friend.status;
      $('friend-note').value = friend.note;
      $('friend-form-title').textContent = 'Chỉnh sửa lời mời';
      $('save-friend').querySelector('span').textContent = 'Lưu thay đổi';
      $('cancel-edit').hidden = false;
      $('friend-name').focus();
      return;
    }
    if (button.dataset.action === 'delete') {
      const friends = data.friends.filter(function (item) { return item.id !== friend.id; });
      commit({ format: core.FORMAT, version: 1, inviteUrl: data.inviteUrl, message: data.message, friends: friends }, 'Đã xóa ' + friend.name + '.', function () {
        if (data.friends.some(function (item) { return item.id === friend.id; })) { notify('Lời mời này đã có trong danh sách.'); return; }
        const restored = data.friends.slice();
        restored.splice(Math.min(index, restored.length), 0, friend);
        commit({ format: core.FORMAT, version: 1, inviteUrl: data.inviteUrl, message: data.message, friends: restored }, 'Đã khôi phục lời mời.');
      });
      if ($('edit-friend-id').value === friend.id) resetFriendForm();
    }
  });

  $('export-data').addEventListener('click', function () {
    try { downloadFile(JSON.stringify(data, null, 2), 'locket-referrals-' + today() + '.json', 'application/json;charset=utf-8'); notify('Đã tạo bản sao lưu JSON.'); }
    catch (error) { notify('Không tạo được tệp sao lưu trên trình duyệt này.'); }
  });
  $('import-data').addEventListener('click', function () { $('import-file').click(); });
  $('import-file').addEventListener('change', function () {
    const file = $('import-file').files[0];
    $('import-file').value = '';
    if (!file) return;
    if (file.size > 1024 * 1024) { notify('Tệp quá lớn. Chỉ nhập JSON tối đa 1 MB.'); return; }
    const reader = new FileReader();
    reader.onerror = function () { notify('Không đọc được tệp đã chọn.'); };
    reader.onload = function () {
      try {
        const result = core.mergeStates(data, JSON.parse(String(reader.result)));
        if (commit(result.state, 'Đã thêm ' + result.added + ' lời mời; giữ nguyên ' + result.skipped + ' bản ghi trùng.')) {
          $('invite-url').value = data.inviteUrl;
          $('invite-message').value = data.message;
        }
      } catch (error) { notify('Không nhập dữ liệu: ' + error.message); }
    };
    reader.readAsText(file);
  });
  $('rescue-storage').addEventListener('click', function () {
    if (recoveryRaw === null) return;
    try {
      downloadFile(recoveryRaw, 'locket-referrals-recovery-' + today() + '.txt', 'text/plain;charset=utf-8');
      recoveryRaw = null;
      $('rescue-storage').hidden = true;
      $('storage-warning').hidden = true;
      notify('Đã tạo bản tải dữ liệu gốc. Bạn có thể nhập bản sao lưu hoặc bắt đầu danh sách mới.');
    } catch (error) { notify('Không tải được dữ liệu gốc. Dữ liệu cũ vẫn được giữ nguyên.'); }
  });

  readStorage();
  $('invite-url').value = data.inviteUrl;
  $('invite-message').value = data.message;
  resetFriendForm();
  render();
}());
