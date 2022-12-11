import { useEffect, useState } from "react"
import "./ClassDashboard.css"
export default function Announcements({role, toggleAnnouncementsList, currentClass, hideAnnouncementsList, currentUser, token}){
    const [ announcement, setAnnouncement ] = useState("");
    const [ announcementList, setAnnouncementList] = useState([]);
    async function updateAnnouncements(announcement){
        await fetch("http://192.168.0.102:4000/api/updateAnnouncements", {
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
    async function getAnnouncementsList(currClass){
        let response = await fetch("http://192.168.0.102:4000/api/getAnnouncementsList", {
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
    function handleAnnouncement(e){
        e.preventDefault();
        setAnnouncementList((prev) => {
            return [...prev, {announcement: announcement, time: (new Date()).toISOString()}];
        });
        setAnnouncement("");
        updateAnnouncements(announcement);
    }
    async function deleteAnnouncement(announcement){
        setAnnouncementList((prevAnnouncementList) => {
            return prevAnnouncementList.filter(listItem => listItem.announcement !== announcement)
        })
        await fetch("http://192.168.0.102:4000/api/deleteAnnouncement", {
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
        <section className={toggleAnnouncementsList ? "announcementsList announcementsListOnClick" : hideAnnouncementsList ? "announcementsList hideAnnouncementsList" : "announcementsList"}>
        <h2>Announcements</h2>
        <div className="announcementListItems">
            {announcementList.length === 0 ? <p>No announcements made yet</p>:
            <>
            {announcementList.slice(0).reverse().map((listItem, index) => {
                return (<div className="announcementListItem" key={index}>
                    <span className="announcementDate">{`${listItem.time.substring(0, 10)} ${listItem.time.substring(11, 16)}`}</span><span className="announcement">{listItem.announcement}</span>
                    {role === "Teacher" ? <p className="announcementDeleteButton" onClick={() => deleteAnnouncement(listItem.announcement)}>Delete this announcement</p> : null}
                    </div>
                )
            })}</>}
        </div>
        {role === "Teacher" ? 
        <form onSubmit={handleAnnouncement} className="announcementForm">
        <input className="announcementInput" placeholder="Make an announcement" value={announcement} onChange = { (e) => setAnnouncement(e.target.value)} type="text" required = "required"></input>
        <button className="announcementSubmitButton" type="submit">Add Announcement</button>
        </form>: null}
        </section>
        </>
    )
}