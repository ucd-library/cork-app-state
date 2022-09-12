/**
 * Port of the old Polymer iron-location element logic.  Just the bits we need.
 */

let _urlSpaceRegExp;
let _callback;
let appRoutes;
let _location = window.location;

function init(opts) {
  _urlSpaceRegExp = _makeRegex(opts.appRoutes);
  appRoutes = opts.appRoutes;
  _callback = opts.callback;
  if( opts.debug ) {
    _initDebugging();
  }

  document.addEventListener('click', _globalOnClick);
}

/**
 * A necessary evil so that links work as expected. Does its best to
 * bail out early if possible.
 *
 * @param {MouseEvent} event .
 */
function _globalOnClick(event) {
  // If another event handler has stopped this event then there's nothing
  // for us to do. This can happen e.g. when there are multiple
  // iron-location elements in a page.
  if (event.defaultPrevented) {
    return;
  }

  var href = _getSameOriginLinkHref(event);

  if (!href) {
    return;
  }

  event.preventDefault();

  // If the navigation is to the current page we shouldn't add a history
  // entry or fire a change event.
  if (href === _location.href) {
    return;
  }

  window.history.pushState({}, '', href);
  // this.fire('location-changed', {}, {node: window});
  _callback();
}

/**
 * Returns the absolute URL of the link (if any) that this click event
 * is clicking on, if we can and should override the resulting full
 * page navigation. Returns null otherwise.
 *
 * @param {MouseEvent} event .
 * @return {string?} .
 */
function _getSameOriginLinkHref(event) {
  // We only care about left-clicks.
  if (event.button !== 0) {
    return null;
  }

  // We don't want modified clicks, where the intent is to open the page
  // in a new tab.
  if (event.metaKey || event.ctrlKey) {
    return null;
  }

  // var eventPath = dom(event).path;
  var eventPath = event.composedPath();
  var anchor = null;

  for (var i = 0; i < eventPath.length; i++) {
    var element = eventPath[i];

    if (element.tagName === 'A' && element.href) {
      anchor = element;
      break;
    }
  }

  // If there's no link there's nothing to do.
  if (!anchor) {
    return null;
  }

  // Target blank is a new tab, don't intercept.
  if (anchor.target === '_blank') {
    return null;
  }

  // If the link is for an existing parent frame, don't intercept.
  if ((anchor.target === '_top' || anchor.target === '_parent') &&
      window.top !== window) {
    return null;
  }

  // If the link is a download, don't intercept.
  if (anchor.download) {
    return null;
  }

  var href = anchor.href;

  // It only makes sense for us to intercept same-origin navigations.
  // pushState/replaceState don't work with cross-origin links.
  var url;

  if (document.baseURI != null) {
    url = new URL(href, /** @type {string} */ (document.baseURI));
  } else {
    url = new URL(href);
  }

  var origin;

  // IE Polyfill
  if (_location.origin) {
    origin = _location.origin;
  } else {
    origin = _location.protocol + '//' + _location.host;
  }

  var urlOrigin;

  if (url.origin) {
    urlOrigin = url.origin;
  } else {
    // IE always adds port number on HTTP and HTTPS on <a>.host but not on
    // window.location.host
    var urlHost = url.host;
    var urlPort = url.port;
    var urlProtocol = url.protocol;
    var isExtraneousHTTPS = urlProtocol === 'https:' && urlPort === '443';
    var isExtraneousHTTP = urlProtocol === 'http:' && urlPort === '80';

    if (isExtraneousHTTPS || isExtraneousHTTP) {
      urlHost = url.hostname;
    }
    urlOrigin = urlProtocol + '//' + urlHost;
  }

  if (urlOrigin !== origin) {
    return null;
  }

  var normalizedHref = url.pathname + url.search + url.hash;

  // pathname should start with '/', but may not if `new URL` is not supported
  if (normalizedHref[0] !== '/') {
    normalizedHref = '/' + normalizedHref;
  }

  // If we've been configured not to handle this url... don't handle it!
  if (_urlSpaceRegExp && !_urlSpaceRegExp.test(normalizedHref)) {
    return null;
  }

  // Need to use a full URL in case the containing page has a base URI.
  var fullNormalizedHref = new URL(normalizedHref, _location.href).href;
  return fullNormalizedHref;
}

function _makeRegex(appRoutes) {
  let arr = appRoutes.map(route => '/'+route+'(\\?|#|/|$).*')
  arr.push('/(\\?|#)+.*');
  arr.push('/');

  let re = '^('+ arr.join('|') + ')$';
  re = new RegExp(re, 'i');
  return re;
}

function _initDebugging() {
  let pushState = history.pushState;
  let replaceState = history.replaceState;
  
  history.pushState = function(state) {
    let event = new CustomEvent('history-push-state', {detail: state});
    window.dispatchEvent(event);
    return pushState.apply(history, arguments);
  };

  history.replaceState = function(state) {
    let event = new CustomEvent('history-replace-state', {detail: state});
    window.dispatchEvent(event);
    return replaceState.apply(history, arguments);
  };

  window.addEventListener('history-push-state', e => console.log('history-push-state', e.detail));
  window.addEventListener('history-replace-state', e => console.log('history-replace-state', e.detail));
}

export default init;