const socket = io('/')
const videoGrid = document.getElementById('video-grid') // this is to connect to the ejs file
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'  // port number associated,  will be changed to 443 for hosting 
})
let myVideoStream;
const myVideo = document.createElement('video') // temporary video file
myVideo.muted = true;
const peers = {}

// code below will give the stream of video and audio
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream; 
  addVideoStream(myVideo, stream)
  
  // answering to the call from the second user, so that he can also see my feed.
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  // listening to the broadcast message from the server
  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
  // input value
  let text = $("input");
  // when press enter send message and ignore if the message is empty
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      console.log('from text val  ',text.val())
      text.val('')
    }
  });
  // Listening if server is sending any message
  socket.on("createMessage", message => {
    console.log(message);
    $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);  //Appending the message in the frontend
    scrollToBottom()  //Automatically Scrolls to bottom as messages overflow
  })
})

// listening to the broadcast message from the server
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

// mypeer is used for peer to peer connection
myPeer.on('open', id => {
// for second user to join the room
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {

// the second user need to start a call and send their video stream
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

// function to add the video to the ejs file
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play() //  play the video
  })
  videoGrid.append(video) // appending to the ejs file
}


//This function is used to automatically scroll as the messages in the chat window overflows
const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

// Mute the video
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;  //Setting the audio tracks to enabled
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;  //If audio tracks enabled, We will disable it
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;   //If audio tracks not enabled, We will enable it
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;  //Setting the video tracks to enabled
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;    //If video tracks enabled, We will disable it
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;   //If video tracks not enabled, We will enable it
  }
}

//This function is used to change the innerHTML on the mute button to "MUTE"
const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

//This function is used to change the innerHTML on the mute button to "UNMUTE"
const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

//This function is used to change the innerHTML on the mute button to "STOP VIDEO"
const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

//This function is used to change the innerHTML on the mute button to "PLAY VIDEO"
const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}
