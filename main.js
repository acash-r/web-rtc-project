let APP_ID = "2ff155070a054c50a62ceef732622f11";

let token = null;
let uid = String(Math.floor(Math.random() * 100000));

let client;
let channel;

let localStream;
let remoteStream;
let peerConnection;

const servers = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
};
let init = async () => {
  client = AgoraRTM.createInstance(APP_ID);
  await client.login({ uid, token });

  channel = await client.createChannel("main");
  await channel.join();

  channel.on("MemberJoined", handleUserJoined);

  localStream = await navigator.mediaDevices.getUserMedia({
    // audio: true,
    video: true,
  });
  document.getElementById("user-1").srcObject = localStream;
  createPeerConnection();
};

let handleUserJoined = async (MemberId) => {
  console.log("MemberId", MemberId);
  createOffer(MemberId);
};

let createPeerConnection = async () => {
  peerConnection = new RTCPeerConnection(servers);

  remoteStream = new MediaStream();
  document.getElementById("user-2").srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      console.log("candidate", event.candidate);
    }
  };
  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  client.sendMessageToPeer(
    {
      text: JSON.stringify({ sdp: offer.sdp, type: offer.type }),
    },MemberId
  )
};

init();
