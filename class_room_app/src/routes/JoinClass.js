import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom";

export default function JoinClass(){
    const [ className, setClassName ] = useState("")
    const [ classCode, setClassCode ] = useState("");
    const [ role, setRole ] = useState("");
    const [ warning, setWarning] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    async function joinClass(e){
        e.preventDefault();
        const currentUser = location.state.email;
        let response = await fetch("http://localhost:4000/api/joinClass", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": location.state.token,
            },
            body: JSON.stringify({
                className, role, currentUser, classCode
            }),
        });
        response = await response.json();
        setWarning(response.class)  
        if(response.class === "Joined class")
            navigate('/DashBoard', { replace: true, state: { email: currentUser, token: location.state.token}})
    }
    useEffect(() => {
        if(localStorage.getItem(location.state.email) === ""){
            navigate("/", {replace: true});
        }
    }, [])
    return (
    <section className="createClassSection">
    <h1>Join Class</h1>
    <form className="form" onSubmit={joinClass}>
        <input className="joinClassInput" placeholder="Class Name" value={className} type = "text" onChange={ (e) => setClassName(e.target.value)} required = "required"></input>
        <select className="joinClassInputSelect" value={role} type = "select" onChange={ (e) => setRole(e.target.value)} required = "required">
            <option className="joinClassOption">Student</option>
            <option className="joinClassOption">Teacher</option>
        </select>
        {role === "Teacher" ? <input placeholder="Class Code" className="joinClassInput" value={classCode} type = "text" onChange={ (e) => setClassCode(e.target.value)} required = "required"></input> : null}
        <button className="JoinClassButton" type="submit">Join Class</button>
        {warning === "Exists" ? <p>You are already a part of this class</p> : null}
        {warning === "Class does not exist" ? <p>This Class does not exist</p> : null}
        {warning === "wrong code" ? <p>Please enter a correct class code</p> : null}
    </form>
    </section>)
}