module.exports = subclass => 
  class AppStateInterface extends subclass {
    
    constructor() {
      super();
      this._injectModel('AppStateModel');
    }

    ready() {
      super.ready();

      if( !this._onAppStateUpdate ) return;
      this._getAppState().then(e => this._onAppStateUpdate(e));
    }
    
    _setAppState(state) {
      return this.AppStateModel.set(state);
    }

    _getAppState() {
      return this.AppStateModel.get();
    }

    _setWindowLocation(location) {
      this.AppStateModel.setLocation(location);
    }
  }