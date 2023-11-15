const webSocketsService = {};

webSocketsService.install = (Vue, options) => {
  const localOptions = options;
  const localVue = Vue;

  let reconnectInterval = localOptions.reconnectInterval || 1000;

  localVue.prototype.$webSocketsConnect = (uris) => {
    if (uris !== undefined) {
      if (uris.apiSocketPath !== undefined) {
        localOptions.apiSocketPath = uris.apiSocketPath;
      }
    }

    // console.log('webSocketsConnect', localOptions.apiSocketPath);
    const wsSocketPath = new WebSocket(localOptions.apiSocketPath);

    wsSocketPath.onopen = () => {
      // Restart reconnect interval

      localOptions.store.dispatch('setWebSocketChange', 1);
      // console.log('webSocketsConnect onopen', localOptions.reconnectInterval);

      reconnectInterval = localOptions.reconnectInterval || 1000;
    };

    wsSocketPath.onmessage = (event) => {
      // console.log('webSocketsConnect onmessage', event);

      handleNotification(event);
    };

    wsSocketPath.onclose = (event) => {
      // console.log('webSocketsConnect onclose', event);
      localOptions.store.dispatch('setWebSocketChange', 0);

      if (event) {
        // Event.code 1000 is our normal close event
        if (event.code !== 1000) {
          const maxReconnectInterval = localOptions.maxReconnectInterval || 3000;
          setTimeout(() => {
            if (reconnectInterval < maxReconnectInterval) {
              // Reconnect interval can't be > x seconds
              reconnectInterval += 1000;
            }
            localVue.prototype.$webSocketsConnect();
          }, reconnectInterval);
        }
      }
    };

    wsSocketPath.onerror = (error) => {
      console.log('webSocketsConnect onerror', error);
      // ws.close()
    };
  };

  // localVue.prototype.$webSocketsDisconnect = () => {
  //   // Our custom disconnect event
  //   ws.close();
  // };

  // localVue.prototype.$webSocketsSend = (data) => {
  //   // Send data to the backend - use JSON.stringify(data)
  //   ws.send(JSON.stringify(data));
  // };

  /*
    Here we write our custom functions to not make a mess in one function
  */
  function handleNotification(params) {
    localOptions.store.dispatch('setNotifications', params.data);
  }
};

export default webSocketsService;
