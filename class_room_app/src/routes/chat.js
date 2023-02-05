import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../css/chat.css"
let sckt;
export default function Chat(){
    const navigate = useNavigate()
    const location = useLocation();
    const [ messages, setMessages ] = useState([]);
    const [ message, setMessage] = useState("");
    const [ name, setName ] = useState(null);
    const messagesEndRef = useRef(null)
    /* This function gets all messages sent in this conversation from the server */
    async function getPreviousChat(){
        const currClass = location.state.currentClass;
        const assignmentName = location.state.assignmentName;
        const currentUser = location.state.currentUser;
        let response = await fetch("/api/getPreviousChat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": location.state.token,
            },
            body: JSON.stringify({
                assignmentName , currClass, currentUser
            }),
        })
        response = await response.json();
        setName(response.userName);
        setMessages(response.messages);
    }
    /* This function sends message to all everyone in that classroom */
    function sendMessage(e){
        if(message === "")
            return;
        e.preventDefault();
        setMessages(prev => [...prev, { message: message, time: new Date().toISOString(), name: name }]);
        sckt.emit("sentMessage", message, location.state.assignmentName, location.state.currentUser, location.state.currentClass);
        setMessage("");
        
    }
    /* This function sets up the socket and joins the converstion for that assignment */
    function setUpSocket(){
        const socket = io("http://localhost:8080");
        socket.emit("joinAssignmentChat", location.state.assignmentName);
        return socket;
    }
    function handleScroll(){
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    useEffect(() => {
        if(localStorage.getItem(location.state.currentUser) === ""){
            navigate("/", {replace: true});
        }
        getPreviousChat();
        sckt = setUpSocket();
        sckt.on("received", ({ message, time, name }) => {
            setMessages(prev => [...prev, { message, time, name }]);
        })
        return () => {
            sckt.off("received");
        }
    }, [])
    useEffect(() => {
        handleScroll()
    }, [messages]);    
    
    return(<>
    <section className="chatSection" onLoad={handleScroll}>
        
    {messages.map((msg, index) => {
        return (<div key={index} className={name === msg.name ? "chatMessageSection chatMessageSectionAlignRight" : "chatMessageSection chatMessageSectionAlignLeft"}>
            <p className = {name === msg.name ? "currentSenderName senderName" : "senderName"}>{msg.name}</p>
            <p className="chatMessage">{msg.message}</p>
            <p className = {name === msg.name ? "currentDateOfSending dateofSending" : "dateofSending"}>{msg.time.substring(0, 10)} {msg.time.substring(11, 16)}</p>
        </div>)
    })}
    <div ref={messagesEndRef} />
    </section>
    <form onSubmit={sendMessage} className="sendMessageForm">
        <input className="messageTextInForm" placeholder="Write your message" type="text" value={message} onChange = {e => setMessage(e.target.value)}></input>
        <p onClick={sendMessage} className="sendMessageButton">Send</p>
    </form>
    
    </>
    )
}