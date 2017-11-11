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
    window.addEventListener('location-changed', this._onLocationChange.bind(this));
    window.addEventListener('popstate', this._onLocationChange.bind(this));
  }

  ready() {
    super.ready();
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

  _onLocationChange() {
    this.debounce('_onLocationChange', this._onLocationChangeAsync, 50);
  }

  _onLocationChangeAsync() {
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