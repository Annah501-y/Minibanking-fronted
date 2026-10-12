Backend Developer Practical Assessment
Mini Banking System API
Recommended Duration	2 days
Primary Focus	Backend API, authentication, database design, and business logic
Preferred Backend	springboot
Frontend Context	React frontend will consume the API

1. Objective
Build a simple backend system for a mini banking application. The system should allow users to register, log in, manage a bank account, deposit money, withdraw money, and view transaction history.
The frontend will be built using React, but this task focuses mainly on the backend API and the correctness of the banking business logic.
2. Recommended Technology Stack
Option 2: Java springboot
•	Spring Boot
•	PostgreSQL, 
•	Spring Data JPA
3. Functional Requirements
3.1 User Registration
Create an API endpoint that allows a new user to register.
•	Required user details: full name, email address, phone number, and password.
•	Email address must be unique.
•	Password must be securely hashed before saving.
•	A bank account should be created automatically after successful registration.
•	Each account should have a unique account number.
•	Initial account balance should be 0.
3.2 User Login
•	User should log in using email and password.
•	If credentials are valid, return an authentication token.
•	Protected endpoints should only be accessible by authenticated users.
•	JWT authentication is preferred.
3.3 View Account Balance
Create an endpoint where a logged-in user can view their account details. The response should include:
•	Account holder name
•	Account number
•	Current balance
3.4 Deposit Money
•	Deposit amount must be greater than 0.
•	The account balance should increase after a successful deposit.
•	A transaction record should be created for every successful deposit.
•	Transaction details should include transaction type, amount, date and time, and account balance after the transaction.
3.5 Withdraw Money
•	Withdrawal amount must be greater than 0.
•	The user cannot withdraw more than the available balance.
•	The account balance should decrease after a successful withdrawal.
•	A transaction record should be created for every successful withdrawal.
•	Transaction details should include transaction type, amount, date and time, and account balance after the transaction.
3.6 Transaction History
•	Return all deposits and withdrawals made by the logged-in user.
•	Transactions should be ordered from newest to oldest.
•	Pagination is recommended.
4. Suggested API Endpoints
The candidate may design their own routes, but the following structure is recommended:
POST   /api/auth/register
POST   /api/auth/login

GET    /api/account
POST   /api/account/deposit
POST   /api/account/withdraw
GET    /api/account/transactions
 
5. Suggested Data Models
User
id
full_name
email
phone_number
password_hash
created_at
updated_at
Account
id
user_id
account_number
balance
created_at
updated_at
Transaction
id
account_id
transaction_type
amount
balance_after_transaction
created_at
6. Business Rules
1.	A user can only access their own account.
2.	A user cannot withdraw more than their available balance.
3.	Deposit and withdrawal amounts must be positive numbers.
4.	Passwords must not be stored as plain text.
5.	Every deposit or withdrawal must create a transaction record.
6.	Account balance updates and transaction creation should be handled safely to avoid inconsistent data.
7.	Authentication must be required for account-related operations.
7. Expected Deliverables
•	Source code pushed to GitHub/GitLab or submitted as a ZIP file.
•	README file explaining installation, running instructions, environment variables, API endpoints, and example request/response bodies.
•	Database schema or migration files.
•	Postman collection or API documentation.
•	Basic tests covering registration, login, deposit, withdrawal, insufficient balance, and transaction history.
8. Expected Outcome
By the end of the task, the system should be able to:
•	Register a new user.
•	Authenticate a user.
•	Automatically create a bank account for each user.
•	Show the current account balance.
•	Allow deposits and withdrawals.
•	Prevent withdrawals when balance is insufficient.
•	Store and display transaction history.
•	Protect user data so users cannot access accounts that do not belong to them.
9. Bonus Features
1.  Use Docker to run the application.
2.  Add API documentation using Swagger or OpenAPI.
3.  Add pagination and filtering to transaction history.
4.  Add account-to-account transfer functionality.
5.  Add admin endpoints to view all users and accounts.
6.  Add unit and integration tests.
7.  Add proper logging.
8.  Add rate limiting for login attempts.
9.  Add validation for phone number and email format.
10.  Deploy the backend to a free hosting platform.
10. Evaluation Criteria
Area	What will be checked
Code quality	Clean structure, readability, naming, and maintainability
API design	Clear endpoints, proper HTTP methods, and good response formats
Security	Password hashing, authentication, and authorization
Database design	Proper relationships between users, accounts, and transactions
Business logic	Correct handling of deposits, withdrawals, and balance updates
Error handling	Clear error messages and proper HTTP status codes
Testing	Meaningful tests for important flows
Documentation	Clear README and API usage examples
 
11. Submission Instructions
1. GitHub/GitLab repository link or ZIP file
2. README with setup instructions
3. API documentation or Postman collection
4. Short explanation of design decisions
5. Any assumptions made during development
12. Final Note to the Candidate
Focus on building a clean, secure, and well-structured backend. The system does not need to be a full banking application, but the main flows should work correctly and safely. The quality of the code, database design, and business logic is more important than the number of features implemented.


