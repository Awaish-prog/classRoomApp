import React from 'react';
import Home from './routes/Home';
import SignUp from './routes/signUp';
import Login from './routes/Login';
import DashBoard from './routes/DashBoard';
import {
  Routes,
  Route,
} from "react-router-dom";
import CreateClass from './routes/CreateClass';
import JoinClass from './routes/JoinClass';
import Classdashboard from './routes/ClassDashboard';
import Assignment from './routes/Assignment';
import Chat from './routes/chat';
import Submission from './routes/submission';


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