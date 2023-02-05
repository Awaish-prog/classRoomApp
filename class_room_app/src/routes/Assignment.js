import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom";
import download from 'downloadjs';
import LogoutButton from "./LogoutButton.js"
import "../css/Assignment.css"
export default function Assignemnt(){
    const navigate = useNavigate()
    const [ assignmentDetails, setAssignmentDetails ] = useState({assignmentName: "", description: "", maxGrades: "", action: "", dueDate : "", postedOn:"", postedBy: "", fileName: "", submissionDetails: {submittedFile: "", remarks: [], grades: "Not graded yet"}, submittersList: []}); 
    const [ selectedFile, setSelectedFile ] = useState(null); 
    const [ lateSubmission, setLateSubmission ] = useState(false);
    const [ fileUploaded , setFileUploaded ] = useState(false)
    const location = useLocation();
    /* This function will get details of the assignment */
    async function getAssignmentDetails(){
        const assignmentName = location.state.assignmentName;
        const currClass = location.state.currentClass;
        const currUser = location.state.currentUser;
        let details = await fetch("/api/getAssignmentDetails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": location.state.token,
            },
            body: JSON.stringify({
                currClass, currUser, assignmentName
            }),
        })
        details = await details.json();
        setAssignmentDetails(details.assignmentDetails);
        setLateSubmission(details.assignmentDetails.submissionDetails.lateSubmission)
    }
    /* This function will send a request to download a assignment file */
    async function handleDownload(fileName, endPoint){
        const currentUser = location.state.currentUser;
        const res = await fetch(`/api/${endPoint}`, {
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
    /* This function sends request to delete submission done by the student */
    async function deleteThisSubmission(submittedFile){
        setAssignmentDetails((prev) => {
            return {...prev, submissionDetails: {submittedFile: "", remarks: [], grades: "Not graded yet"}};
        })
        const currentUser = location.state.currentUser;
        await fetch("/api/deleteThisSubmission", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": location.state.token,
            },
            body: JSON.stringify({
                currentUser, submittedFile
            }),
        })
    }
    async function uploadHandle(e){
        setSelectedFile(e.target.files[0]);
        setFileUploaded(false)
    }
    /* This function sends submission details to the server and posts it */
    async function handlePost(e){
        if(selectedFile === null){
            setFileUploaded(true);
            return;
        }   
        setAssignmentDetails((prev) => {
            prev.submissionDetails.submittedFile = selectedFile.name;
            prev.submissionDetails.submittedOn = new Date().toISOString();
            return prev;
        })
        const assignmentName = location.state.assignmentName;
        const currClass = location.state.currentClass;
        const currUser = location.state.currentUser;
        e.preventDefault();
        const data = new FormData();
        data.append("file", selectedFile);
        data.append("currentUser", currUser);
        data.append("assignmentName", assignmentName);
        data.append("className", currClass);
        let response = await fetch("/api/postSubmission", {
            method: "POST",
            headers: {
                "x-access-token": location.state.token,
            },
            body: data
        })
        response = await response.json();
        setLateSubmission(response.lateSubmission);
        setSelectedFile(null);
    } 
    useState(() => {
        if(localStorage.getItem(location.state.currentUser) === ""){
            navigate("/", {replace: true});
        }
        getAssignmentDetails();
    }, [])
    return(<>
    <LogoutButton email = {location.state.currentUser} />
    {/* section below contains details of the assignment */}
    <section className="assignmentPage">
        <section className="assignmentDetails">
        <h1 className="assignementNameInDetails">{`${assignmentDetails.assignmentName}`}</h1>
        <p className="assignmentDescriptionInDetails">{`${assignmentDetails.description}`}</p> 
        <p>Total Grades: {`${assignmentDetails.maxGrades}`}</p>
        <p>Posted On: {`${assignmentDetails.postedOn.substring(0, 10)} ${assignmentDetails.postedOn.substring(11, 16)}`}</p>
        <p>Posted By: {`${assignmentDetails.postedBy}`}</p> 
        <p>Due Date: {`${assignmentDetails.dueDate.substring(0, 10)}`}</p>
        <p>{`${assignmentDetails.action}`}</p>
        <p>File: {assignmentDetails.fileName === undefined ? <span>No file given for this assignment</span> : <span className="assignmentFileName" onClick={() => {handleDownload(assignmentDetails.fileName, "getFile")}}>{assignmentDetails.fileName}</span>}</p>
        <p className="gotoChatRoom"><Link className="gotoChatRoomLink" to = "/chat" state = {{assignmentName: assignmentDetails.assignmentName, currentUser: location.state.currentUser, currentClass: location.state.currentClass, token: location.state.token}}>Go To Chat Room</Link></p>
        </section>
        {/* This section displays submission details if logged in user is a student,
        if logged in user is a teacher it displays list of submissions done by all students */}
        <section className="submissionDetails">
        {location.state.role === "Teacher" ?
        <div>
        <h2 className="submissionsLabel">Submissions</h2>
        {assignmentDetails.submittersList.length === 0 ? "No Submissions yet" :
        assignmentDetails.submittersList.map((submitter, index) => <div className="submittersListItem" key = {index}><p className="nameInSubmittersListItem"><Link className="linkInSubmittersListItem" to = "/submission" state={{submitterName: submitter.submitterName, submitterEmail: submitter.submitterEmail, assignmentName: location.state.assignmentName, currentClass: location.state.currentClass, maxGrades: assignmentDetails.maxGrades, token: location.state.token, currentUser: location.state.currentUser}}>{submitter.submitterName}</Link></p> <p className="dateInSubmittersListItem">{submitter.submittedOn.substring(0, 10)} {submitter.submittedOn.substring(11, 16)}</p></div>)}
        </div>
         : 
        <div>
            {/* This div contains a form to submit assignment and submission details */}
            {assignmentDetails.submissionDetails.submittedFile === "" ?<>
            <h2>Submit Assigment</h2>
            <div className="fileUploadSection">
            {selectedFile === null ? null :<div className="selectedFileName"><p className="submittedFileNameText">{selectedFile.name}</p></div>}
            <form className="assignmentSubmitForm">
                <label className="uploadButton" for="file"><p className="uploadButtonText">Upload</p><input className="submissionFile" id="file" type="file" name="file" onChange={uploadHandle} required = "required"></input></label>
                {fileUploaded ? <p>please upload a file</p> : null}
                <p onClick={handlePost} className="assignmentSubmitButton">Submit Assignment</p>
            </form></div></> : <p className= {lateSubmission ? "submissionStatus submissionStatusLate" : "submissionStatusOnTime submissionStatus"}>{lateSubmission ? "Late Submission" : "Submitted"}</p>}
            <h2>Your Submission</h2>
            {assignmentDetails.submissionDetails.submittedFile !== "" ? <div>
                <div className="studentSubmission">
                <p className="submittedFileLabel">Submitted File</p>
                <div className="submittedFileName">
                <p onClick={() => {handleDownload(assignmentDetails.submissionDetails.submittedFile, "getSubmittedFile")}}>{assignmentDetails.submissionDetails.submittedFile}</p>
                </div>
                <p className="submittedOnValue">{assignmentDetails.submissionDetails.submittedOn.substring(0, 10)} {assignmentDetails.submissionDetails.submittedOn.substring(11, 16)}</p>
                </div>
            <div className="remarksSection">
            <h2 className="remarksHeading">Remarks</h2>
            {assignmentDetails.submissionDetails.remarks.length === 0 ? <p>No remarks given yet</p> : null}
            <div className="remarksList">{assignmentDetails.submissionDetails.remarks.map((remark, index) => <p key={index} className="remarkInList">{remark}</p>)}</div>
            </div>
            <div className="gradesSection">
            <h2 className="gardesSectionHeading">Grades Earned</h2>
            {assignmentDetails.submissionDetails.grades === -1 ? <p>Not Grades Yet</p> : <p className="earnedGradesTotalGrades"><span className="earnedGrades">{assignmentDetails.submissionDetails.grades}</span>/{assignmentDetails.maxGrades}</p>}
            </div>
            <p className="deleteSubmissionButton" onClick={() => deleteThisSubmission(assignmentDetails.submissionDetails.submittedFile)}>Delete This Submission</p>
            </div>
            : <p>You have not submitted this assignment</p>}
        </div>}
        </section>
    </section>
    
    </>)
}