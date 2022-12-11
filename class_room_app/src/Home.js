import React from "react";
import { Link } from "react-router-dom";
import "./Home.css"

function Home() {
  
  
  return (
    <div className="Home">
      <header className="header">
        <h1 className="appName">My Classroom</h1>
        <div className="loginSignUp">
          <p className="loginButton"><Link className="loginButtonLink" to = "/login" >Login</Link></p>
          <p className="signUpButton"><Link className="signUpButtonLink" to = "/signup" >Sign Up</Link></p>
        </div>
      </header>
      <section className="featuresList">
        <ul className="featuresListItems">
          <li className="featuresListItem">Create Class Rooms</li>
          <li className="featuresListItem">Post Assignments</li>
          <li className="featuresListItem">Submit Assignments</li>
          <li className="featuresListItem">Have discussion for each assignment</li>
        </ul>
      </section>
    </div>
  );
}

export default Home;