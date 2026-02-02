# RushForum

RushForum is a modern discussion forum web app built with **React**,
**Firebase**, and **Cloudinary**.
It allows users to create posts, comment, follow/unfollow each other,
and manage their own profiles.

🔗 **Live Demo**: [rush-forum.vercel.app](https://rush-forum.vercel.app)

------------------------------------------------------------------------

## 🚀 Features

-   🔐 **Authentication** with Firebase
-   📝 **Create, edit, and delete posts**
-   💬 **Comment system** with replies
-   👍👎 **Upvote / Downvote posts**
-   📌 **Save posts** for later
-   👤 **User profiles** with:
    -   Profile picture upload (via Cloudinary)
    -   Followers & following system
    -   Tabs for posts, comments, saved, upvoted, and downvoted content
-   🎨 **Responsive design** (SCSS-based)

------------------------------------------------------------------------

## 🛠️ Tech Stack

-   **Frontend**: React, SCSS
-   **Backend / Database**: Firebase (Firestore + Auth)
-   **File Storage**: Cloudinary
-   **Other Tools**: Axios, React Router

------------------------------------------------------------------------

## 📂 Project Structure

    rush-forum/
    ├── public/              # Static assets
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── pages/           # Main pages (Profile, Discussions, etc.)
    │   ├── firebase.js      # Firebase config
    │   ├── App.js           # App entry
    │   └── index.js
    └── package.json

------------------------------------------------------------------------

## ⚙️ Setup & Installation

1.  **Clone the repo**

    ``` bash
    git clone https://github.com/Rushtfy/rush-forum.git
    cd rush-forum
    ```

2.  **Install dependencies**

    ``` bash
    npm install
    ```

3.  **Configure Firebase**

    -   Create a Firebase project
    -   Copy your config into `src/firebase.js`

4.  **Configure Cloudinary**

    -   Create a Cloudinary account
    -   Add your `cloud_name` and `upload_preset` in the upload code

5.  **Start development server**

    ``` bash
    npm start
    ```

------------------------------------------------------------------------

## 📜 License

MIT License © 2026 [Rushtfy](https://github.com/Rushtfy)
