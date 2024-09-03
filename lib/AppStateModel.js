import {BaseModel} from '@ucd-lib/cork-app-utils';
import queryString from 'query-string';
import globalOnClick from './globalOnClick.js';


/**
 * Controller for handling various states of the application.
 * This includes current catalog and page and if we are editing a mark.
 */
class AppStateModel extends BaseModel {

  constructor() {
    super();
    this.register('AppStateModel');
  }

  init(appRoutes) {
    if( typeof window === 'undefined' ) return;

    // inspect global dom clicks and hijack if it's a link to a know app path
    globalOnClick({
      appRoutes,
      callback : e => {
        // the iron-location element sets history state with no info. lame.
        // let's override that.
        this._replaceHistoryState();
        this._onLocationChange()
      }
    });

    this._setLocationObject();
    let location = this._getFullPath();
    window.history.replaceState({location: this.location}, null, location);
    this._onLocationChange();

    window.addEventListener('popstate', e => {
      if( e.state ) {
        this.location = e.state.location;

      // if no state, assume it is the original history entry
      } else {
        this._setLocationObject();
      }

      this._onLocationChange()
    });
  }

  /**
   * @method _replaceHistoryState
   * @description set the location object and string using replaceState.  This should be called
   * after iron-location's location-changed event which doesn't set the location object information.
   */
  _replaceHistoryState(fullpath) {
    this._setLocationObject(fullpath);
    window.history.replaceState({location: this.location}, null, this.location.fullpath);
  }

  /**
   * @method setLocation
   * @description manually set the url location.  This should be used instead of
   * window.location.href = '/foo'.  This method passes location to the global
   * app-route element which handles updating the window.history state and fires
   * the AppStateStore state-update event.
   *
   * @param {String} location new url location
   */
  setLocation(location) {
    if( typeof location === 'object' ) {
      let p = location.path;
      if( location.qs ) {
        let tmp = [];
        for( let key in location.qs ) {
          tmp.push(encodeURIComponent(key)+'='+encodeURIComponent(location.qs[key]));
        }
        p += '?'+tmp.join('&');
      }
      if( location.hash ) p += '#'+location.hash;
      location = p;
    }

    if( window.history.state &&
        window.history.state.location &&
        window.history.state.location.fullpath === location )  {
      return;
    }

    // set state without hash info, this will update window location object,
    // then we parse, then we replace state
    window.history.pushState({}, null, location);

    // finalize state object, send update event
    this._replaceHistoryState(location);

    this._onLocationChange();
  }

  _setLocationObject(fullpath) {
    let query = queryString.parse(window.location.search);
    query = Object.keys(query).length ? query : {};

    this.location = {
      fullpath : fullpath || this._getFullPath(),
      pathname : window.location.pathname.replace(/^\/+/, '/'),
      path : window.location.pathname.replace(/(^\/+|\/+$)/g, '').split('/'),
      query,
      hash : window.location.hash.replace(/^#/, '')
    };
    return location;
  }

  _getFullPath() {
    return window.location.href.replace(window.location.origin, '').replace(/^\/+/, '/');
  }

  _onLocationChange() {
    this.set({
      location : this.location
    });
  }

  /**
   * Get the current redux appState
   * @returns {Object} appState
   */
  async get() {
    return this.store.data;
  }

  /**
   * Update the app state
   * @returns {Object} update - keys to be updated
   */
  set(update) {
    this.store.set(update);
    return this.get();
  }
}

export default AppStateModel;
