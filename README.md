# Pinboard Site

[![Node.js](https://img.shields.io/badge/Node.js-v14.17.0-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.19.2-blue)](https://expressjs.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-v8.5.2-red)](https://mongoosejs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4.7.5-yellow)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](LICENSE)

## Overview

Pinboard Site is a web application that allows users to create, edit, and manage sticky notes on a virtual pinboard. Users can add text or image notes, change their color, move them around, and connect them with arrows. The application uses a MongoDB database to store the notes and their positions.

## Features

- **Add Sticky Notes**: Create text or image notes.
- **Edit Notes**: Modify the content and color of notes.
- **Move Notes**: Drag and drop notes to rearrange them.
- **Connect Notes**: Draw arrows between notes to show relationships.
- **Real-time Updates**: Changes are synchronized in real-time across all connected clients.

## Technologies Used

- **Node.js**: JavaScript runtime for server-side development.
- **Express**: Web framework for Node.js.
- **Mongoose**: MongoDB object modeling tool.
- **Socket.io**: Real-time, bidirectional communication between web clients and servers.
- **MongoDB**: NoSQL database for storing notes.

## Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/EmreKadirTiren/Pinbord-Site.git
    cd Pinbord-Site
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Create a `.env` file in the root directory and add your MongoDB URI:**
    ```env
    MONGODB_URI=your_mongodb_uri
    ```

4. **Start the server:**
    ```sh
    npm start
    ```

5. **Open your browser and navigate to:**
    ```
    http://localhost:3000
    ```

## Usage

- **Toggle Arrow Mode**: Click the "Toggle Arrow Mode" button to enable or disable arrow drawing mode.
- **Add Notes**: Double-click on the board to add a new note.
- **Edit Notes**: Click the "Edit" button on a note to modify its content and color.
- **Save Notes**: Click the "Save" button to save changes to a note.
- **Move Notes**: Click and drag a note to move it around the board.
- **Connect Notes**: In arrow mode, click on two notes to draw an arrow between them.

## Project Structure
```
Pinbord-Site/ 
├── public/ 
│├── style.css 
│├── script.js 
│└── index.html 
├── .gitignore 
├── package.json 
├── server.js 
└── README.md
```


## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- **GitHub Copilot**: Assisted with adding comments and the math for arrow creation.

## Contact

For any questions or feedback, please contact [Emre Kadir Tiren](https://github.com/EmreKadirTiren).

---

Enjoy using Pinboard Site!