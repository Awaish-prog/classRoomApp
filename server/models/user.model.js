const mongoose = require('mongoose')

const User = new mongoose.Schema(
    {
        name: { type: String, required: true},
        email: { type: String, required: true},
        password: {type: String, required: true},
        /* classes array contains all the claases user is joined in */
        classes: [{ role: {type: String}, classCode: {type: String}, className: {type: String} }],

        /* assignments array will contain all assignments for this user */
        assignments: [{ assignmentName: {type: String}, description: {type: String}, fileName: {type: String}, className: {type: String}, maxGrades: {type: Number}, action: {type: String}, dueDate: {type: Date}, postedOn: {type: Date, default: () => new Date()}, postedBy: {name: {type: String}, email: {type: String}} }],
        
        /* submissions array will contain all the submissions made by this user */
        submissions: [{className: {type: String}, assignmentName: {type: String}, submittedFile: {type: String}, remarks: {type: [String], default: []}, gradesEarned: {type: Number, default: -1}, submittedOn: {type: Date, default: () => new Date()}, lateSubmission: {type: Boolean}}],

        /* messages array will contain all messages sent by this user */
        messages: [{messageSent: {type: String}, className: {type: String}, assignmentName: {type: String}, time: {type: Date, default: () => new Date()}}],
        
        /* announcements array will contain all anouncementsthis user has made and received */
        announcements: [{className: {type: String}, announcement: {type: String}, time: {type: Date, default: () => new Date()}}]
    }
)

const user_model = mongoose.model("user_data", User);

module.exports = user_model;