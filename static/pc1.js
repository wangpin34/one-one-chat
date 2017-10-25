var pc1 = ( function() {
  var socket = io.connect('http://localhost:8090/');
  var stateLabel = document.getElementById('conn-state');
  var connBtn = document.getElementById('conn-btn');
  var sendBtn = document.getElementById('send-btn')
  var conversionPanel = document.querySelector('.conversions-panel');
  var chatBox = document.getElementById('chat-box');

  /*
   * state: disconnect, connecting, connected
   * when click: to connect, to cancel, nothing
   */
  var states = {
    DISCONNECT: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected'
  }
  //The init state
  var connectState = states.DISCONNECT;

  var addConversions = function(message, isSelfMsg) {
    var li = document.createElement('li');
    if(isSelfMsg){
      li.className = 'self';
    }
    li.innerHTML = message;
    conversionPanel.appendChild(li);
  }


  connBtn.addEventListener('click', function() {
    switch(connectState) {
      case states.DISCONNECT: connect() ;break;
      case states.CONNECTING: /*to cancel*/;break;
      case states.CONNECTED: /*do nothing*/;break;
      default: /*do nothing*/;
    }
  })

  var connect = function() {

    socket.emit('pc1-conn-request');

    var candidateFired = false;
    conn = createPeerConnection();

    if(window.syncStateToUI){
      window.clearInterval(window.syncStateToUI);
    }

    window.syncStateToUI = setInterval( function() {
        stateLabel.innerText = conn.iceConnectionState;
      }, 500 )

    conn.oniceconnectionstatechange = function(event) {
        connectState = conn.iceConnectionState;
        console.log('iceConnection state: %s', conn.iceConnectionState);
    }

    conn.onsignalingstatechange = function(event) {
        console.log('signaling state: %s', conn.signalingState);
    }

    conn.onicecandidate = function(event) {
        //http://stackoverflow.com/questions/27926984/webrtc-onicecandidate-fires-21-times-is-it-ok
        if(candidateFired) return;
        if(event.candidate && event.candidate.candidate){
            console.log(event.candidate.candidate);
            candidateFired = true;
            socket.emit('pc1-candidate', event.candidate);
        }
    }

    var dataChannel = conn.dataChannel = createDataChannel(conn, 'dataChannel', 
      
      function onopen() {
        if(this.readyState === "open") {
          console.log('Local channel is opened');
          sendBtn.addEventListener('click', function() {
            var data = chatBox.value;
            chatBox.value = '';
            addConversions(data, true);
            if(dataChannel && dataChannel.readyState === 'open'){
              dataChannel.send('pc1: ' + data);
            }
          })
        }
      },
      
      function onclose() {
        console.log('Local channel is closed');
      },
      
      function onmessage(message) {
        addConversions(message.data, false);
      }
    )

    socket.on('pc2-candidate', function(candidate) {
      conn.addIceCandidate(new RTCIceCandidate(candidate))
        .then(function() {
          console.log('Set remote candidate successfully');
        }, function(err) {
          console.error('Set remote candidate falied ' + err);
        })
    })

    socket.on('pc2-answer', function(answer) {
      conn.setRemoteDescription(answer)
        .then(function() {
          console.log('Set remote desc successfully');
        }, function(err) {
          console.error('Set remote desc failed ' + err);
        })
    })

    createOffer(conn).then(function(desc) {
      console.log('Create offer successfully.');
      socket.emit('pc1-offer', desc);
      return conn.setLocalDescription(desc)
    })
    .then(function() {
      console.log('Set local desc successfully.');
    }, function() {
      console.error('Set local desc failed.');
    })
    .catch(function(e) {
      console.error(e)
    })
  }

  
  return {
    work: function() {
      
    }
  }
  
  
} )()