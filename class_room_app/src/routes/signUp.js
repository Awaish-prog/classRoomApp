import { Link, useNavigate } from "react-router-dom";
import { useState} from "react";
import "../css/LoginSignUpJoinClass.css"
export default function SignUp(){
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [ warning, setWarning] = useState(true);
    const navigate = useNavigate();
    async function signUpUser(e){
        
        e.preventDefault();
        const response = await fetch("https://well-glen-romano.glitch.me/api/signUpUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name, email, password,
            }),
        })
        const data = await response.json();
        if(data.user !== "Exists"){
            localStorage.setItem(email, data.token)
        }
        const token = data.token;
        setWarning(true);
        await data.user === "Exists" ? setWarning(false) : navigate('/DashBoard', { replace: true, state: {email, token}}); 
    }
    return(
        <>
            <section className="register">
            <h1>Sign Up</h1>
            <form onSubmit={signUpUser} className="form">
                <input placeholder="Name" className="loginSignUpInput" value={name} type = "text" onChange={ (e) => setName(e.target.value)} required = "required"></input>
                <input placeholder="Email" className="loginSignUpInput" value={email} type = "email" onChange={ (e) => setEmail(e.target.value)} required = "required"></input>
                <input placeholder="Password" className="loginSignUpInput" value={password} type = "password" onChange={ (e) => setPassword(e.target.value)} required = "required"></input>
                <button className="signUpButtonInForm" type="submit">Sign Up</button>
            </form>
            { warning ? null : <p>User already exists</p> }
            <p className="loginSignUpRedirect">have an account? <Link className="redirectLink" to = "/login" >Login Here</Link></p>
            </section>
        </>
    );
}