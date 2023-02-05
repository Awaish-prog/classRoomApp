import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/ClassDashboard.css"
import "../css/popUpForms.css"
export default function AssignmentsList({ role, currentClass, currentUser, token }){
    const location = useLocation()
    const [ selectedFile, setSelectedFile ] = useState(null)
    const [ assignmentName, setAssignmentName ] = useState("");
    const [ assignmentDescription, setAssignmentDescription] = useState("");
    const [ maxGrades, setMaxGrades] = useState(0);
    const [ dueDate, setDueDate ] = useState(""); 
    const [ showAssignemntForm, setShowAssignemntForm] = useState(false)
    const [ updateList, setUpdateList ] = useState(false)
    const [ assignmentsList, setAssignmentsList] = useState([{assignmentName:"", postedBy: ""}])
    function toggelShowForm(){
        showAssignemntForm === true ? setShowAssignemntForm(false) : setShowAssignemntForm(true)
    }
    /* This function gets all assignments given in this class */
    async function getAssigmentsList(){
        const currClass = currentClass
        if(currClass !== null){
            let response = await fetch("/api/getAssignmentsList", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": token,
                },
                body: JSON.stringify({
                    currentUser ,currClass
                }),
            })
            response = await response.json();
            setAssignmentsList(response.assignmentsList);
        }
    }
    function uploadHandle(e){
        setSelectedFile(e.target.files[0]);
    }
    /* This function posts a new assignment to the server */
    async function handlePost(e){
        e.preventDefault();
        const data = new FormData();
        data.append("name", assignmentName);
        data.append("description", assignmentDescription);
        data.append("maxGrades", maxGrades);
        data.append("file", selectedFile);
        data.append("dueDate", dueDate);
        data.append("currentUser", currentUser);
        data.append("currentClass", currentClass);
        await fetch("/api/postAssignment", {
            method: "POST",
            headers: {
                "x-access-token": token,
            },
            body: data
        })
        setSelectedFile(null);
        setAssignmentName("");
        setAssignmentDescription("");
        setMaxGrades(0);
        setDueDate("")
        setShowAssignemntForm(false)
        setUpdateList(true)
    } 
    /* This function sends request to delete this assignment to the server */
    async function deleteThisAssignment(assignmentName){
        setAssignmentsList((prevAssignmentsList) => {
            return prevAssignmentsList.filter(prevAssignment => prevAssignment.assignmentName !== assignmentName);
        })
        await fetch("/api/deleteAssignment", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": token,
            },
            body: JSON.stringify({
                currentClass, assignmentName, currentUser
            }),
        })
    }
    useEffect(() => {
        
        getAssigmentsList();
    }, [updateList])
    return(<>
        <section className="assignmentsList">
            <div>
            <h2>Assignemnts</h2>
            {assignmentsList.length === 0 ? <p>No Assignemnts given yet</p> :
            <>
            {assignmentsList.slice(0).reverse().map((assignment, index) => {
                return (<div className="assignmentInList" key={index}>
                <div className="assignmentDetailInList">
                <h3 className="assignmentNameInList"><Link className="assignmentLink" to="/assignmentPage" state={{assignmentName: assignment.assignmentName, currentClass: currentClass, currentUser: currentUser, role: role, token: token}}>{assignment.assignmentName}</Link></h3>
                <p className="postedByInList">{`Posted By: ${assignment.postedBy}`}</p>
                </div>
                {role === "Teacher" ? <p className="deleteAssignmentButton" onClick={() => deleteThisAssignment(assignment.assignmentName)}>Delete This Assignment</p> : null}
                </div>)
            })}</>}
            </div>
            <div>
            {role === "Teacher" ? <button className="giveAssignmentButton" onClick={toggelShowForm}>Give Assignment</button> : null}
            {role === "Teacher" ? (               
                showAssignemntForm === true ?
                (<section className="assignmentFormSection">
                <form onSubmit={handlePost} className="assignmentForm">
                    <lable><span className = "assignmentFormLabel">Assignment Name:</span> <input className="assignmentFormInput" type="text" name="name" value={assignmentName} onChange = {e => {setAssignmentName(e.target.value)}} required = "required"></input></lable>
                    <label><span className = "assignmentFormLabel">Description:</span> <textarea className="assignmentFormInput" type="text" name="description" rows="4" value={assignmentDescription} onChange = {e => {setAssignmentDescription(e.target.value)}}  required = "required"></textarea></label>
                    <label><span className = "assignmentFormLabel">Maximum Grades:</span> <input className="assignmentFormInput" type="number" name="maxGrades" value={maxGrades} onChange = {e => {setMaxGrades(e.target.value)}} required = "required" min={1}></input></label>
                    <label><span className = "assignmentFormLabel">Due Date:</span> <input className="assignmentFormInput" type="date" name="dueDate" value={dueDate} onChange={e => {setDueDate(e.target.value)}} required = "required"></input></label>
                    <label><span className = "assignmentFormLabel assignmentFileLabel">Upload File</span> <input className="assignmentFormInput assignmentFileInput" type="file" name="file" onChange={uploadHandle}></input></label>
                    {selectedFile === null ? null : <span>{selectedFile.name}</span>}
                    <div className="assignmentFormButtonSection">
                    <button className="assignmentFormButton" onClick = {toggelShowForm}>Cancel</button>
                    <button className="assignmentFormButton" type="submit">Post</button>
                    </div>
                </form>
                </section>) : null)
            : null}
            </div>
        </section>
    </>
    )
}


