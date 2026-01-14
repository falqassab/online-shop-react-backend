# Online Shop Backend API

A RESTful API backend for an online shop built with Node.js, Express, and SQLite.

## Features

- User authentication (register & login)
- Product management (CRUD operations)
- SQLite database
- RESTful API design
- Error handling middleware
- Sample product data

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing

## Project Structure

```
backend/
├── database/
│   └── db.js              # Database connection and initialization
├── middleware/
│   └── errorHandler.js    # Global error handling
├── models/
│   ├── User.js            # User model
│   └── Product.js         # Product model
├── routes/
│   ├── auth.js            # Authentication routes
│   └── products.js        # Product routes
├── .env                   # Environment variables
├── .gitignore
├── package.json
├── server.js              # Main server file
└── README.md
```

## Installation

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (`.env` file is already created):

```
PORT=3001
DB_PATH=./database/shop.db
NODE_ENV=development
```

## Running the Server

### Development mode (with auto-restart):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication

#### Register a new user

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get all users

```http
GET /api/auth/users
```

### Products

#### Get all products

```http
GET /api/products
```

#### Search products

```http
GET /api/products?search=laptop
```

#### Get single product

```http
GET /api/products/:id
```

#### Delete a product

```http
DELETE /api/products/:id
```

### Health Check

```http
GET /api/health
```

## Future Enhancements

- [ ] JWT authentication
- [ ] User roles and permissions
- [ ] Shopping cart functionality
- [ ] Order management
- [ ] Payment integration
- [ ] Image upload functionality
- [ ] Pagination for products
- [ ] Product reviews and ratings

## Testing the API

You can test the API using:

- **Postman** - Import the endpoints and test
