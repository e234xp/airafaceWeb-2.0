let webSocketsService = {}

webSocketsService.install = function (Vue, options) {
  let reconnectInterval = options.reconnectInterval || 1000

  Vue.prototype.$webSocketsConnect = (uris) => {
    if (uris != undefined) {
      if (uris.apiSocketPath != undefined)
        options.apiSocketPath = uris.apiSocketPath;
    }

    //console.log("webSocketsConnect apiSocketPath", options.apiSocketPath);
    let wsSocketPath = new WebSocket(options.apiSocketPath);

    wsSocketPath.onopen = () => {
      // Restart reconnect interval
      reconnectInterval = options.reconnectInterval || 1000
    }

    wsSocketPath.onmessage = (event) => {
      //console.log("wsSocketPath onmessage", event.data);

      handleNotification(event)
    }

    wsSocketPath.onclose = (event) => {
      if (event) {
        // Event.code 1000 is our normal close event
        if (event.code !== 1000) {
          let maxReconnectInterval = options.maxReconnectInterval || 3000
          setTimeout(() => {
            if (reconnectInterval < maxReconnectInterval) {
              // Reconnect interval can't be > x seconds
              reconnectInterval += 1000
            }
            Vue.prototype.$webSocketsConnect()
          }, reconnectInterval)
        }
      }
    }

    wsSocketPath.onerror = (error) => {
      //console.log(error)
      // ws.close()
    }
  }

  Vue.prototype.$webSocketsDisconnect = () => {
    // Our custom disconnect event
    ws.close()
  }

  Vue.prototype.$webSocketsSend = (data) => {
    // Send data to the backend - use JSON.stringify(data)
    ws.send(JSON.stringify(data))
  }

  /*
    Here we write our custom functions to not make a mess in one function
  */
  function handleNotification(params) {
    options.store.dispatch('setNotifications', params.data)

  }
}

export default webSocketsService
