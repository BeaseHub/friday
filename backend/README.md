# FastAPI Web Application

This project is a web application built using FastAPI and PostgreSQL. It includes various functionalities such as user authentication, agent selection, pricing plans, and chat capabilities.

## Project Structure

```
fastapi-webapp
├── app
│   ├── main.py                # Entry point of the FastAPI application
│   ├── db
│   │   ├── database.py        # Database connection logic
│   │   └── models.py          # Database models
│   ├── api
│   │   ├── home.py            # API routes for the home page
│   │   ├── pricing.py         # API routes for pricing plans
│   │   ├── agent.py           # API routes for agent selection
│   │   ├── auth.py            # API routes for authentication
│   │   └── chat.py            # API routes for chat functionality
│   ├── core
│   │   ├── config.py          # Configuration settings
│   │   └── security.py        # Security-related functions
│   ├── schemas
│   │   ├── user.py            # Pydantic schemas for user data
│   │   ├── agent.py           # Pydantic schemas for agent data
│   │   └── chat.py            # Pydantic schemas for chat data
│   └── services
│       ├── auth_service.py    # Business logic for authentication
│       ├── agent_service.py    # Business logic for agent operations
│       └── chat_service.py     # Business logic for chat operations
├── requirements.txt            # Project dependencies
├── alembic.ini                 # Alembic configuration for migrations
├── README.md                   # Project documentation
└── alembic
    └── versions                # Migration scripts
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd fastapi-webapp
   ```

2. **Create a virtual environment:**
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```

4. **Set up the PostgreSQL database:**
   - Create a PostgreSQL database and update the database URL in `app/core/config.py`.

5. **Run database migrations:**
   ```
   alembic upgrade head
   ```

6. **Start the FastAPI application:**
   ```
   uvicorn app.main:app --reload
   ```

## Usage

- Access the application at `http://localhost:8000`.
- The API documentation can be found at `http://localhost:8000/docs`.

## Features

- **Home Page:** Welcome message and navigation options.
- **Pricing Plans:** View pricing plans and manage subscriptions.
- **Agent Selection:** Display agents and allow user selection.
- **Authentication:** User sign-up and sign-in with JWT.
- **Chat Functionality:** Access chat history and interact based on user plans.

## License

This project is licensed under the MIT License.