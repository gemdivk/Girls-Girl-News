# Girls Girl💋 - Share News, Rumors, and Everything Girlie!

Welcome to **Girls Girl💋**, the ultimate platform where you can stay updated with the latest news, share juicy rumors, and connect with your girl gang. Whether it’s trending topics, relationship tips, or fashion trends, this is the place where you can share it all and read the most exciting content. 

This platform is built with a focus on security, user experience, and fun interactions — and it’s all about empowering women to share their stories, stay informed, and build a supportive community.

## 🚀 Features

### 🔒 **User Authentication**
- **Secure Registration & Login:** Users can securely sign up and log in using **JWT tokens**.
- **Password Hashing:** Your passwords are stored securely using **bcrypt** hashing, ensuring your sensitive data remains protected.
- **User Profile Management:** Users can update their personal information and change their avatar picture to represent themselves.

### 💬 **Post News, Rumors & Stories**
- **Create News Posts:** Share exciting stories, rumors, or anything fun and interesting! You can create posts with a title, descrption, and photo.
- **Edit and Delete Posts:** You have full control over your posts. Edit and update them whenever you need or delete posts you no longer want to keep.

### 👩‍💻 **User Profiles**
- **Personal Information:** Users can update their name, email, ensuring they stay in control of their data.
- **Profile Picture (Avatar):** Users can upload a custom avatar to personalize their profile and make it uniquely theirs.
- **See Your Contributions:** Keep track of all your posts and the content you’ve shared on the platform.

### 🔄 **Real-Time Updates**
- Stay updated with **live posts**. New news or rumors are added in real-time, and you can instantly see what’s happening around the platform.
  
### 🛡️ **Privacy and Security**
- Users are authenticated via JWT tokens and all sensitive data is protected using **bcrypt** for hashing passwords.
- Only authorized users can access the features of posting and profile management.
- Custom permissions ensure that user data remains private and secure at all times.

## 🧑‍💻 Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** EJS, CSS (for styling), JavaScript (for dynamic content and interactions)
- **Database:** MongoDB Atlas (for storing user information and posts)
- **Authentication:** JWT (JSON Web Token) for secure authentication
- **Password Security:** bcrypt for securely hashing user passwords
- **API:** RESTful API for handling CRUD operations (Create, Read, Update, Delete) on user data and posts
- **Image Upload:** Users can upload avatars and images to personalize their profiles
- **Deployment:** Render for hosting and deployment

## 📦 Installation and Setup

### Prerequisites

Ensure you have the following installed before running the project locally:

- **Node.js**: The JavaScript runtime to run the application.
- **npm**: Node package manager for managing dependencies.
- **MongoDB**: Either run MongoDB locally or use **MongoDB Atlas** (cloud database service).
- **bcrypt**: For password hashing.
- **JWT**: For secure token-based authentication.

### Steps to Run Locally:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/gemdivk/girls-girl-news.git
   cd girls-girl-news
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Create the `.env` file for Environment Variables:**
   You need to create a `.env` file to store sensitive credentials and API keys.
   ```bash
   touch .env
   ```

   Add the following information to your `.env` file:
   ```
   PORT=3000
   MONGO_URI=your_mongo_uri
   EMAIL=your_email
   EMAIL_PASSWORD=your_email_password
   JWT_SECRET=your_super_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key

   ```

4. **Run the Application:**
   ```bash
   node server.js
   ```

   The backend server will be running on `http://localhost:3000`. You can navigate to this URL to access the app and test it locally.

## 👩‍💻 How to Use

### 1. **Register an Account:**
   - Go to the **Register** page and enter your username, email, and password to create a new account.
   - After registration, you will be directed to login.

### 2. **Login:**
   - Use your email and password to log in. You will receive a JWT token that will authenticate your session.
   - If you’re already logged in, you’ll be redirected to your profile.

### 3. **Update Your Profile:**
   - Go to the **Profile** page and update your personal details, including your name and email.
   - Upload a custom **avatar** to personalize your profile. You can change your avatar anytime!

### 4. **Create News & Rumors:**
   - From the **News Feed**, via “Add News” form you can create a new post.
   - Fill in the title, description, and aupload medi.
   - Submit your post to share with the community!

### 5. **Manage Your Posts:**
   - You can **edit** or **delete** any of your posts.
   - Your posts will appear in the **My Posts** section of your profile, so you can keep track of your contributions.


## 🔄 Database Models

### 1. **User Model:**
   - **email:** The user’s email, which is unique and used for authentication.
   - **username:** The user’s chosen username.
   - **password:** The user’s password (hashed using bcrypt).
   - **avatar:** The URL of the user’s profile picture.
   - **posts:** An array storing the IDs of the posts the user has created.

   Users can update their personal information (email, username) and upload a new avatar image.

### 2. **Model (Post) Model:**
   - **title:** The title of the news, rumor, or story being shared.
   - **body:** The content of the post.
   - **author:** The user who created the post (linked to the User model).
   - **createdAt:** The date and time when the post was created.
   - **tags:** Tags to categorize the content (optional).

### API Endpoints from your code:

#### Authentication Routes:
1. **POST `/auth/login`**  
   - *Request Body:* `{ "email": "string", "password": "string" }`  
   - *Response:* Returns a JWT token if login is successful. If failed, returns an error message (e.g., "Invalid email or password").

2. **POST `/auth/register`**  
   - *Request Body:* `{ "name": "string", "email": "string", "password": "string" }`  
   - *Response:* Registers a new user and redirects to login page. Returns error messages if registration fails (e.g., "All fields are required").

#### News Routes:
3. **GET `/news`**  
   - *Request Headers:* Authorization token required (JWT)  
   - *Response:* Returns a list of all news articles.

4. **POST `/news`**  
   - *Request Body:* `{ "title": "string", "description": "string", "photo": "file" }`  
   - *Request Headers:* Authorization token required (JWT)  
   - *Response:* Creates a new news article and returns success message. Returns an error if any field is missing.

5. **POST `/news/edit/:id`**  
   - *Request Parameters:* `{id}`  
   - *Request Body:* `{ "title": "string", "description": "string" }`  
   - *Request Headers:* Authorization token required (JWT)  
   - *Response:* Updates an existing news article with the provided data.

6. **DELETE `/news/:id`**  
   - *Request Parameters:* `{id}`  
   - *Request Headers:* Authorization token required (JWT)  
   - *Response:* Deletes a news article. If the user is not authorized, returns an error message.

#### User Profile Routes:
7. **GET `/profile`**  
   - *Request Headers:* Authorization token required (JWT)  
   - *Response:* Returns the user's profile details along with news authored by the user.

8. **POST `/profile/edit`**  
   - *Request Body:* `{ "name": "string", "email": "string" }`  
   - *Request Headers:* Authorization token required (JWT)  
   - *Response:* Updates the user's profile details.

9. **POST `/profile/photo`**  
   - *Request Body:* `{ "avatar": "file" }`  
   - *Request Headers:* Authorization token required (JWT)  
   - *Response:* Updates the user's avatar.

#### Logout:
10. **GET `/logout`**  
   - *Request Headers:* None  
   - *Response:* Logs out the user by clearing the JWT cookie.

---
