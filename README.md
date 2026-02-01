# ProjectSVU-Backend

Backend service for StudySwipe (ProjectSVU) built with Node.js, Express, and MongoDB.

## 🚀 Features Implemented

### 1. Core Learning
- **Practice Mode**: Fetch questions by random, topic-wise, or year-wise.
- **Mock Tests**: Full exam simulation with time limits (`POST /api/mock/start`).
- **Bookmarks**: Save questions for later revision.

### 2. User & Profile
- **Auth**: JWT-based login/signup (Phone/OTP flow mocked or password based).
- **Profile Management**: Update profile details (`PUT /api/user/profile`).
- **Subscription**: Razorpay integration for Premium upgrades.

### 3. Gamification (New)
- **Challenges**: 1v1 Async Quiz Battles.
    - Create Challenge: `POST /api/challenges/create` -> Returns access code.
    - Join Challenge: `POST /api/challenges/join` -> with code.
    - Submit Score: `POST /api/challenges/:id/submit`.

## 🛠 Setup & Run

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Ensure `.env` contains:
   ```
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/projectsvu
   JWT_SECRET=your_jwt_secret
   ```

3. **Run Server**
   ```bash
   # Development (with reload)
   npm run dev
   ```

## ⏭ Next Steps / TODOs

- [ ] **Real-time Challenges**: implementation currently uses polling. Upgrade to `socket.io` for live updates.
- [ ] **Admin Dashboard**: Expand admin revenue and content management routes.
- [ ] **AI Layer**: Implement finding weak areas (`/revise` mode).

## 🧑‍💻 Code Structure
- `src/models`: Mongoose Schemas (User, Question, Challenge, MockTest).
- `src/routes`: API Route definitions.
- `src/controllers`: Business logic.
- `src/middleware`: Auth and Subscription enforcement.