import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import Announcements from "./Announcements";
import AssignmentsList from "./AssignmentsList";
import LogoutButton from "./LogoutButton.js"
import "../css/ClassDashboard.css"
import notificationIcon from "../images/81c46629b9429e456dfa456e33f27660.png"
import membersIcon from "../images/983470-200.png"
export default function Classdashboard(){
    const [ teachers, setTeachers ] = useState([]);
    const [ students, setStudents ] = useState([]);
    const [ role, setRole ] = useState("");
    const [ toggleMembersList, setToggleMembersList ] = useState(false);
    const [ toggleAnnouncementsList, setToggleAnnouncementsList ] = useState(false);
    const [ hideMembersList, setHideMembersList ] = useState(false);
    const [ hideAnnouncementsList, setHideAnnouncementsList ] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    /* This function gets list of all class members */
    async function getMembersList(currClass, currentUser){
        let response = await fetch("http://localhost:4000/api/getMemberslist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": location.state.token,
            },
            body: JSON.stringify({
                currClass, currentUser
            }),
        })
        response = await response.json();
        setTeachers(response.teachers);
        setStudents(response.students);
        setRole(response.currentRole);
    }
    /* This functions removes a user from the classrom */
    async function leaveClassRoom(leavingUser, role = ""){
        const currentUser =  location.state.currentUser;
        const currentClass = location.state.currentClass;
        setStudents((prev) => {
            return prev.filter(student => student.student.email !== leavingUser);
        })
        const response = await fetch("http://localhost:4000/api/leaveClassRoom", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": location.state.token,
            },
            body: JSON.stringify({
                currentClass, leavingUser, currentUser
            }),
        })
        if(role !== "Student")
            navigate('/DashBoard', { replace: true, state: {email: leavingUser, token: location.state.token }}); 
    }
    function displayMembersList(){
        toggleMembersList ? setHideMembersList(true) : setHideMembersList(false);
        toggleMembersList ? setToggleMembersList(false) : setToggleMembersList(true);
        setToggleAnnouncementsList(false);
    }
    function displayAnnouncementsList(){
        toggleAnnouncementsList ? setHideAnnouncementsList(true) : setHideAnnouncementsList(false);
        toggleAnnouncementsList ? setToggleAnnouncementsList(false) : setToggleAnnouncementsList(true);
        setToggleMembersList(false);
    }
    useEffect(() => {
        if(localStorage.getItem(location.state.currentUser) === ""){
            navigate("/", {replace: true});
        }
        getMembersList(location.state.currentClass, location.state.currentUser);
    }, [])
    return(<>
    <section className="classDetails">
    <LogoutButton email = {location.state.currentUser} />
        <section className="headingSection">
        <section className="classHeadingSection">
            <h1 className="classHeading">{location.state.currentClass}</h1>
            <p className="leaveClassButton" onClick={() => leaveClassRoom(location.state.currentUser)}>Leave this class room</p>
        </section>
        <section className="memberAnnouncementButtons">
            <img onClick={displayAnnouncementsList} className="notificationIcon" src={notificationIcon}></img>
            <img onClick={displayMembersList} className="membersIcon" src={membersIcon}></img>
        </section>
        </section>
        <section className="classContent">
            <section className={toggleMembersList ? "classMembersOnClick classMembers" : hideMembersList ?"hideClassMembers classMembers" : "classMembers"}>
            <h2>Members List</h2>
            <h3 className="memberCategory">Teachers</h3>
            <ul>
                {teachers.map((teacher, index) => <li className="membersListItem" key={index}>{teacher.name}</li>)}
            </ul>
            <h3 className="memberCategory">Students</h3>
            <ul>
                {students.map((student, index) => <li className="membersListItem studentListItem" key={index}><p className="studentNames">{student.student.name}</p>{role === "Teacher" ? <p className="removeButton" onClick={() => leaveClassRoom(student.student.email, student.role)}>Remove</p>: null}</li>)}
            </ul>
            </section>
            
            <AssignmentsList role = {role}  currentClass = {location.state.currentClass} currentUser = {location.state.currentUser} token = {location.state.token} />
            <Announcements role = {role} toggleAnnouncementsList = {toggleAnnouncementsList} currentClass = {location.state.currentClass} hideAnnouncementsList = {hideAnnouncementsList} currentUser = {location.state.currentUser} token = {location.state.token}/>
        </section>
        </section>
    </>
    )
}