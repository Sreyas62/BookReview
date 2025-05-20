
# Database Schema Design

## ER Diagram
```
+---------------+          +----------------+
|     User      |          |     Book      |
+---------------+          +----------------+
| _id           |          | _id           |
| username      |          | title         |
| password      |          | author        |
| createdAt     |          | genre         |
| updatedAt     |          | createdAt     |
|               |          | updatedAt     |
+---------------+          +----------------+
        |                         |
        |                         |
        |                  +----------------+
        +----------------->|    Review      |
                           +----------------+
                           | _id            | 
                           | user (ref)     |
                           | rating         |
                           | comment        |
                           | createdAt      |
                           +----------------+
```


## User Schema
```javascript
{
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  timestamps: true
}
```

## Book Schema
```javascript
{
  title: { 
    type: String, 
    required: true 
  },
  author: { 
    type: String, 
    required: true 
  },
  genre: { 
    type: String, 
    required: true 
  },
  reviews: [{
    user: { 
      type: ObjectId, 
      ref: 'User',
      required: true
    },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5 
    },
    comment: { 
      type: String, 
      required: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  timestamps: true
}
```

## Relationships
- Each book can have multiple reviews (One-to-Many)
- Each review belongs to one user (Many-to-One)
- One user can review many books, but only once per book

## Indexes
- User.username (unique)
- Book.title
- Book.author
- Book.genre

## Design Decisions
1. Reviews are embedded in Book document for:
   - Faster read operations when fetching book with reviews
   - Atomic operations when updating reviews
   - Natural data locality

2. User references in reviews for:
   - Maintaining data consistency
   - Enabling user-specific review operations
   - Preventing duplicate reviews
