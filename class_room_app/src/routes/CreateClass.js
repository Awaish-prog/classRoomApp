import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom";
export default function CreateClass(){
    const [ className, setClassName ] = useState("")
    const [ classCode, setClassCode ] = useState("");
    const [ warning, setWarning] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    async function createClass(e){
        e.preventDefault();
        const currentUser = location.state.email;
        let response = await fetch("http://localhost:4000/api/createClass", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": location.state.token,
            },
            body: JSON.stringify({
                className, classCode, currentUser
            }),
        })
        response = await response.json();
        await response.class === "Exists" ? setWarning(false) : navigate('/DashBoard', { replace: true, state:{email: currentUser, token: location.state.token}}); 
    }
    useEffect(() => {
        if(localStorage.getItem(location.state.email) === ""){
            navigate("/", {replace: true});
        }
    }, [])
    return (
        <section className="createClassSection">
            <h1>Create Class</h1>
            <form className="form" onSubmit={createClass}>
                <input className="joinClassInput" placeholder="Class Name" value={className} type = "text" onChange={ (e) => setClassName(e.target.value)} required = "required"></input>
                <input className="joinClassInput" placeholder="Class Code" value={classCode} type = "email" onChange={ (e) => setClassCode(e.target.value)} required = "required"></input>
                <button className="JoinClassButton" type="submit">Create Class</button>
            </form>
            {warning ? null : <p>Class with this name is already created, please use a different class name</p> }
        </section>
    )
}