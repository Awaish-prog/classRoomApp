const mongoose = require('mongoose')

const User = new mongoose.Schema(
    {
        name: { type: String, required: true},
        email: { type: String, required: true},
        password: {type: String, required: true},
        classes: [{ role: {type: String}, classCode: {type: String}, className: {type: String} }],

        assignments: [{ assignmentName: {type: String}, description: {type: String}, fileName: {type: String}, className: {type: String}, maxGrades: {type: Number}, action: {type: String}, dueDate: {type: Date}, postedOn: {type: Date, default: () => new Date()}, postedBy: {name: {type: String}, email: {type: String}} }],
        
        submissions: [{className: {type: String}, assignmentName: {type: String}, submittedFile: {type: String}, remarks: {type: [String], default: []}, gradesEarned: {type: Number, default: -1}, submittedOn: {type: Date, default: () => new Date()}, lateSubmission: {type: Boolean}}],

        messages: [{messageSent: {type: String}, className: {type: String}, assignmentName: {type: String}, time: {type: Date, default: () => new Date()}}],

        announcements: [{className: {type: String}, announcement: {type: String}, time: {type: Date, default: () => new Date()}}]
    }
)

const user_model = mongoose.model("user_data", User);

module.exports = user_model;