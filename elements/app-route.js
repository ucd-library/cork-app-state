import {Element as PolymerElement} from "@polymer/polymer/polymer-element"
import "@polymer/app-route/app-location"

import {Mixin, EventInterface} from "@ucd-lib/cork-app-utils"
import queryString from "query-string"
import AppStateInterface from "../lib/AppStateInterface"

class AppRoute extends Mixin(PolymerElement)
      .with(EventInterface, AppStateInterface) {
  
  static get template() {
    return '<app-location url-space-regex="[[appRoutesRegex]]"></app-location>';
  }

  static get properties() {
    return {
      route: {
        type: Object
      },
      appRoutes : {
        type : Array,
        value : [],
        observer : '_makeRegex'
      },
      appRoutesRegex : {
        type : RegExp,
        value : /\//
      }
    }
  }

  constructor() {
    super();
    this.AppStateModel.setLocationElement(this);
    window.addEventListener('location-changed', this._onLocationChangeAsync.bind(this));
    window.addEventListener('popstate', this._onLocationChangeAsync.bind(this));
  }

  ready() {
    super.ready();
    this._onLocationChange();
  }

  /**
   * Fired when user manually sets a path location.  Called from AppStateModel
   * 
   * @param {String} location 
   */
  setWindowLocation(location) {
    window.history.pushState(null, null, location);
    this._onLocationChange();
  }

  _makeRegex() {
    let arr = this.appRoutes.splice(0);
    arr.push('');

    let re = '^(' +
                arr.map(route => '/'+route)
                   .join('|') 
             + ')';

    this.appRoutesRegex = new RegExp(re, 'i');
  }

  _onLocationChangeAsync() {
    this.debounce('_onLocationChangeAsync', this._onLocationChange, 50);
  }

  _onLocationChange() {
    this.location = {
      pathname : window.location.pathname,
      path : window.location.pathname.replace(/(^\/|\/$)/g, '').split('/'),
      query : queryString.parse(window.location.search)
    }

    this._setAppState({
      location : this.location
    });
  }
}

customElements.define('app-route', AppRoute);