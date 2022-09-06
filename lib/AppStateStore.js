import {BaseStore} from '@ucd-lib/cork-app-utils';

class AppStateStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      location : {}
    }

    this.events = {
      APP_STATE_UPDATE : 'app-state-update'
    }
  }

  set(state) {
    if( !this.stateChanged(this.data, state) ) return;
    this.data = Object.assign({}, this.data, state);
    this.emit(this.events.APP_STATE_UPDATE, this.data);
  }

  get() {
    return this.data;
  }

}

export default AppStateStore;