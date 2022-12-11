import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./LoginSignUpJoinClass.css"
export default function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [ warning, setWarning] = useState(false);
    const navigate = useNavigate();
    async function loginUser(e){
        e.preventDefault();
        const response = await fetch("http://192.168.0.102:4000/api/loginUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email, password,
            }),
        })
        const data = await response.json();
        if(data.login !== "failed"){
            localStorage.setItem(email, data.token)
        }
        const token = data.token;
        await data.login === "failed" ? setWarning(true) : navigate('/DashBoard', { replace: true, state: {  email, token } }); 
    }
    
    return(
        <>
            <section className="register">
            <h1>Login</h1>
            <form onSubmit={loginUser} className="form">
                <input placeholder="Email" className="loginSignUpInput" value={email} type = "email" onChange={ (e) => setEmail(e.target.value)} required = "required"></input>
                <input placeholder="Password" className="loginSignUpInput" value={password} type = "password" onChange={ (e) => setPassword(e.target.value)} required = "required"></input>
                <button className="loginButtonInForm" type="submit">Login</button>
            </form>
            { warning ? <p>User doesn't exist</p> : null }
            <p className="loginSignUpRedirect">Don't have an account? <Link className="redirectLink" to = "/signup" >Create Account</Link></p>
            </section>
        </>
    )
}