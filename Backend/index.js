require('dotenv').config();
const jwt = require('jsonwebtoken');
const authenticateToken = require('./utilities');

const config = require('./config');
const mongoose = require('mongoose');

mongoose.connect(config.connectionString);

const User = require('./models/user.model');
const Note = require('./models/note.model');
//By this const Note = require('./models/note.model'); we're importing the Note model from note.model.js. This model is used to interact with the notes collection in the database.

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

//create account - API
app.post('/create-account', async (req, res) => {
const {fullName, email, password} = req.body;

if(!fullName || !email || !password){
    return res.status(400).json({message: "All fields are required"});
}

//Here, 'User' is referring to the const User, which we used to import User Model from user.model.js. We're using the User model to query the database and check if the user already exists. If the user exists, we return a 400 status code with a message saying "User already exists". If the user doesn't exist, we create a new user and save it to the database.\
//About the findOne method, we use it to find a single document in the database that matches the specified query criteria. In this case, we're checking if a user with the specified email already exists in the database.
const isUser = await User.findOne({email: email});
if(isUser){
    return res.status(400).json({message: "User already exists"});
}
//This is where we create a new user and save it to the database. We're using the User model to create a new user object with the provided fullName, email, and password. We then call the save() method to save the user to the database.
const user = new User({
    fullName,
    email,
    password, 
});

await user.save();

//Generation of JWT token, we typically generate it in our Node.js backend. The JWT token is usually created when a user successfully logs in or registers, and the server responds with a token that the client can use for subsequent requests.
const accessToken = jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET);

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

    if(userInfo.email == email && userInfo.password === password){
        const user = {user:userInfo};
        const accessToken = jwt.sign( user, process.env.ACCESS_TOKEN_SECRET);
        return res.status(200).json({message: "Login successful", accessToken});
    }else{
        return res.status(400).json({message: "Invalid Credentials."});
    }
});

//Get user
app.get('/get-user', authenticateToken, async (req, res) => {
    const {user} = req.user;
    const isUser = await User.findOne({_id: user._id});
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
    //Why using authenticateToken here? Because we want to ensure that only authenticated users can add notes. The authenticateToken middleware checks if the request contains a valid JWT token. If the token is valid, the user object is added to the request object, and the request is passed to the next middleware or route handler. If the token is invalid or missing, the middleware returns a 401 Unauthorized response.
    const{title, content, tags} = req.body;
    //Why using 'req.body'? Not just 'req'? Because we're expecting the title, content, and tags fields in the request body. The req.body object contains key-value pairs of data submitted in the request body. In this case, we're extracting the title, content, and tags fields from the req.body object using object destructuring.
    //So where is actually 'req.body' is mentioned? It is mentioned in the AddEditNotes.jsx file in the Frontend folder.
    const {user} = req.user;
    //Whu using 'req.user'? Because the authenticateToken middleware adds the user object to the request object if the token is valid. The user object contains information about the authenticated user, such as the user's email. In this case, we're extracting the user object from the req.user object using object destructuring.

    if(!title){
        return res.status(400).json({error: "true", message: "Title is required"});
    }

    if(!content){
        return res.status(400).json({error: "true", message: "Content is required"});
    }

    try{
        const note = new Note({
            title,
            content,
            tags: tags ? tags : [],
            //What is meant by tags ? tags : [] in the code is that if the tags are provided in the request, we use those tags; otherwise, we use an empty array.
            userID: user.email,
        });
        //Here, by const note = new Note({...}), we're creating a new note object using the Note model. We're setting the title, content, tags, and userID fields of the note object based on the request data and the authenticated user's email.
        await note.save();
        //Here, by await note.save(), we're saving the newly created note to the database. The save() method is used to insert a new document into the database.
        return res.status(201).json({message: "Note added successfully"});
    }catch(err){
        return res.status(500).json({message: "Internal Server Error"});    
    }
});

//Edit note
app.put('/edit-note/:noteId', authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    //Why using 'req.params.noteId'? Because we're expecting the note ID to be passed as a URL parameter. The req.params object contains properties mapped to the named route parameters. In this case, we're extracting the noteId parameter from the req.params object.
    //So where is actually 'req.params.noteId' is mentioned? It is mentioned in the AddEditNotes.jsx file in the Frontend folder.
    const {title, content, tags, isPinned} = req.body;
    const {user} = req.user;

    if(!title || !content){
        return res.status(400).json({message: "Title and Content are required"});
    }
    try{
        const note = await Note.findOne({_id: noteId, userID: user._id});
        //The userID in the backend is being extracted from the authenticated user object using req.user, which is valid as long as the authenticateToken middleware attaches the user to the request object. 
       //The findOne method is used to find a single document in the database that matches the specified query criteria. In this case, we're checking if a note with the specified ID and user ID exists in the database.
       //If the note is found, we update the note's title, content, tags, and isPinned fields based on the request data. We then save the updated note to the database using the save() method.
       //The edit-note route is used to update an existing note in the database. The route expects the note ID to be passed as a URL parameter and the updated note data to be sent in the request body. The route also requires authentication, as only authenticated users should be able to edit notes.
       //The route handler first extracts the note ID and updated note data from the request. It then checks if the title and content fields are provided in the request body. If not, it returns a 400 Bad Request response with an error message.
       //The route handler then attempts to find the note in the database based on the note ID and the authenticated user's ID. If the note is found, it updates the note's title, content, tags, and isPinned fields with the new data. The updated note is then saved to the database.
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
            // Access the user object from the request
            const {user} = req.user;
    try {
        // Find notes associated with the user, sorted by isPinned and createdOn
        const notes = await Note.find({
            userID: user._id
        }).sort({ isPinned: -1});
        //What is meant by upper code is that we're using the Note model to find all notes associated with the authenticated user. 
        //We're filtering the notes based on the user's ID and sorting them by the isPinned field in descending order. 
        //This means that pinned notes will appear first in the list.

        // Send the response with the fetched notes
        return res.status(200).json({ notes, message: "Notes fetched successfully" });
    } catch (err) {
        // Handle errors and send 500 Internal Server Error
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//Delete note
app.delete('/delete-note/:noteId', authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;  // Get the note ID from the URL parameter
    const {user} = req.user;   // Get the user ID from the token

    try {
        // Find the note to delete and ensure it's owned by the authenticated user
        const note = await Note.findOneAndDelete({
            _id: noteId,
            userID: user._id
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
        const note = await Note.findOne({_id: noteId, userID: user._id});
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

// Search Notes API creation - Happned in Backend index.js, the intergration will happen in Frontend Home.jsx 
app.get('/search-noes', authenticateToken, async (req, res) => {
    const {user} = req.user;
    const {query} = req.query;

    if(!query){
        return res.status(400).json({error: true, message: "Query is required"});
    }

    try {
        // Find the note by its ID and ensure it belongs to the authenticated user
        const matchingNotes = await Note.find({
            userID: user._id,
        $or: [
            {title: {$regex: new RegExp(query, "i")}},
            {content: {$regex: new RegExp(query, "i")}},
        ],
        });
        return res.json({error:false, notes: matchingNotes, message: "Notes Retrieved Successfully"});
    } catch (err) {
        return res.status(500).json({message: "Internal Server Error"});
    }
});


app.listen(8000);

module.exports = app;