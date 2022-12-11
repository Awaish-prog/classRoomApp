import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import download from 'downloadjs';
import LogoutButton from "./LogoutButton.js"
import "./submission.css"
import "./popUpForms.css"
export default function Submission(){
    const navigate = useNavigate()
    const [ submittedFile, setSubmittedFile] = useState("");
    const [ toggleGradeForm, setToggleGradeForm] = useState(false);
    const [ toggleRemarkForm, setToggleRemarkForm ] = useState(false);
    const [ grades, setGrades ] = useState(0);
    const [ remarks, setRemarks ] = useState("");
    const [ remarksList, setRemarksList ] = useState([]);
    const [ givenGrades, setGivenGrades ] = useState(0);
    const location = useLocation();
    async function handleDownload(fileName, endPoint){
        const currentUser = location.state.currentUser
        const res = await fetch(`http://192.168.0.102:4000/api/${endPoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": location.state.token,
            },
            body: JSON.stringify({
                fileName, currentUser
            }),
        });
        const blob = await res.blob();
        download(blob, fileName);
    }
    async function getSubmissionDetails(){
        const currClass = location.state.currentClass;
        const assignmentName = location.state.assignmentName;
        const email = location.state.submitterEmail;
        const currentUser = location.state.currentUser
        let response = await fetch("http://192.168.0.102:4000/api/getSubmissionDetails", {
            method: "POST",
            headers : {
                "Content-Type": "application/json",
                "x-access-token": location.state.token,
            },
            body: JSON.stringify({
                currClass, assignmentName, email, currentUser
            }),
        })
        response = await response.json();
        setSubmittedFile(response.submissionDetails.submittedFile);
        setGivenGrades(response.submissionDetails.gradesEarned);
        setRemarksList(response.submissionDetails.remarks);
    }
    function handleToggleForGrade(){
        toggleGradeForm ? setToggleGradeForm(false) : setToggleGradeForm(true);
        setToggleRemarkForm(false)
    }
    function handleToggleForRemark(){
        toggleRemarkForm ? setToggleRemarkForm(false) : setToggleRemarkForm(true);
        setToggleGradeForm(false)
    }
    async function handleRemarkSubmit(e){
        e.preventDefault();
        const currClass = location.state.currentClass;
        const assignmentName = location.state.assignmentName;
        const email = location.state.submitterEmail;
        const currentUser = location.state.currentUser
        setRemarksList((prev) => {
            return [...prev, remarks];
        });
        await fetch("http://192.168.0.102:4000/api/setRemarks", {
            method: "POST",
            headers : {
                "Content-Type": "application/json",
                "x-access-token": location.state.token,
            },
            body: JSON.stringify({
                currClass, assignmentName, email, remarks, currentUser
            }),
        })
        setRemarks("");
        setToggleRemarkForm(false)
    }
    async function handleGradesSubmit(e){
        e.preventDefault();
        const currClass = location.state.currentClass;
        const assignmentName = location.state.assignmentName;
        const email = location.state.submitterEmail;
        const currentUser = location.state.currentUser
        setGivenGrades(grades);
        await fetch("http://192.168.0.102:4000/api/setGrades", {
            method: "POST",
            headers : {
                "Content-Type": "application/json",
                "x-access-token": location.state.token,
            },
            body: JSON.stringify({
                currClass, assignmentName, email, grades, currentUser
            }),
        })
        setGrades(0);
        setToggleGradeForm(false)
    }
    useEffect(() => {
        if(localStorage.getItem(location.state.currentUser) === ""){
            navigate("/", {replace: true});
        }
        getSubmissionDetails()
    }, [])
    return (<>
    <LogoutButton email = {location.state.currentUser} />
    <section className="singleSubmissionDetails">
    <h2 className="submittedByLabel">Submitted By: {location.state.submitterName}</h2>
    <p className="gradesInSingleSubmissionDetails">Grades: {givenGrades === -1 ? "Not Graded Yet" : `${givenGrades}/${location.state.maxGrades}`}</p>
    <div className="fileInSingleSubmissionDetails">
    <p onClick={() => {handleDownload(submittedFile, "getSubmittedFile")}}>File: <span className="fileNameInSingleSubmissionDetails" >{submittedFile}</span></p>
    </div>
    <div>
        <h4 className="remarksLabel">Remarks:</h4>
        {remarksList.length === 0 ? <p className="singleRemark">No remarks given yet</p> : remarksList.map((remark, index) => <p className="singleRemark" key={index}>{remark}</p>)}
        </div>
    <div className="gradesRemarksFormSection">
    <p className="showGradesFormButton" onClick={handleToggleForGrade}>Show grades Form</p>
    {toggleGradeForm ? <section className="gradesFormSection"><form className="gradesRemarksForm" onSubmit={handleGradesSubmit}>
        <input className="gradesFormInput" placeholder="Enter Grades" type="number" value={grades} onChange={e => setGrades(e.target.value)} required = "required" min={1}></input>
        <button className="gradesSubmitButton" type="submit">Submit</button>
    </form></section> : null}
    <p className="showRemarksFormButton" onClick={handleToggleForRemark}>Show reamrks Form</p>
    {toggleRemarkForm ? <section className="remarksFormSection"><form className="gradesRemarksForm" onSubmit={handleRemarkSubmit}>
        <textarea rows="4" className="remarksFormInput" placeholder="Enter Remark" type="text" value={remarks} onChange={e => setRemarks(e.target.value)} required = "required"></textarea>
        <button className="remarksSubmitButton" type="submit">Submit</button>
    </form></section> : null}
    </div>
    </section>
    </>)
}