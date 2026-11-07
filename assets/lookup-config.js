(function () {
  const local = ['127.0.0.1', 'localhost'].includes(window.location.hostname);
  window.LocketLookupConfig = {
    enabled: local,
    endpoint: local ? '/api/locket/lookup' : 'https://anhhphuongg-lookup-api.biggerdotterel.chatgpt.site/api/locket/lookup'
  };
}());
