const express = require('express');
const path = require('path')
const app = express();
const multer = require("multer");
const mongoose = require('mongoose');
const User = require('./models/user.model')
const cors = require('cors');
const jwt = require("jsonwebtoken");
const fs = require('fs');
const io = require("socket.io")(8080, {
    cors: {
        origin: ["http://localhost:3000"]
    }
});
app.use(cors());
app.use(express.static(path.join(__dirname, 'build')))
app.use(express.json());
let bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
// Setting up multer to store files
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, 'public')
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
})
const upload =  multer({ storage: storage }).single("file");

const submissions = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, 'submissions')
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
})
const submission = multer({ storage: submissions }).single("file");
// connect to mongodb locally
mongoose.connect("mongodb://localhost:27017/Users");

// This function will authenticate user with json web token
function verifyUser(token, user){
    if(token == undefined || !user){
        return false;
    }
    try{
        const decoded = jwt.verify(token, "asdhg634qrg54qwbjhwebd384y734t3qyegwqehnu");
        if(decoded.email === user.email){
            return true;
        }
        else{
            return false;
        }
    }
    catch(error){
        return false;
    }
}

app.post("/api/signUpUser", async (req, res) => {
    req.body.email = req.body.email.toLowerCase();
    if(await User.findOne({email: req.body.email})){
        res.json({ status: 'ok', user: "Exists"});
    }
    else{
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });
        const token = jwt.sign({
            email: user.email
        }, "asdhg634qrg54qwbjhwebd384y734t3qyegwqehnu");
        res.json({ status: 'ok', user: "Inserted", token});
    }
});

app.post("/api/loginUser", async (req, res) => {
    const email = req.body.email.toLowerCase();
    User.findOne({email: email, password: req.body.password}, (err, user) => {
        if(!user){
            res.json({ status: 'ok', login: "failed"});
            return;
        }
        const token = jwt.sign({
            email: user.email
        }, "asdhg634qrg54qwbjhwebd384y734t3qyegwqehnu");
        res.json({ status: 'ok', login: "success", token});
    });
});

app.post("/api/createClass", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    let user = await User.findOne({email: req.body.currentUser});
    const token = req.headers["x-access-token"]
    if(!verifyUser(token, user)){
        res.status(404);
        return;
    }
    if(null !== await User.findOne({"classes.className": req.body.className})){
        res.json({ status: 'ok', class: "Exists"})
    }
    else{
        user.classes = [...user.classes, {role: "Teacher", classCode: req.body.classCode , className: req.body.className}]
        await User.updateOne({email: req.body.currentUser}, {classes: user.classes});
        res.json({ status: 'ok', class: "Does not Exist"});
    }
})

app.post("/api/getClassList", async (req, res) => {
    req.body.currUser = req.body.currUser.toLowerCase();
    const user = await User.findOne({email: req.body.currUser});
    const token = req.headers["x-access-token"]
    let classes = [];
    if(user && verifyUser(token, user)){
        user.classes.forEach((classObj) => {
            classes.push({className: classObj.className, role: classObj.role})
        })
        res.json({ status: 'ok', list: classes, name: user.name});
    }
    else{
        res.status(404);
        return;
    }
})

app.post("/api/getMembersList", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const currentUser = await User.findOne({email: req.body.currentUser});
    const token = req.headers["x-access-token"]
    if(!verifyUser(token, currentUser)){
        res.status(404);
        return;
    }
    
    let users = await User.where("classes.className").equals(req.body.currClass);
    const currentClass = currentUser.classes.find(Class => Class.className === req.body.currClass);
    let currentRole = null;
    // making users array null if user who is making request is not part of the class
    if(!currentClass){
        users = null;
    }
    else{
        currentRole = currentClass.role;
    }
    
    let teachers = [];
    let students = []; 
    if(users){
        users.forEach((user) => {
            if(user.classes.find(Class => Class.className === req.body.currClass).role === "Teacher"){
                teachers.push({name: user.name, role: "Teacher"});
            }
            else{
                students.push({student: {name: user.name, email: user.email}, role: "Student"});
            }
        })
        res.json({ status: 'ok', teachers: teachers, students: students, currentRole: currentRole});
        return;
    }
    else{
        res.json({ status: 'ok', list: "Empty"});
        return;
    }
})

app.post("/api/joinClass", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const user = await User.findOne({email: req.body.currentUser});
    const token = req.headers["x-access-token"]
    if(!verifyUser(token, user)){
        res.status(404);
        return;
    }
    if(user.classes.find(obj => obj.className === req.body.className)){
        res.json({ status: 'ok', class: "Exists"})
        return;
    }
    const classMember = await User.where("classes.className").equals(req.body.className).where("classes.classCode").ne(null);
    if(classMember.length === 0){
        res.json({ status: 'ok', class: "Class does not exist"});
        return
    }
    else if(req.body.role === "Teacher"){
        const classCode = classMember[0].classes.find(Class => Class.className === req.body.className).classCode;
        if(classCode === req.body.classCode){
            user.classes = [...user.classes, {role: "Teacher", classCode: classCode, className: req.body.className}];
            user.save();
            res.json({ status: 'ok', class: "Joined class"});
            return;
        }
        else{
            res.json({ status: 'ok', class: "wrong code" });
            return;
        }
    }
    else{ 
        const classCode = classMember[0].classes.find(Class => Class.className === req.body.className).classCode;
        user.classes = [...user.classes, {role: "Student", classCode: classCode, className: req.body.className}];
        user.save();
        res.json({ status: 'ok', class: "Joined class"});
        return;
    }
})

app.post("/api/updateAnnouncements", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const user = await User.findOne({email: req.body.currentUser});
    const token = req.headers["x-access-token"]
    if(!verifyUser(token, user)){
        res.status(404);
        return;
    }
    const users = await User.where("classes.className").equals(req.body.currentClass)
    users.forEach((user) => {
        user.announcements = [...user.announcements,{className: req.body.currentClass, announcement: req.body.announcement}];
        user.save();
    })
    res.json({status: 'ok'});
})

app.post("/api/getAnnouncementsList", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const user = await User.findOne({email: req.body.currentUser});
    const token = req.headers["x-access-token"]
    if(!verifyUser(token, user)){
        res.status(404);
        return;
    }
    const users = await User.where("announcements.className").equals(req.body.currClass);
    let userWithAllAnnouncements = {announcements: []};
    let length = 0;
    let announcementsList = []
    users.forEach((user) => {
        if(length < user.announcements.length){
            length = user.announcements.length;
            userWithAllAnnouncements = user;
        }
    });
    if(userWithAllAnnouncements.announcements.length !== 0){
        userWithAllAnnouncements.announcements.forEach((announcement) => {
            if(announcement.className === req.body.currClass)
                announcementsList.push({announcement: announcement.announcement, time: announcement.time });
        })
    }
    res.json({status: 'ok', announcementsList: announcementsList})
    return;
})

app.post("/api/postAssignment", async (req, res) => {
    
    upload(req, res, async function(err){
        req.body.currentUser = req.body.currentUser.toLowerCase();
        const currentUser = await User.findOne({email: req.body.currentUser});
        const token = req.headers["x-access-token"]
        if(!verifyUser(token, currentUser)){
            res.status(404);
            return;
        }
        const users = await User.where("classes.className").equals(req.body.currentClass);
        
        let role = "";
        users.forEach((user) => {
            user.classes.forEach((field) => {
                if(field.className === req.body.currentClass)
                    role = field.role;
            })
            if(role === "Student"){
                if(req.file  === undefined){
                    user.assignments = [...user.assignments, {assignmentName: req.body.name, description: req.body.description, className: req.body.currentClass, maxGrades: req.body.maxGrades, action: "Not submitted", dueDate: new Date(req.body.dueDate), postedBy: {name: currentUser.name, email: currentUser.email}}]
                    user.save();
                }
                else{
                    user.assignments = [...user.assignments, {assignmentName: req.body.name, description: req.body.description, className: req.body.currentClass, maxGrades: req.body.maxGrades, action: "Not submitted", dueDate: new Date(req.body.dueDate), postedBy: {name: currentUser.name, email: currentUser.email}, fileName: req.file.originalname}]
                    user.save();
                }
                
            }
            else{
                if(req.file  === undefined){
                    user.assignments = [...user.assignments, {assignmentName: req.body.name, description: req.body.description, className: req.body.currentClass, maxGrades: req.body.maxGrades, action: "", dueDate: new Date(req.body.dueDate), postedBy: {name: currentUser.name, email: currentUser.email}}]
                    user.save();
                }
                else{
                    user.assignments = [...user.assignments, {assignmentName: req.body.name, description: req.body.description, className: req.body.currentClass, maxGrades: req.body.maxGrades, action: "", dueDate: new Date(req.body.dueDate), postedBy: {name: currentUser.name, email: currentUser.email}, fileName: req.file.originalname}]
                    user.save();
                }
            }
        })
        res.json({status: 'ok'});
    })
    
})

app.post("/api/getAssignmentsList", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const user = await User.findOne({email: req.body.currentUser});
    const token = req.headers["x-access-token"]
    if(!verifyUser(token, user)){
        res.status(404);
        return;
    }
    const users = await User.where("classes.className").equals(req.body.currClass).where("classes.role").equals("Teacher");
    let teacher = {assignments: []};
    let len = 0;
    let assignmentsList = [];
    let assignments = [];
    users.forEach((user) => {
        if(len < user.assignments.length){
            teacher = user;
            len = user.assignments.length;
        }
    })
    if(teacher.assignments.length !== 0){
        assignments = teacher.assignments;
    
        assignments = assignments.filter(assignment => assignment.className === req.body.currClass);
        assignments.forEach((assignment) => {
            assignmentsList = [...assignmentsList, {assignmentName: assignment.assignmentName, postedBy:    assignment.postedBy.name}];
        })
    }
    res.json({status: 'ok', assignmentsList: assignmentsList});
    return; 
});

app.post("/api/getAssignmentDetails", async (req, res) => {
    req.body.currUser = req.body.currUser.toLowerCase();
    const currentUser = await User.findOne({email: req.body.currUser});
    const token = req.headers["x-access-token"];
    if(!verifyUser(token, currentUser)){
        res.status(404);
        return;
    }
    const users = await User.where("classes.className").equals(req.body.currClass).where("classes.role").equals("Teacher");
    
    const submitters = await User.where("submissions.className").equals(req.body.currClass).where("submissions.assignmentName").equals(req.body.assignmentName);
    let submittersList = [];
    let submittedFile = "";
    let teacher;
    let len = 0;
    let remarks = [];
    let grades = -1;
    let submittedOn = "";
    let submittedOnDetail = "";
    let lateSubmission = "";
    if(submitters.length !== 0){
        submitters.forEach((submitter) => {
            submitter.submissions.forEach((submission) => {
                if(submission.className === req.body.currClass && submission.assignmentName === req.body.   assignmentName)
                    submittedOn = submission.submittedOn;
            })
            submittersList = [...submittersList, {submitterName: submitter.name, submitterEmail: submitter.email, submittedOn: submittedOn} ];
        })
    }
    if(currentUser.length !== 0){
        currentUser.submissions.forEach((submission) => {
            if(submission.className === req.body.currClass && submission.assignmentName === req.body.         assignmentName){
                submittedFile = submission.submittedFile;
                remarks = submission.remarks;
                grades = submission.gradesEarned;
                submittedOnDetail = submission.submittedOn;
                lateSubmission = submission.lateSubmission;
            }
        })
    }
    users.forEach((user) => {
        if(len < user.assignments.length){
            teacher = user;
            len = user.assignments.length;
        }
    })
    let assignments =  teacher.assignments.filter((assignment) => {
        return assignment.className === req.body.currClass && assignment.assignmentName === req.body.assignmentName;
    });
    let assignmentDetails = {
        assignmentName: assignments[0].assignmentName,
        description: assignments[0].description,
        maxGrades: assignments[0].maxGrades,
        action: assignments[0].action,
        postedOn: assignments[0].postedOn,
        dueDate: assignments[0].dueDate,
        postedBy: assignments[0].postedBy.name,
        fileName: assignments[0].fileName,
        submissionDetails : {submittedFile: submittedFile, submittedOn: submittedOnDetail, remarks: remarks, grades: grades, lateSubmission: lateSubmission},
        submittersList : submittersList
    }
    res.json({status: 'ok', assignmentDetails: assignmentDetails});
})

app.post("/api/getFile", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const currentUser = await User.findOne({email: req.body.currentUser});
    const token = req.headers["x-access-token"];
    if(!verifyUser(token, currentUser)){
        res.status(404);
        return;
    }
    res.download(`./public/${req.body.fileName}`);
})

app.post("/api/getSubmittedFile", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const currentUser = await User.findOne({email: req.body.currentUser});
    const token = req.headers["x-access-token"];
    if(!verifyUser(token, currentUser)){
        res.status(404);
        return;
    }
    res.download(`./submissions/${req.body.fileName}`);
})

app.post("/api/postSubmission", async (req, res) => {
    submission(req, res, async function(err){
        req.body.currentUser = req.body.currentUser.toLowerCase();
        const user = await User.findOne({email: req.body.currentUser});
        const token = req.headers["x-access-token"];
        if(!verifyUser(token, user)){
            res.status(404);
            return;
        }
        let dueDate = "";
        let submissionDate = "";
        let lateSubmission = false;
        const teachers = await User.where("assignments.assignmentName").equals(req.body.assignmentName);
        let submissions = user.submissions;
        submissions = [...submissions, {className: req.body.className, assignmentName: req.body.assignmentName, submittedFile: req.file.originalname}];
        user.submissions = submissions;
        user.submissions.forEach(submission => {
            if(submission.assignmentName === req.body.assignmentName && submission.className === req.body.className)
                submissionDate = submission.submittedOn;
        })
        teachers[0].assignments.forEach(assignment => {
            if(assignment.assignmentName === req.body.assignmentName && assignment.className === req.body.className)
                dueDate = assignment.dueDate;
        })
        if(submissionDate > dueDate)
            lateSubmission = true;
        user.submissions[user.submissions.length - 1].lateSubmission = lateSubmission;
        user.save();
        res.json({ status: 'ok', lateSubmission: lateSubmission });
    })
    
})

app.post("/api/getPreviousChat", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const currentUser = await User.findOne({email: req.body.currentUser});
    const token = req.headers["x-access-token"];
    if(!verifyUser(token, currentUser)){
        res.status(404);
        return;
    }
    const users = await User.where("messages.className").equals(req.body.currClass).where("messages.assignmentName").equals(req.body.assignmentName);
    let messages = [];
    let name = "";
    const userName = currentUser.name;
    users.forEach((user) => {
        name = user.name;
        user.messages.forEach((message) => {
            if(message.assignmentName === req.body.assignmentName && message.className === req.body.currClass)
                messages = [...messages, { message: message.messageSent, time: message.time, name: name }];
        })
    })
    messages.sort((a, b) => a.time > b.time ? 1 : -1);
    res.json({status : 'ok', messages: messages, userName: userName});
})

app.post("/api/getSubmissionDetails", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const currentUser = await User.findOne({email: req.body.currentUser});
    const user = await User.findOne({email: req.body.email});
    const token = req.headers["x-access-token"];
    if(!verifyUser(token, currentUser)){
        res.status(404);
        return;
    }
    
    let submittedFile = "";
    let gradesEarned = 0;
    let remarks = [];
    user.submissions.forEach((submission) => {
        if(submission.className === req.body.currClass && submission.assignmentName === req.body.assignmentName){
            submittedFile = submission.submittedFile;
            gradesEarned = submission.gradesEarned;
            remarks = submission.remarks;
        }
    })
    res.json({ status: 'ok', submissionDetails: {submittedFile: submittedFile, gradesEarned: gradesEarned, remarks: remarks}});
})

app.post("/api/setRemarks", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const currentUser = await User.findOne({email: req.body.currentUser});
    const user = await User.findOne({email: req.body.email});
    const token = req.headers["x-access-token"];
    if(!verifyUser(token, currentUser)){
        res.status(404);
        return;
    }
    user.submissions.forEach((submission) => {
        if(submission.className === req.body.currClass && submission.assignmentName === req.body.assignmentName){
            submission.remarks = [...submission.remarks, req.body.remarks];
        }         
    });
    user.save();
    res.json({status: "ok"})
})

app.post("/api/setGrades", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const currentUser = await User.findOne({email: req.body.currentUser});
    const user = await User.findOne({email: req.body.email});
    const token = req.headers["x-access-token"];

    if(!verifyUser(token, currentUser)){
        res.status(404);
        return;
    }
    user.submissions.forEach((submission) => {
        if(submission.className === req.body.currClass && submission.assignmentName === req.body.assignmentName){
            submission.gradesEarned = req.body.grades;
        }         
    });
    user.save();
    res.json({status: "ok"});
})

app.delete("/api/leaveClassRoom", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const currentUser = await User.findOne({email: req.body.currentUser});
    const token = req.headers["x-access-token"];
    if(!verifyUser(token, currentUser)){
        res.status(404);
        return;
    }
    let assignmentFileList = [];
    let submittedFilesList = [];
    req.body.leavingUser = req.body.leavingUser.toLowerCase();
    const user = await User.findOne({email: req.body.leavingUser});
    user.assignments.forEach(assignment => {
        if(assignment.postedBy.email === req.body.currentUser.email && assignment.className === req.body.currentClass)
            assignmentFileList.push(assignment.fileName);
    })
    user.submissions.forEach(submission => {
        if(submission.className === req.body.currentClass)
            submittedFilesList.push(submission.submittedFile);
    })
    user.classes = user.classes.filter((Class) => Class.className !== req.body.currentClass);
    user.assignments = user.assignments.filter((assignment) => assignment.className !== req.body.currentClass);
    user.submissions = user.submissions.filter((submission) => submission.className !== req.body.currentClass);
    user.messages = user.messages.filter((message) => message.className !== req.body.currentClass);
    user.announcements = user.announcements.filter((announcement) => announcement.className !== req.body.currentClass);
    user.save();
    assignmentFileList.forEach(assignmentFile => {
        fs.unlinkSync(`./public/${assignmentFile}`);
    })
    submittedFilesList.forEach(submittedFile => {
        fs.unlinkSync(`./submissions/${submittedFile}`);
    })
    res.send({ status: 'ok' });
})

app.delete("/api/deleteAnnouncement", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const currentUser = await User.findOne({email: req.body.currentUser});
    const token = req.headers["x-access-token"];
    if(!verifyUser(token, currentUser)){
        res.status(404);
        return;
    }
    let users = await User.where("announcements.className").equals(req.body.currentClass);
    users.forEach(user => {user.announcements = user.announcements.filter(announcement => announcement.announcement !== req.body.announcement);
    user.save()});
    res.send({ status: 'ok' });
})

app.delete("/api/deleteAssignment", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const currentUser = await User.findOne({email: req.body.currentUser});
    const token = req.headers["x-access-token"]
    if(!verifyUser(token, currentUser)){
        res.status(404);
        return;
    }
    const users = await User.where("assignments.assignmentName").equals(req.body.assignmentName).where("assignments.className").equals(req.body.currentClass);
    const submitters = await User.where("submissions.assignmentName").equals(req.body.assignmentName).where("submissions.className").equals(req.body.currentClass);
    const lateJoiners = await User.where("submissions.assignmentName").equals(req.body.assignmentName).where("submissions.className").equals(req.body.currentClass).where("assignments.assignmentName").ne(req.body.assignmentName).where("assignments.className").ne(req.body.currentClass);
    let fileName = ""; 
    let submittedFilesList = [];
    users[0].assignments.forEach((assignment) => {
        if(assignment.assignmentName === req.body.assignmentName && assignment.className === req.body.currentClass)
            fileName = assignment.fileName;
    })
    submitters.forEach(submitter => {
        submitter.submissions.forEach(submission => {
            if(submission.assignmentName === req.body.assignmentName && submission.className === req.body.currentClass)
                submittedFilesList.push(submission.submittedFile);
        })
    })
    users.forEach(user => {
    if(user.assignments.length !== 0)
        user.assignments = user.assignments.filter(assignment => assignment.assignmentName !== req.body.assignmentName);
    if(user.messages.length !== 0)
        user.messages = user.messages.filter(message => message.assignmentName !== req.body.assignmentName && message.className !== req.body.currentClass);
    if(user.submissions !== 0)
        user.submissions = user.submissions.filter(submission => submission.assignmentName !== req.body.assignmentName && submission.className !== req.body.currentClass);
    user.save()});
    lateJoiners.forEach(lateJoiner => {
        lateJoiner.submissions = lateJoiner.submissions.filter(submission => submission.assignmentName !== req.body.assignmentName && submission.className !== req.body.currentClass);
        lateJoiner.save();
    })
    if(fileName !== undefined)
        fs.unlinkSync(`./public/${fileName}`);
    if(submittedFilesList.length !== 0){
        submittedFilesList.forEach(submittedFile => {
            fs.unlinkSync(`./submissions/${submittedFile}`);
        })
    }
})

app.delete("/api/deleteThisSubmission", async (req, res) => {
    req.body.currentUser = req.body.currentUser.toLowerCase();
    const user = await User.findOne({email: req.body.currentUser});
    const token = req.headers["x-access-token"];
    if(!verifyUser(token, user)){
        res.status(404);
        return;
    }
    user.submissions = user.submissions.filter(submission => submission.submittedFile !== req.body.submittedFile);
    user.save();
    fs.unlinkSync(`./submissions/${req.body.submittedFile}`);
})

io.on("connection", (socket) => {
    socket.on("sentMessage", async (message, assignmentName, currentUser, currentClass) => {
        currentUser = currentUser.toLowerCase();
        let time = "";
        const user = await User.where("email").equals(currentUser);
        const name = user[0].name;
        user[0].messages = [...user[0].messages, {messageSent: message, className: currentClass, assignmentName: assignmentName}];
        user[0].save();
        user[0].messages.forEach((singleMessage) => {
            if(singleMessage.messageSent === message)
                time = singleMessage.time;
        })
        socket.to(assignmentName).emit("received", { message: message, time: time, name: name });
    })
    socket.on("joinAssignmentChat", (assignmentName) => {
        socket.join(assignmentName);
    })  
})
app.get("*", (req, res) => {
    res.sendFile("index.html", {root: path.join(__dirname, "build")})
})

app.listen(4000, () => {
    console.log("Server runnning");
});