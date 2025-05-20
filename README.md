
# 📚 Book Review API

A RESTful API for managing books and their reviews. Users can add books, leave reviews, and search through the collection.

## 🚀 Getting Started

### Prerequisites
- Node.js 
- MongoDB
- Your favorite API testing tool (Postman recommended)

### Setup

1. Clone the project
2. Create a `.env` file in the root directory with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```
3. Install dependencies:
```bash
npm install
```
4. Start the server:
```bash
npm start
```

The server will start on port 5000. You're good to go! 🎉

## 📝 API Examples

Here are some example requests you can try in Postman:

### Authentication

**Sign Up**
```http
POST /signup
Content-Type: application/json

{
    "username": "bookworm",
    "password": "readingIsLife123"
}
```

**Login**
```http
POST /login
Content-Type: application/json

{
    "username": "bookworm",
    "password": "readingIsLife123"
}
```

### Endpoints

**POST /books** – Add a new book (Authenticated users only)
```http
POST /books
Authorization: Bearer your_token_here
Content-Type: application/json

{
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "genre": "Fantasy"
}
```

**GET /books** – Get all books (with pagination and optional filters by author and genre)
```http
GET /books?page=1&limit=10&author=Tolkien&genre=Fantasy
```

**GET /books/:id** – Get book details by ID, including average rating and reviews (with pagination)
```http
GET /books/:id?page=1&limit=10
```

**POST /books/:id/reviews** – Submit a review (Authenticated users only, one review per user per book)
```http
POST /books/:id/reviews
Authorization: Bearer your_token_here
Content-Type: application/json

{
    "rating": 5,
    "comment": "A masterpiece that takes you on an unforgettable journey!"
}
```

**PUT /books/reviews/:id** – Update your own review
```http
PUT /books/reviews/:id
Authorization: Bearer your_token_here
Content-Type: application/json

{
    "rating": 4,
    "comment": "Updated thoughts: Still great but the pacing could be better"
}
```

**DELETE /books/reviews/:id** – Delete your own review
```http
DELETE /reviews/:id
Authorization: Bearer your_token_here
```

**GET /search** – Search books by title or author (partial and case-insensitive)
```http
GET /search?q=hobbit
```

## 🤔 Design Decisions

1. **Review System**: One review per user per book to maintain review quality and prevent spam

2. **Pagination**: Implemented for both books listing and reviews to handle large datasets efficiently

3. **Search**: Case-insensitive search across both title and author fields for better user experience

4. **Authentication**: JWT-based auth with 1-hour token expiry for security

5. **Error Handling**: Descriptive error messages to help debug issues quickly

## 🛠️ Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- bcrypt for password hashing

Happy reading! 📚✨
