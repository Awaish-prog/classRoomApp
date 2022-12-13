import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../css/DashBoard.css"
import LogoutButton from "./LogoutButton.js"

export default function DashBoard(){
    const [ classList, setClassList ] = useState([]);
    const navigate = useNavigate()
    const [ name, setName ] = useState("")
    const location = useLocation();
    async function getClasslist(currUser){
        
        let response = await fetch("http://localhost:4000/api/getClassList", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": location.state.token,
            },
            body: JSON.stringify({
                currUser
            }),
        })
        response = await response.json();
        setName(response.name);
        setClassList(response.list);  
    }
    
    useEffect(() => {
        if(localStorage.getItem(location.state.email) === ""){
            navigate("/", {replace: true});
        }
        getClasslist(location.state.email);
        
    }, [])
    
    
    return(<section className="dashboard">
            <section className="dashboardContent">
            <LogoutButton email = {location.state.email}/>
            <header className="dashboardHeader">   
            <h1 className="dashboardName">Welcome {name}</h1>
            <div className="buttons">
            <p className="joinClassButton"><Link className="link" to="/joinClass" state={{ email: location.state.email, token: location.state.token}}>Join Class</Link></p>
            <p className="createClassButton"><Link className="link" to="/createClass" state={{ email: location.state.email, token: location.state.token}}>Create Class</Link></p>
            </div>
            </header>
            <section className="classList">
                {classList.map((listItem, index) => {
                    return (
                        
                    <Link className="classLink" to = "/classDashboard" state = {{currentClass: listItem.className, currentUser:   location.state.email, token: location.state.token, loggedIn: location.state.loggedIn}} ><div key = {index} className="class">
                        <h2 className="name">{`${listItem.className}`}</h2>
                        <p className="role">Your role:{`${listItem.role}`}</p>
                        </div>
                    </Link>)
                })}
            </section>
            </section>
        </section>
    )
}