var {BaseModel} = require('@ucd-lib/cork-app-utils');


/**
 * Controller for handling various states of the application.
 * This includes current catalog and page and if we are editing a mark.
 */
class AppStateModel extends BaseModel {

  constructor() {
    super();
    this.register('AppStateModel');
  }

  /**
   * @method setLocationElement
   * @description Called from app-route element
   * 
   * @param {Element} ele app-route element
   */
  setLocationElement(ele) {
    this.locationElement = ele;
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
    if( !this.locationElement ) {
      return console.warn('Call to setWindowLocation but no locationElement set');
    }
    this.locationElement.setWindowLocation(location);
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

module.exports = AppStateModel;