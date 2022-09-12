# cork-app-state
Base AppStateModel class

This library is for SPA location routing based on event.  These base classes leverage the cork-app-utils event flow.  The standard work flow is as follows:

  - A `<a>` tag is clicked with a relative link path that is registered to the SPA.
  - The event is intercepted by the cork-app-state library
  - The cork-app-state library sets the correct browser history state and url path.
  - additional route/path logic is set in the AppStoreModel by overridding the `set` method.
  - A `cork-app-utils` event is sent on the event bus via the AppStateStore.

Additionally you can use the AppStateModel.setLocation() method to manually set a
path.

## Setup

```js
import AppStateModel from '../src/models/AppStateModel.js'

// initialize base routes to handle.
AppStateModel.init(['record', 'collection', 'about']);
```

## Example

Example Model:

```js
import {AppStateModel} from '@ucd-lib/cork-app-state';
import AppStateStore from '../stores/AppStateStore.js';

class AppStateModelImpl extends AppStateModel {

  constructor() {
    super();

    if( !window.gtag || !config.gaCode ) {
      console.warn('No global gtag variable set for analytics events');
    }

    this.defaultPage = 'home';
    this.store = AppStateStore;
  }



  set(update) {
    // set a default page
    if( !update.location.path.length ) {
      update.page = this.defaultPage;
    } else {
      update.path = update.location.path[0];
    }
    
    let res = super.set(update);

    // do some google analytics stuff
    // ga.sendPageView();

    return res;
  }

}

const instance = new AppStateModelImpl();
export default instance;
```

Example store:

```js
import {AppStateStore} from '@ucd-lib/cork-app-state';

class AppStateStoreImpl extends AppStateStore {}

const instance = new AppStateStoreImpl();
export default instance;
```