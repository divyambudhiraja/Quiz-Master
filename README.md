# QuizMaster

QuizMaster is a full‑stack online quiz platform where users can register, take quizzes by ID, and view their results, while admins host and manage quizzes.

- `auth-quiz-service` — authentication and users
- `question-bank-service` — quiz questions
- `result-service` — quiz results and reports

## Features

- User registration and login
- Host quizzes (admin only)
- Join quizzes by ID
- Admin panel to manage quizzes and users
- Report card for users (scores and attempted quizzes)

## Tech Stack

- Frontend: HTML/CSS/JS (static)
- Backend: Spring Boot (Java)
- Database: MySQL

## Project Structure

- `online-quiz-frontend/` — static frontend (`index.html`)
- `auth-quiz-service/` — auth and users (port 8080)
- `question-bank-service/` — questions (port 8081)
- `result-service/` — results (port 8082)

## Prerequisites

- Java (JDK 11+ recommended)
- Maven
- MySQL running locally

## Database Setup

The services are configured to use these databases:

- `quiz_app` (auth)
- `question_bank` (questions)
- `result_service` (results)

Create them in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS quiz_app;
CREATE DATABASE IF NOT EXISTS question_bank;
CREATE DATABASE IF NOT EXISTS result_service;
```

Update credentials in each service’s `application.properties` if needed:

- `auth-quiz-service/src/main/resources/application.properties`
- `question-bank-service/src/main/resources/application.properties`
- `result-service/src/main/resources/application.properties`

## Run the Backend Services

Open three terminals and run:

```bash
cd auth-quiz-service
mvn spring-boot:run
```

```bash
cd question-bank-service
mvn spring-boot:run
```

```bash
cd result-service
mvn spring-boot:run
```

Expected ports:

- Auth: `http://localhost:8080`
- Questions: `http://localhost:8081`
- Results: `http://localhost:8082`

## Run the Frontend

Serve `online-quiz-frontend/` with any static server:

```bash
cd online-quiz-frontend
python3 -m http.server 5500
```

Then open:

```
http://127.0.0.1:5500/index.html
```

## Environment Notes

- If you see errors referencing `String.isBlank()`, your Java version is older than 11. Use JDK 11+ or replace `isBlank()` with `trim().isEmpty()`.

## Useful Endpoints

- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/make-admin`
  - `GET /api/auth/users`
- Questions
  - `POST /api/questions/add`
  - `GET /api/questions/quiz/{quizId}`
- Results
  - `GET /api/results/quiz/{quizId}`
  - `GET /api/results/report/{studentUsername}`

## Troubleshooting

- **Admin panel errors**: Ensure all three services are running and MySQL is up.
- **CORS issues**: Frontend should be served from `http://localhost:5500` or `http://127.0.0.1:5500` (allowed in CORS).
- **Database errors**: Verify DB names and credentials match `application.properties`.

