import {PolymerElement, html} from "@polymer/polymer/polymer-element"
import "@polymer/app-route/app-location"

import {Mixin, EventInterface} from "@ucd-lib/cork-app-utils"
import queryString from "query-string"
import AppStateInterface from "../lib/AppStateInterface"

class AppRoute extends Mixin(PolymerElement)
      .with(EventInterface, AppStateInterface) {
  
  static get template() {
    return html`<app-location url-space-regex="[[appRoutesRegex]]"></app-location>`;
  }

  static get properties() {
    return {
      route: {
        type: Object
      },
      appRoutes : {
        type : Array,
        value : []
      },
      appRoutesRegex : {
        type : RegExp,
        computed : '_makeRegex(appRoutes)'
      },
      debug : {
        type : Boolean,
        value : false
      }
    }
  }

  constructor() {
    super();
    // register the app-route element with the model
    this.AppStateModel.setLocationElement(this);

    this._setLocationObject();
    let location = window.location.href.replace(window.location.origin, '');
    window.history.replaceState({location: this.location}, null, location);
    this._onLocationChange();

    window.addEventListener('location-changed', e => {
      // the iron-location element sets history state with no info. lame.
      // let's override that.
      this._replaceHistoryState();
      this._onLocationChange()
    });
    window.addEventListener('popstate', e => {
      if( !e.state ) return;
      this.location = e.state.location;
      this._onLocationChange()
    });
  }

  /**
   * @method ready
   * @description wire up debugging if flag set
   */
  ready() {
    super.ready();
    if( this.debug ) this._initDebugging();
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

  _initDebugging() {
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

  /**
   * Fired when user manually sets a path location.  Called from AppStateModel
   * 
   * @param {String} location 
   */
  setWindowLocation(location) {
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

  _makeRegex() {
    let arr = this.appRoutes.map(route => '/'+route+'(/.*)?')
    arr.push('/(\\?|#)+.*');
    arr.push('/');

    let re = '^('+ arr.join('|') + ')$';
    re = new RegExp(re, 'i');
    return re;
  }

  _setLocationObject(fullpath) {
    this.location = {
      fullpath : fullpath || window.location.href.replace(window.location.origin, ''),
      pathname : window.location.pathname,
      path : window.location.pathname.replace(/(^\/|\/$)/g, '').split('/'),
      query : queryString.parse(window.location.search),
      hash : window.location.hash.replace(/^#/, '')
    };
    return location;
  }

  _onLocationChange() {
    this._setAppState({
      location : this.location
    });
  }
}

customElements.define('app-route', AppRoute);