import { sendMessage } from './signal2';

/****************************************************************************
 * WebRTC peer connection and data channel
 ****************************************************************************/

const configuration = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302',
  }],
};

let peerConn;
let dataChannel;

export function addStream(peer, stream) {
  console.log('stream', stream);
  peer.addStream(stream);
  peer.createOffer()
    .then(createLocalSession)
    .catch(console.warn);
}

export function addChannel(peer) {
  dataChannel = peer.createDataChannel('chat', {
    negotiated: true,
    id: 0,
  });
  // onDataChannelCreated(dataChannel);
  return peer.createOffer()
    .then(createLocalSession)
    .then(() => {
      return dataChannel;
    })
    .catch((error) => {
      console.log('had an error');
    });
}


function setupInitiator(peerConn, localStream) {
  return new Promise((resolve, reject) => {
    // console.log('Creating an offer');

    setTimeout(() => {
      // console.log('Creating Offer');
      // dataChannel = peerConn.createDataChannel('chat', {
      //   negotiated: true,
      //   id: 0,
      // });
      // onDataChannelCreated(dataChannel);
      // peerConn.createOffer()
      //   .then(createLocalSession)
      //   .catch((error) => {
      //     console.log('error', error);
      //   });
      // peerConn.ondatachannel = function (event) {
      //   console.log('ondatachannel:', event.channel);
      //   dataChannel = event.channel;
      //   onDataChannelCreated(dataChannel);
      //   resolve({ peer: peerConn, dataChannel });
      // };
    }, 1000);


    // Add local stream to connection and create offer to connect.
    // setTimeout(() => {
    //   console.log('localStream', localStream);
    //   peerConn.addStream(localStream);
    //   peerConn.createOffer(createLocalSession, console.warn);
    // }, 1000);

    resolve({ peer: peerConn, dataChannel });
  });
}

function setupJoiner(peerConn) {
  return new Promise((resolve, reject) => {
    console.log('waiting for dataChannel');
    peerConn.ondatachannel = function (event) {
      console.log('ondatachannel:', event.channel);
      dataChannel = event.channel;
      onDataChannelCreated(dataChannel);
      resolve({ peer: peerConn, dataChannel });
    };

    //
    // // Handles remote MediaStream success by adding it as the remoteVideo src.
    // function gotRemoteMediaStream(event) {
    //   console.log('-------gotRemoteMediaStream-------');
    //   // console.log('event', event);
    //   console.log('event.stream', event.stream);
    //   console.log('-------gotRemoteMediaStream-------');
    //   // const mediaStream = event.stream;
    //   // remoteVideo.srcObject = mediaStream;
    //   // remoteStream = mediaStream;
    //   // trace('Remote peer connection received remote stream.');
    // }
    //
    // peerConn.addEventListener('addstream', gotRemoteMediaStream);
    // peerConn.onaddstream = gotRemoteMediaStream;
    // console.log('peerConn.onaddstream', peerConn.onaddstream);
  });
}

export function createPeerConnection(isInitiator, localStream) {
  console.log('Creating Peer connection as initiator?', isInitiator);
  peerConn = new RTCPeerConnection(configuration);

  // send any ice candidates to the other peer
  peerConn.onicecandidate = function (event) {
    // console.log('icecandidate event:', event);
    if (event.candidate) {
      sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
      });
    } else {
      // console.log('End of candidates.');
    }
  };

  if (isInitiator) {
    return setupInitiator(peerConn, localStream);
  } else {
    return setupInitiator(peerConn, localStream);
    // return setupJoiner(peerConn);
  }
}

function createLocalSession(desc) {
  console.log('🔄🔄🔄🔄🔄local session created:', desc.type);
  return peerConn.setLocalDescription(desc)
    .then(() => {
      // console.log('sending local desc:', peerConn.localDescription);
      sendMessage(peerConn.localDescription);
    })
    .catch((error) => {
      console.log('error', error);
    });
}

function onDataChannelCreated(channel) {
  // console.log('onDataChannelCreated:', channel);

  channel.onopen = () => {
    // console.log('CHANNEL opened!!!');
    // shareBtn.disabled = false;
  };

  channel.onclose = () => {
    // console.log('Channel closed.');
    // shareBtn.disabled = true;
  };

  channel.onmessage = (event) => {
    console.log('event.data', event.data);
    // addChatMessage('Peer:' + event.data);
  };
}

let candidatesQueue = [];
let remoteDescSet = false;

export function signalingMessageCallback(message) {
  const noOP = () => void 0;
  if (message.type === 'offer') {
    console.log('Got offer. Sending answer to peer.');

    const description = new RTCSessionDescription(message);
    peerConn.setRemoteDescription(description)
      .then(() => {
        remoteDescSet = true;
        candidatesQueue.forEach((candidate) => {
          peerConn.addIceCandidate(candidate);
        });
        candidatesQueue = [];
        peerConn.createAnswer()
          .then(createLocalSession)
          .catch(console.warn);
      })
      .catch(console.warn);

  } else if (message.type === 'answer') {
    console.log('🉑🉑🉑🉑Got answer.🉑🉑🉑🉑');
    const description = new RTCSessionDescription(message);
    peerConn.setRemoteDescription(description)
      .then(() => {
        remoteDescSet = true;
        candidatesQueue.forEach((candidate) => {
          peerConn.addIceCandidate(candidate);
        });
        candidatesQueue = [];
      })
      .catch(console.warn);
  } else if (message.type === 'candidate') {
    const candidate = new RTCIceCandidate({ candidate: message.candidate });
    if (remoteDescSet) {
      peerConn.addIceCandidate(candidate);
    } else {
      candidatesQueue.push(candidate);
      console.log('candidatesQueue', candidatesQueue);
    }
  }
}


export function getDataChannel() {
  return dataChannel;
}

