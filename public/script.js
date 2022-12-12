//the socket is connecting to the root path
const socket = io("/")

const peers={}

const videoGrid = document.getElementById("video-grid")

//Create a peer
const myPeer = new Peer(undefined, {
    host: "/",
    port: "3001"
})

//create the video element
const myVideo = document.createElement('video')
//mute your own video
myVideo.muted = true

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream=>{
    myVideoStream = stream
    addVideoStream(myVideo, stream)

    //give the stream back to the caller
    myPeer.on("call", call=>{
        call.answer(stream)

        const video = document.createElement('video')
        call.on("stream", userVideoStream=>{
            addVideoStream(video, userVideoStream)
        })
    })

    //listen to userconnected event
    socket.on("user-connected", userId=>{
        console.log("user connected "+ userId)
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId=>{
    if (peers[userId]) peers[userId].close()
})


//this will be ran after a successful connection to the peer server
myPeer.on("open", id=>{
    //send the event to the server
    socket.emit('join-room', ROOMID,id)
})

function connectToNewUser(userId, stream){
    //calling and sending userId and stream
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')

    //when this event runs, the new user's stream will be sent
    call.on('stream', userVideoStream=>{
        addVideoStream(video, userVideoStream)
    })

    call.on('close', ()=>{
        video.remove()
    })

    peers[userId] = call
}


function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', ()=>{
        video.play()
        console.log("hi")
        videoGrid.append(video)
    })
}


//______________Mute,Stop,Invite buttons
const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});