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
        value : []
      },
      appRoutesRegex : {
        type : RegExp,
        value : '_makeRegex(appRoutes)'
      }
    }
  }

  constructor() {
    super();
    window.addEventListener('location-changed', this._onLocationChange.bind(this));
  }

  ready() {
    super.ready();
    this._onLocationChange();
  }

  _makeRegex() {
    let re = '^('+this.appRoutes
                  .map(route => '/'+route)
                  .push('/')
                  .join('|') + ')';
    this.appRoutesRegex = new RegExp(re, 'i');
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