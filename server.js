const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Connect to MongoDB using the URI from the .env file
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas', err));

// Define a Mongoose schema for notes
const noteSchema = new mongoose.Schema({
    type: String,      // Type of note: 'text' or 'image'
    content: String,   // Content of the note (text or image URL)
    x: Number,         // X position of the note on the board
    y: Number,         // Y position of the note on the board
    color: String,     // Background color of the note
});

// Create a Mongoose model based on the schema
const Note = mongoose.model('Note', noteSchema);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    // Load existing notes from MongoDB when a user connects
    Note.find().then(notes => {
        socket.emit('loadNotes', notes);
    });

    // Handle adding a new note
    socket.on('addNote', (noteData) => {
        const note = new Note(noteData);
        note.save().then(savedNote => {
            io.emit('newNote', savedNote);  // Broadcast the new note to all clients
        });
    });

    // Handle updating an existing note
    socket.on('updateNote', (updatedNote) => {
        Note.findByIdAndUpdate(updatedNote._id, updatedNote, { new: true })
            .then(savedNote => {
                io.emit('updateNote', savedNote);  // Broadcast the updated note to all clients
            });
    });
});


// Start the server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

