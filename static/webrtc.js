navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

function getUserMedia(constaints, onSuccess, onError) {
    navigator.getUserMedia(constaints, onSuccess, onError);
}

function isInnerCandidate(candidate){
  var innerIP = /192.[\d]+.[\d]+.[\d]+/ig;
  return  innerIP.test(candidate);
}

function createPeerConnection(){
    var servers = {
            iceServers: [
                {url: "stun:stun.l.google.com:19302"}
                ]
        };
    var pcConstraint = null;
    return new RTCPeerConnection(servers, pcConstraint);
}

function createDataChannel(peerConnection, type, onopen, onclose, onmessage){
  if(!(peerConnection instanceof RTCPeerConnection)){
      throw new Error('PeerConnection is not valid');
  }
  var dataConstraint = null;
  var dataChannel = peerConnection.createDataChannel(type, dataConstraint);
  dataChannel.onopen = onopen;
  dataChannel.onclose = onclose;
  dataChannel.onmessage = onmessage;
  return dataChannel;
}

function createOffer(peerConnection, enableAudio, enableVideo){
  if(!(peerConnection instanceof RTCPeerConnection)){
      throw new Error('PeerConnection is not valid');
  }
  var options = {
      offerToReceiveAudio: typeof enableAudio === 'undefined' ? 1 : enableAudio,
      offerToReceiveVideo: typeof enableVideo === 'undefined' ? 1 : enableVideo
  };
  return peerConnection.createOffer(options);
}

function createAnswer(peerConnection){
  if(!(peerConnection instanceof RTCPeerConnection)){
      throw new Error('PeerConnection is not valid');
  }
  return peerConnection.createAnswer();
}
