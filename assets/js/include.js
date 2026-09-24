(function () {
  var INCLUDE_CACHE = Date.now();

  function loadFile(path) {
    var url = path + (path.indexOf('?') >= 0 ? '&' : '?') + 'cb=' + INCLUDE_CACHE;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    try {
      xhr.overrideMimeType('text/html; charset=utf-8');
      xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      xhr.setRequestHeader('Pragma', 'no-cache');
    } catch (err) {}
    xhr.send();

    if ((xhr.status >= 200 && xhr.status < 300) || (xhr.status === 0 && xhr.responseText)) {
      return xhr.responseText;
    }

    console.error('Could not load ' + path);
    return '';
  }

  function includeHead() {
    var html = loadFile('component/head.html');
    if (html) {
      html = html.replace(/(href="assets\/[^"?]+\.css)(\?[^"]*)?"/g, '$1?v=' + INCLUDE_CACHE + '"');
      document.head.insertAdjacentHTML('beforeend', html);
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
