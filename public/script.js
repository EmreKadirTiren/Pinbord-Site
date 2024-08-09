const board = document.getElementById('board');
const socket = io();

// Function to create and append sticky notes to the board
function createNoteElement(note) {
    const noteElement = document.createElement('div');
    noteElement.className = 'sticky-note';
    noteElement.style.left = `${note.x}px`;
    noteElement.style.top = `${note.y}px`;
    noteElement.style.backgroundColor = note.color || '#ffeb3b'; // Default color

    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.contentEditable = false;
    contentDiv.innerText = note.content;
    noteElement.appendChild(contentDiv);

    // Create an edit button
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'edit-note';
    noteElement.appendChild(editButton);

    // Create a color picker (initially hidden)
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.className = 'color-picker';
    colorPicker.value = note.color || '#ffeb3b'; // Default color
    noteElement.appendChild(colorPicker);

    // Create a save button (only visible during edit)
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Save';
    submitButton.className = 'submit-note';
    submitButton.style.display = 'none'; // Initially hidden
    noteElement.appendChild(submitButton);

    // Make the note draggable
    noteElement.onmousedown = function (e) {
        dragNoteElement(e, noteElement);
    };

    // Handle edit button click
    editButton.addEventListener('click', function () {
        contentDiv.contentEditable = true;
        colorPicker.style.display = 'block';
        submitButton.style.display = 'inline-block';
        editButton.style.display = 'none';
        noteElement.style.cursor = 'default';
    });

    // Handle save button click
    submitButton.addEventListener('click', function () {
        const updatedNote = {
            _id: note._id,
            x: parseInt(noteElement.style.left),
            y: parseInt(noteElement.style.top),
            type: 'text',
            content: contentDiv.innerText,
            color: colorPicker.value,
        };
        socket.emit('updateNote', updatedNote); // Emit update event
        contentDiv.contentEditable = false;
        colorPicker.style.display = 'none';
        submitButton.style.display = 'none';
        editButton.style.display = 'inline-block';
        noteElement.style.backgroundColor = updatedNote.color;
        noteElement.style.cursor = 'grab';
    });

    board.appendChild(noteElement);
}

// Function to handle dragging of sticky notes
function dragNoteElement(e, noteElement) {
    let shiftX = e.clientX - noteElement.getBoundingClientRect().left;
    let shiftY = e.clientY - noteElement.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
        noteElement.style.left = pageX - shiftX + 'px';
        noteElement.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    noteElement.onmouseup = function () {
        document.removeEventListener('mousemove', onMouseMove);
        noteElement.onmouseup = null;
    };

    noteElement.ondragstart = function () {
        return false;
    };
}

// Load existing notes when a user connects
socket.on('loadNotes', notes => {
    notes.forEach(createNoteElement);
});

// Handle new notes being added
socket.on('newNote', createNoteElement);

// Handle notes being updated
socket.on('updateNote', function (updatedNote) {
    const noteElement = document.querySelector(`[data-id="${updatedNote._id}"]`);
    if (noteElement) {
        noteElement.style.left = `${updatedNote.x}px`;
        noteElement.style.top = `${updatedNote.y}px`;
        noteElement.style.backgroundColor = updatedNote.color;
        noteElement.querySelector('.content').innerText = updatedNote.content;
    }
});

// Double-click to add a new note
board.addEventListener('dblclick', function (e) {
    const noteElement = document.createElement('div');
    noteElement.className = 'sticky-note';
    noteElement.style.left = `${e.clientX}px`;
    noteElement.style.top = `${e.clientY}px`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.contentEditable = true;
    noteElement.appendChild(contentDiv);

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.className = 'color-picker';
    colorPicker.value = '#ffeb3b'; // Default color
    colorPicker.style.display = 'block'; // Show the color picker
    noteElement.appendChild(colorPicker);

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Save';
    submitButton.className = 'submit-note';
    noteElement.appendChild(submitButton);

    board.appendChild(noteElement);

    // Save new note
    submitButton.addEventListener('click', function () {
        const note = {
            x: e.clientX,
            y: e.clientY,
            type: 'text',
            content: contentDiv.innerText,
            color: colorPicker.value,
        };
        socket.emit('addNote', note);
        board.removeChild(noteElement);
    });
});
