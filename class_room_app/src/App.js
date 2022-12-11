import React from 'react';
import Home from './Home';
import SignUp from './signUp';
import Login from './Login';
import DashBoard from './DashBoard';
import {
  Routes,
  Route,
} from "react-router-dom";
import CreateClass from './CreateClass';
import JoinClass from './JoinClass';
import Classdashboard from './ClassDashboard';
import Assignment from './Assignment';
import Chat from './chat';
import Submission from './submission';


export default function App(){
    return(<>
        <Routes>
            <Route path = "/" element = { <Home />} />
            <Route path = "/signup" element = { <SignUp /> } />
            <Route path = "/login" element = { <Login /> } />
            <Route path = "/DashBoard" element = {<DashBoard />} />
            <Route path = "/createClass" element = {<CreateClass />} />
            <Route path = "/joinClass" element = {<JoinClass />} />
            <Route path = "/classDashboard" element = {<Classdashboard />} />
            <Route path = "/assignmentPage" element = {<Assignment />} />
            <Route path = "/chat" element = {<Chat />} />
            <Route path = "/submission" element = {<Submission />}/>
        </Routes>
    </>
    )
}