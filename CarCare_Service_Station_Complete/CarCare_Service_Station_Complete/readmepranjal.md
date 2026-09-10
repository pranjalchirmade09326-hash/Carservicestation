database--users,vehicles,services,bookings
apis-409: duplicate resource,500: server error,admin--read del,booking-crud,vehicles-crud,services-crud.
## Roles
1. User - vehicle owner/customer
2. Admin - manages bookings, services and customers
3. Super Admin - full platform administration

## Stack
- Frontend: React + Vite + Axios + React Router
- Backend: Node.js + Express
- Database: MySQL
- ORM: Sequelize
- Authentication: JWT + bcrypt
- API testing: Postman



--
## Features
- User registration/login
- Role-based authorization
- Vehicle CRUD
- Service catalog
- Service booking CRUD
- Booking status workflow
- Admin dashboard
- Super Admin user management
- Search and pagination
- MySQL relationships and indexes
- Postman collection
- Interview documentation
- Seeded demo data

--
# CarCare - Interview Guide

## 1. Project introduction

"CarCare is a full-stack car service station management system. Users can maintain their vehicle details, browse available services and create or manage service bookings. Admins manage services and booking status, while the Super Admin has platform-level user management. I built the frontend with React and the backend with Node.js, Express and Sequelize using MySQL. JWT handles authentication, bcrypt handles password hashing, and middleware provides role-based authorization."

## 2. Roles

| Role | Responsibilities |
|---|---|
| User | Register/login, manage own vehicles, browse services, create/update/cancel own bookings |
| Admin | Manage services, view all bookings, update booking status, view users |
| Super Admin | All admin capabilities plus platform-level user deletion |

## 3. Architecture

React
→ Axios
→ Express REST API
→ JWT middleware
→ Role authorization
→ Controllers
→ Sequelize
→ MySQL

## 4. Authentication vs authorization

Authentication verifies the identity during login and returns a JWT.

Authorization checks whether the authenticated user's role allows the requested action.

Example:
- User can create a booking.
- Admin can update booking status.
- Super Admin can delete users.

## 5. CRUD

Vehicles:
- POST /vehicles
- GET /vehicles
- PUT /vehicles/:id
- DELETE /vehicles/:id

Bookings:
- POST /bookings
- GET /bookings/my
- PUT /bookings/:id
- DELETE /bookings/:id

Services:
- POST /services
- GET /services
- PUT /services/:id
- DELETE /services/:id

## 6. Database relationships

- User 1:N Vehicle
- User 1:N Booking
- Vehicle 1:N Booking
- Service 1:N Booking

The booking table connects the user, vehicle and service.

## 7. Why indexes?

Common indexes:
- users.email for login
- vehicles.ownerId for user's cars
- vehicles.registrationNo UNIQUE for lookup and duplicate prevention
- bookings.userId for booking history
- bookings.bookingDate for schedule queries
- bookings.status for admin filters
- services.isActive for active-service queries

Indexes improve read performance but increase storage and write cost.

## 8. Ownership authorization

A user must not be able to update another user's vehicle or booking.

The backend checks:
`resource.ownerId/userId === req.user.id`

This check belongs on the server; frontend hiding buttons is not enough.

## 9. Booking state machine

A booking can move through:
`pending → confirmed → in_progress → completed`

Cancellation is possible before completion.

The backend validates status values so clients cannot send arbitrary states.

## 10. Pagination

Service listing supports `page` and `limit`.

Offset pagination is easy to implement for a service catalog. For a very large appointment history, cursor pagination could be considered.

## 11. N+1 problem

When loading bookings, fetching user, vehicle and service separately for every booking can create N+1 queries.

This project uses Sequelize `include` eager loading to fetch related records together.

In GraphQL, DataLoader is another common solution.

## 12. Idempotency

Retries can happen when a mobile connection is unstable.

For production booking creation, an idempotency key could be accepted so the same client request is not accidentally turned into multiple bookings.

The server can store the key and return the original booking for a repeated request.

## 13. Security

Implemented:
- bcrypt password hashing
- JWT authentication
- role-based authorization
- ownership checks
- public registration only creates User accounts
- basic validation

Production improvements:
- Helmet
- rate limiting
- request validation with Zod/Joi
- HTTPS
- secure cookies where suitable
- audit logs
- stricter CORS
- database transactions for booking workflows
- payment provider integration if online payments are added

## 14. Scaling

For higher traffic:
1. Add indexes after checking query plans.
2. Use connection pooling.
3. Cache service catalog.
4. Use Redis for caching/rate limits.
5. Queue reminders and notifications.
6. Store invoices/photos in object storage.
7. Add database read replicas if required.
8. Containerize the backend and use a load balancer.

## 15. Interview questions

### Why MySQL?
The domain has clear relationships between users, vehicles, services and bookings, so a relational database fits naturally.

### Why Sequelize?
It gives model definitions, relationships, validation support and query abstractions while still using MySQL.

### Why JWT?
It provides stateless authentication for REST API requests.

### Why bcrypt?
Passwords should never be stored in plaintext. bcrypt is designed for password hashing and is intentionally computationally expensive.

### Why three roles?
The business responsibilities are different: vehicle owners use the service, Admin manages operations, and Super Admin controls platform-level administration.

### What is 401 vs 403?
401 means the request is not properly authenticated. 403 means the user is authenticated but lacks permission.

### How would you prevent double booking?
Production implementation should use a transaction and a database constraint or locking strategy based on the service station's slot model. An idempotency key also prevents duplicate submissions caused by client retries.

### How would you add online payment?
Create a payment order through a payment provider, keep payment status server-side, verify the provider webhook/signature, and only mark the booking as paid after verified confirmation.

### How would you add notifications?
Use a background queue for SMS/email/WhatsApp notifications instead of making the booking request wait for external providers.

## 16. Demo flow

1. Start MySQL.
2. Create `carcare` database.
3. Configure `.env`.
4. Run `npm run seed`.
5. Start backend.
6. Start frontend.
7. Login as User.
8. Add a vehicle.
9. Create a service booking.
10. Login as Admin and change booking status.
11. Login as Super Admin and demonstrate user management.
12. Open Postman and show protected APIs.
--