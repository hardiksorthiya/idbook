(function () {
  var isLocal = location.protocol === 'file:' || /^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname);
  var INCLUDE_CACHE = isLocal ? Date.now() : '1';

  var loaded = {};

  function loadFile(path) {
    if (loaded[path] !== undefined) return loaded[path];
    var url = path + (path.indexOf('?') >= 0 ? '&' : '?') + 'cb=' + INCLUDE_CACHE;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    try {
      xhr.overrideMimeType('text/html; charset=utf-8');
    } catch (err) {}
    xhr.send();

    if ((xhr.status >= 200 && xhr.status < 300) || (xhr.status === 0 && xhr.responseText)) {
      return (loaded[path] = xhr.responseText);
    }

    console.error('Could not load ' + path);
    return '';
  }

  function includeHead() {
    var html = loadFile('component/head.html');
    if (html) {
      html = html.replace(/(href="assets\/[^"?]+\.css)(\?[^"]*)?"/g, '$1?v=' + INCLUDE_CACHE + '"');
      document.write(html);
    }
  }

  function includeScripts() {
    var html = loadFile('component/scripts.html');
    if (html) {
      html = html.replace(/(src="assets\/js\/(?!vendor\/)[^"?]+\.js)(\?[^"]*)?"/g, '$1?v=' + INCLUDE_CACHE + '"');
      document.write(html);
    }
  }

  function insertHTML(el, html) {
    var tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    var scripts = tpl.content.querySelectorAll('script');
    var codes = [];

    Array.prototype.forEach.call(scripts, function (oldScript) {
      codes.push(oldScript.textContent);
      oldScript.remove();
    });

    el.replaceWith(tpl.content);

    codes.forEach(function (code) {
      if (!code || !code.trim()) return;
      var script = document.createElement('script');
      script.textContent = code;
      document.body.appendChild(script);
    });
  }

  function includeHTML() {
    var nodes = document.querySelectorAll('[data-include]');

    Array.prototype.forEach.call(nodes, function (el) {
      var path = el.getAttribute('data-include');
      el.removeAttribute('data-include');
      var html = loadFile(path);

      if (html) {
        html = html.replace(/\{\{(\w+)\}\}/g, function (match, key) {
          return el.dataset[key] || '';
        });
        insertHTML(el, html);
      }
    });

    if (document.querySelector('[data-include]')) {
      includeHTML();
    }
  }

  if (document.head) {
    includeHead();
  }

  window.includeHTML = includeHTML;
  window.includeScripts = includeScripts;
})();
