const board = document.getElementById('board');
const arrowCanvas = document.getElementById('arrow-canvas');
const arrowModeBtn = document.getElementById('arrow-mode-btn');
const boardContainer = document.getElementById('board-container');
const socket = io();

let arrowMode = false;
let firstNote = null;
let arrows = [];

// Toggle arrow mode
arrowModeBtn.addEventListener('click', () => {
    arrowMode = !arrowMode;
    if (arrowMode) {
        arrowModeBtn.style.backgroundColor = 'lightgreen';
    } else {
        arrowModeBtn.style.backgroundColor = '';
        firstNote = null;
    }
});

// Make the board container draggable
boardContainer.onmousedown = function(e) {
    let shiftX = e.clientX - boardContainer.getBoundingClientRect().left;
    let shiftY = e.clientY - boardContainer.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
        boardContainer.style.left = pageX - shiftX + 'px';
        boardContainer.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    boardContainer.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        boardContainer.onmouseup = null;
    };

    boardContainer.ondragstart = function() {
        return false;
    };
};

// Function to create and append sticky notes to the board
function createNoteElement(note) {
    const noteElement = document.createElement('div');
    noteElement.className = 'sticky-note';
    noteElement.style.left = `${note.x}px`;
    noteElement.style.top = `${note.y}px`;
    noteElement.style.backgroundColor = note.color || '#ffeb3b';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.contentEditable = false;
    contentDiv.innerText = note.content;
    noteElement.appendChild(contentDiv);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'edit-note';
    noteElement.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-note';
    noteElement.appendChild(deleteButton);

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.className = 'color-picker';
    colorPicker.value = note.color || '#ffeb3b';
    colorPicker.style.display = 'block';
    noteElement.appendChild(colorPicker);

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Save';
    submitButton.className = 'submit-note';
    submitButton.style.display = 'none';
    noteElement.appendChild(submitButton);

    noteElement.dataset.id = note._id;

    noteElement.onmousedown = function(e) {
        dragNoteElement(e, noteElement);
    };

    editButton.addEventListener('click', function() {
        contentDiv.contentEditable = true;
        colorPicker.style.display = 'block';
        submitButton.style.display = 'inline-block';
        editButton.style.display = 'none';
        noteElement.style.cursor = 'default';
    });

    submitButton.addEventListener('click', function() {
        const updatedNote = {
            _id: note._id,
            x: parseInt(noteElement.style.left),
            y: parseInt(noteElement.style.top),
            type: 'text',
            content: contentDiv.innerText,
            color: colorPicker.value,
        };
        socket.emit('updateNote', updatedNote);
        contentDiv.contentEditable = false;
        colorPicker.style.display = 'none';
        submitButton.style.display = 'none';
        editButton.style.display = 'inline-block';
        noteElement.style.backgroundColor = updatedNote.color;
        noteElement.style.cursor = 'grab';
    });

    deleteButton.addEventListener('click', function() {
        socket.emit('deleteNote', { _id: note._id });
        board.removeChild(noteElement);
    });

    // Handle click for arrow creation
    noteElement.addEventListener('click', function() {
        if (arrowMode) {
            if (!firstNote) {
                firstNote = noteElement;
            } else if (firstNote !== noteElement) {
                createArrow(firstNote, noteElement);
                firstNote = null;
            }
        }
    });

    board.appendChild(noteElement);
}

function createArrow(startNote, endNote) {
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    arrow.classList.add('arrow');
    arrow.setAttribute('x1', startNote.offsetLeft + startNote.offsetWidth / 2);
    arrow.setAttribute('y1', startNote.offsetTop + startNote.offsetHeight / 2);
    arrow.setAttribute('x2', endNote.offsetLeft + endNote.offsetWidth / 2);
    arrow.setAttribute('y2', endNote.offsetTop + endNote.offsetHeight / 2);
    arrow.setAttribute('stroke', 'black');
    arrow.setAttribute('marker-end', 'url(#arrowhead)');

    arrow.addEventListener('click', function() {
        deleteArrow(arrow);
    });

    arrows.push({ arrow, startNote, endNote });
    arrowCanvas.appendChild(arrow);

    updateArrowPositions();
}

function updateArrowPositions() {
    arrows.forEach(({ arrow, startNote, endNote }) => {
        arrow.setAttribute('x1', startNote.offsetLeft + startNote.offsetWidth / 2);
        arrow.setAttribute('y1', startNote.offsetTop + startNote.offsetHeight / 2);
        arrow.setAttribute('x2', endNote.offsetLeft + endNote.offsetWidth / 2);
        arrow.setAttribute('y2', endNote.offsetTop + endNote.offsetHeight / 2);
    });
}

function dragNoteElement(e, noteElement) {
    let shiftX = e.clientX - noteElement.getBoundingClientRect().left;
    let shiftY = e.clientY - noteElement.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
        noteElement.style.left = pageX - shiftX + 'px';
        noteElement.style.top = pageY - shiftY + 'px';
        updateArrowPositions();
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    noteElement.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        noteElement.onmouseup = null;
    };

    noteElement.ondragstart = function() {
        return false;
    };
}

// Function to delete an arrow
function deleteArrow(arrow) {
    arrowCanvas.removeChild(arrow);
    arrows = arrows.filter(a => a.arrow !== arrow);
}

// Load existing notes when a user connects
socket.on('loadNotes', notes => {
    notes.forEach(createNoteElement);
});

// Handle new notes being added
socket.on('newNote', createNoteElement);

// Handle notes being updated
socket.on('updateNote', function(updatedNote) {
    const noteElement = document.querySelector(`[data-id="${updatedNote._id}"]`);
    if (noteElement) {
        noteElement.style.left = `${updatedNote.x}px`;
        noteElement.style.top = `${updatedNote.y}px`;
        noteElement.style.backgroundColor = updatedNote.color;
        noteElement.querySelector('.content').innerText = updatedNote.content;
        updateArrowPositions();
    }
});

// Handle deleting notes
socket.on('deleteNote', function(deletedNoteId) {
    const noteElement = document.querySelector(`[data-id="${deletedNoteId}"]`);
    if (noteElement) {
        board.removeChild(noteElement);
    }
    arrows = arrows.filter(({ arrow, startNote, endNote }) => {
        if (startNote.dataset.id === deletedNoteId || endNote.dataset.id === deletedNoteId) {
            deleteArrow(arrow);
            return false;
        }
        return true;
    });
});

// Add SVG marker definitions for arrowheads
const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
defs.innerHTML = `
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" />
    </marker>
`;
arrowCanvas.appendChild(defs);
