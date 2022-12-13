import { useEffect, useState } from "react"
import "../css/ClassDashboard.css"
export default function Announcements({role, toggleAnnouncementsList, currentClass, hideAnnouncementsList, currentUser, token}){
    const [ announcement, setAnnouncement ] = useState(""); // This variable contains a single announcement
    const [ announcementList, setAnnouncementList] = useState([]); // This variable contains all announcements
    /* This function takes a new announcement made by a teacher and sends request to update the announcements list in the database */
    async function updateAnnouncements(announcement){
        await fetch("http://localhost:4000/api/updateAnnouncements", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": token,
            },
            body: JSON.stringify({
                currentClass, announcement, currentUser
            }),
        })
    }
    /* This function gets all the announcements made in this class and updates the announcements list */
    async function getAnnouncementsList(currClass){
        let response = await fetch("http://localhost:4000/api/getAnnouncementsList", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": token,
            },
            body: JSON.stringify({
                currClass, currentUser
            }),
        })
        response = await response.json();
        setAnnouncementList(response.announcementsList);
    }
    /* This function adds an announcement to announcements list whenever a teacher makes announcements */
    function handleAnnouncement(e){
        e.preventDefault();
        setAnnouncementList((prev) => {
            return [...prev, {announcement: announcement, time: (new Date()).toISOString()}];
        });
        setAnnouncement("");
        updateAnnouncements(announcement);
    }
    /* This function deletes an announcement from the UI and sends delete request to database. */
    async function deleteAnnouncement(announcement){
        setAnnouncementList((prevAnnouncementList) => {
            return prevAnnouncementList.filter(listItem => listItem.announcement !== announcement)
        })
        await fetch("http://localhost:4000/api/deleteAnnouncement", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": token,
            },
            body: JSON.stringify({
                currentClass, announcement, currentUser
            }),
        })
    }
    
    useEffect(() => {
        
        getAnnouncementsList(currentClass);
    }, [])
    return(<>
        {/* This section below has announcements list, it will only be displayed on when width is atleast 900px,
        otherwise it will display the list only when announcement button is clicked */}
        <section className={toggleAnnouncementsList ? "announcementsList announcementsListOnClick" : hideAnnouncementsList ? "announcementsList hideAnnouncementsList" : "announcementsList"}>
        <h2>Announcements</h2>
        <div className="announcementListItems">
            {announcementList.length === 0 ? <p>No announcements made yet</p>:
            <>
            {/* Here announcements list is being rendered latest announcement comes at the top */}
            {announcementList.slice(0).reverse().map((listItem, index) => {
                return (<div className="announcementListItem" key={index}>
                    <span className="announcementDate">{`${listItem.time.substring(0, 10)} ${listItem.time.substring(11, 16)}`}</span><span className="announcement">{listItem.announcement}</span>
                    {role === "Teacher" ? <p className="announcementDeleteButton" onClick={() => deleteAnnouncement(listItem.announcement)}>Delete this announcement</p> : null}
                    </div>
                )
            })}</>}
        </div>
        {/* Here a form is being rendered conditionally because only teachers can make announcements */}
        {role === "Teacher" ? 
        <form onSubmit={handleAnnouncement} className="announcementForm">
        <input className="announcementInput" placeholder="Make an announcement" value={announcement} onChange = { (e) => setAnnouncement(e.target.value)} type="text" required = "required"></input>
        <button className="announcementSubmitButton" type="submit">Add Announcement</button>
        </form>: null}
        </section>
        </>
    )
}