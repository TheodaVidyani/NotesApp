require('dotenv').config();
const jwt = require('jsonwebtoken');
const authenticateToken = require('./utilities');

const config = require('./config');
const mongoose = require('mongoose');

mongoose.connect(config.connectionString);

const User = require('./models/user.model');
const Note = require('./models/note.model');

const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(
    cors({
    origin: '*', 
})
);

app.get('/', (req, res) => {
    res.json({data: "hello"})
});

//create account

app.post('/create-account', async (req, res) => {
const {fullName, email, password} = req.body;

if(!fullName || !email || !password){
    return res.status(400).json({message: "All fields are required"});
}
const isUser = await User.findOne({email: email});
if(isUser){
    return res.status(400).json({message: "User already exists"});
}
const user = new User({
    fullName,
    email,
    password, 
});

await user.save();

//Generation of JWT token, we typically generate it in our Node.js backend. The JWT token is usually created when a user successfully logs in or registers, and the server responds with a token that the client can use for subsequent requests.
const accessToken = jwt.sign({_id: user._id, email: user.email}, process.env.ACCESS_TOKEN_SECRET);

    // Here's how it works:

    // jwt.sign(): This function is used to generate a JWT token.
    // Payload: You're including the email of the user as the payload (data) in the token.
    // Secret: The second argument, process.env.ACCESS_TOKEN_SECRET, is the secret key used to sign the token. This ensures the token's integrity and allows verification later.
    // The token is then sent back to the client in the response. The client can store this token and use it to authenticate future requests to the server.
    // The client typically stores the token in local storage or a cookie and sends it in the Authorization header of subsequent requests to the server.
    // The server can then verify the token using jwt.verify() and extract the user information from the token.

return res.status(201).json({message: "Account created successfully", accessToken});
});

app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({message: "All fields are required"});
    }

    const userInfo = await User.findOne({email: email});

    if(!userInfo){
        return res.status(400).json({message: "User not found."});
    }

    if(userInfo.password !== password){
        return res.status(400).json({message: "Incorrect password"});
    }

    if(userInfo.password === password){
        const accessToken = jwt.sign({_id: userInfo._id, email: userInfo.email}, process.env.ACCESS_TOKEN_SECRET);
        return res.status(200).json({message: "Login successful", accessToken});
    }else{
        return res.status(400).json({message: "Invalid Credentials."});
    }
});

//Get user
app.get('/get-user', authenticateToken, async (req, res) => {
    const {user} = req.user;
    const isUser = await User.findOne({_id: user._id, email: user.email});
    if(!isUser){
        return res.status(404).json({message: "User not found"});
    }
    return res.json({
        user:{fullName: isUser.fullName, email: isUser.email, "_id": isUser._id, createdOn: isUser.createdOn},
        message: "User fetched successfully"
    });
});


//Add note
app.post('/add-note', authenticateToken, async (req, res) => {
    const{title, content, tags} = req;
    const {user} = req;

    if(!title || !content){
        return res.status(400).json({error: "true", message: "Title and Content are required"});
    }
    try{
        const note = new Note({
            title,
            content,
            tags: tags ? tags : [],
            userID: user.email,
        });
        await note.save();
        return res.status(201).json({message: "Note added successfully"});
    }catch(err){
        return res.status(500).json({message: "Internal Server Error"});    
    }
});

//Edit note
app.post('/edit-note/:noteId', authenticateToken, async (req, res) => {
    const {noteId} = req.params.noteId;
    const {title, content, tags, isPinned} = req.body;
    const {user} = req.user;

    if(!title || !content){
        return res.status(400).json({message: "Title and Content are required"});
    }
    try{
        const note = await Note.findOne({_id: noteId, userID: user.email});
        if(!note){
            return res.status(404).json({message: "Note not found"});
        }
        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (isPinned) note.isPinned = isPinned;
        await note.save();
        return res.status(200).json({message: "Note updated successfully"});
    }catch(err){
        return res.status(500).json({message: "Internal Server Error"});
    }
});

//Get All Notes
app.get('/get-all-notes', authenticateToken, async (req, res) => {
    try {
        // Access the user ID from the token's user object
        const userId = req.user._id;

        // Find notes associated with the user, sorted by isPinned and CreatedOn
        const notes = await Note.find({
            userID: userId
        }).sort({ isPinned: -1});

        // Send the response with the fetched notes
        return res.status(200).json({ notes, message: "Notes fetched successfully" });
    } catch (err) {
        // Handle errors and send 500 Internal Server Error
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//Delete note
app.delete('/delete-note/:id', authenticateToken, async (req, res) => {
    const noteId = req.params.id;  // Get the note ID from the URL parameter
    const userId = req.user._id;   // Get the user ID from the token

    try {
        // Find the note to delete and ensure it's owned by the authenticated user
        const note = await Note.findOneAndDelete({
            _id: noteId,
            userID: userId
        });
        //or here we can just use findOne and then later deleteOne

        if (!note) {
            // If no note was found or the user doesn't own it, return a 404
            return res.status(404).json({ message: "Note not found." });
        }

        // If deletion was successful, return a success message
        return res.status(200).json({ message: "Note deleted successfully" });
    } catch (err) {
        // Handle errors and send 500 Internal Server Error
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//Edit isPinned value
// Update isPinned value
app.put('/update-pin-status/:noteId', authenticateToken, async (req, res) => {
    const {noteId} = req.params.noteId;
    const {isPinned} = req.body;
    const {user} = req.user;

    try {
        // Find the note by its ID and ensure it belongs to the authenticated user
        const note = await Note.findOne({_id: noteId, userID: user.email});
        if (!note) {
            return res.status(404).json({message: "Note not found"});
        }

        // Update the isPinned status
        note.isPinned = isPinned;

        await note.save();  // Save the updated note

        return res.status(200).json({message: "Pin status updated successfully", note});
    } catch (err) {
        return res.status(500).json({message: "Internal Server Error"});
    }
});

app.listen(8000);

module.exports = app;