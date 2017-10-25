var pc2 = ( function() {
  var socket = io.connect('http://localhost:8090/');
  var stateLabel = document.getElementById('conn-state');
  var sendBtn = document.getElementById('send-btn')
  var conversionPanel = document.querySelector('.conversions-panel');
  var chatBox = document.getElementById('chat-box');

  var addConversions = function(message, isSelfMsg) {
    var li = document.createElement('li');
    if(isSelfMsg){
      li.className = 'self';
    }
    li.innerHTML = message;
    conversionPanel.appendChild(li);
  }

  var connect = function() {
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
            socket.emit('pc2-candidate', event.candidate);
        }
    }

    conn.ondatachannel = function receiveChannelCallback(event){
      var dataChannel = conn.dataChannel = event.channel;

      dataChannel.onmessage = function(message) {
        addConversions(message.data, false);
      }

      dataChannel.onclose = function() {
        console.log('Remote channel is closed');
      }

      sendBtn.addEventListener('click', function() {
        var data = chatBox.value;
        chatBox.value = '';
        addConversions(data, true);
        if(dataChannel && dataChannel.readyState === 'open'){
          dataChannel.send('pc2: ' + data);
        }
      })
    }

    socket.on('pc1-candidate', function(candidate) {
      conn.addIceCandidate(new RTCIceCandidate(candidate))
        .then(function() {
          console.log('Set remote candidate successfully');
        }, function(err) {
          console.error('Set remote candidate falied ' + err);
        })
    })

    socket.on('pc1-offer', function(answer) {
      conn.setRemoteDescription(answer)
        .then(function() {
          console.log('Set remote desc successfully');
        }, function(err) {
          console.error('Set remote desc failed ' + err);
        })

      createAnswer(conn).then(function(desc) {
        console.log('Create offer successfully.');
        socket.emit('pc2-answer', desc);
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
    })
  }

  
  return {
    work: function() {
      socket.on('pc1-conn-request', function() {
        console.log('Receive pc1 conn request');
        connect();
      })
    }
  }
  
  
} )()