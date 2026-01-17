# FlavourFlow - Recipe App

A modern, cyberpunk-themed recipe application built with React and Node.js. Discover, share, and save your favorite recipes from around the world.

## Features

- 🔐 **User Authentication** - Secure login and registration system
- 🍳 **Browse Recipes** - Explore thousands of recipes from multiple sources
- 🔍 **Advanced Search** - Filter by category, cuisine, and ingredients
- ➕ **Submit Recipes** - Share your own culinary creations
- 📱 **Responsive Design** - Optimized for all devices
- ⚡ **Fast Performance** - Optimized animations and loading times

## Tech Stack

### Frontend
- React 18
- React Router v6
- Framer Motion (animations)
- Axios
- Lucide React (icons)
- Vite (build tool)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt
- CORS

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB

### Installation

1. Clone the repository
```bash
git clone https://github.com/murtaza-sohail/RECIPE-APP-.git
cd recipe-app
```

2. Install dependencies for both client and server
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables
Create a `.env` file in the server directory:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. Run the application
```bash
# Start the backend server (from server directory)
npm start

# Start the frontend (from client directory)
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
recipe-app/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   └── package.json
└── server/          # Express backend
    ├── data/
    ├── server.js
    └── package.json
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/recipes/merged` - Get recipes from all sources
- `GET /api/recipes/external/:id` - Get specific external recipe
- `GET /api/recipes/local/:id` - Get specific local recipe
- `POST /api/recipes/submit` - Submit new recipe
- `GET /api/categories` - Get all recipe categories

## License

MIT

## Author

Murtaza Sohail
