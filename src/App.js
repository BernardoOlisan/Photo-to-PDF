import './App.css';
import React, {useRef, useEffect, useState} from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

function App() {
  // getting file and converting it on the backend "Connection"
  const [data, setData] = useState([{}])

  const sendFile = (file) => {
    var input = document.querySelector('input[type="file"]')

    var data = new FormData()
    data.append('file', input.files[0])

    fetch('https://pydocs.pythonanywhere.com/convertor', {
        method: 'POST',
        body: data,

    }).then(response => response.json()
    ).then(json => {
        setData('https://pydocs.pythonanywhere.com' + json)
        var data_ = 'https://pydocs.pythonanywhere.com' + json
        console.log(json)
        localStorage.setItem("url", data_);
        alert("Your file is done! It will be eliminated soon")
    });
    console.log('uploaded succesful!')
  }


  // Close modal
  const close = () => {
    var modal = document.getElementById("myModal")
    modal.style.display = "none"
  }



  // The airdrop
  const socket = useRef();
  const peerInstance = useRef();
  const [requested, setRequested] = useState(false);
  const [myUsername, setMyUsername] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [peerUsername, setPeerUsername] = useState("");
  const SOCKET_EVENT = {
      CONNECTED: "connected",
      DISCONNECTED: "disconnect",
      USERS_LIST: "users_list",
      REQUEST_SENT: "request_sent",
      SEND_REQUEST: "send_request",
  };
  const peerConfig = {
      iceServers: [
          {urls: 'stun:stun.l.google.com:19302'},
          {urls: 'stun:stun1.l.google.com:19302'},
          {urls: 'stun:stun2.l.google.com:19302'},
          {urls: 'stun:stun3.l.google.com:19302'},
          {urls: 'stun:stun4.l.google.com:19302'},
      ],
  };
  const sendRequest = (username) => {
      setPeerUsername(username);
      const peer = new Peer({
          initiator: true,
          trickle: false,
          config: peerConfig,
      });
      peer.on("signal", (data) => {
          socket.current.emit(SOCKET_EVENT.SEND_REQUEST, {
              to: username,
              signal: data,
              username: myUsername,
          });
      });

      peerInstance.current = peer;

  };
  const SERVER_URL = "/";
  useEffect(() => {
      socket.current = io.connect(SERVER_URL);

      socket.current.on(SOCKET_EVENT.CONNECTED, (username) => {
          setMyUsername(username)
      });
      socket.current.on(SOCKET_EVENT.USERS_LIST, (users) => {
          setUsersList(users)
      });

      socket.current.on(SOCKET_EVENT.REQUEST_SENT, ({signal, username}) => {
          setRequested(true);
      });
  }, []);

  return (
    <React.Fragment>
      <div>
        <h1 className="header">Photo to Doc</h1>

        <div className='i-button'>
          <label className="input">
              <input onChange={sendFile} type="file" accept="image/*" />
          </label>
        </div>
        <br />
        <br />
        <br />
        <a href={data}>
        <button className="PDF">
          download pdf
        </button></a>
      </div>


      <div>
        {requested &&
          <div id="myModal" class="modal">
            <div class="modal-content">
              <span class="close" onClick={close}>&times;</span>
              <h1><span className='peeruser'>{peerUsername}</span> sent you this PDF</h1>
              <a href={localStorage.getItem("url")}>
              <button className="PDF2">
                Download PDF
              </button></a>
            </div>
          </div>
        }
        <div className='users-connected'>
          <br />
          <br />
          <br />
          <br />
          <br />
          {usersList.length > 1 ? usersList.map(({username, timestamp}) => username !== myUsername &&
            <p class="user-block">
              <strong className='othermyuser'>{username}</strong>
              <p className='otheryou'>Is Connected</p>

              {typeof sendRequest === "function" &&
              <button className='send' onClick={() => {
                          sendRequest(username)
                      }}>Share
                  File</button>}
            </p>

            ) :

            <h1 className='u-connected'>Waiting For Someone to Connect...</h1>           
          }
        </div>


        <p class="myuser-block">
          <p className='you'>You are known as</p>
          <strong className='myuser'>{myUsername}</strong>
        </p>
      </div>

    </React.Fragment>
  );
}

export default App;
