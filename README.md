📌 Secure Task Management System

Role-Based Access Control (RBAC) • NestJS API • Angular Dashboard • JWT Auth

A modern, secure, full-stack task management system featuring JWT authentication, multi-organization roles, RBAC enforcement, and a drag-and-drop Kanban UI.
Built with NestJS, TypeORM, PostgreSQL, Angular, and Nx Workspace.

🚀 Features
🔐 Authentication & Authorization

JWT-based login with signed tokens

Passwords hashed using bcrypt

Multi-organization support

Three roles:

Owner – Full control

Admin – Manage tasks

Viewer – Read-only

🛡️ RBAC Enforcement

Route-level protection using Guards

Service-level validation against user/org/role

Viewers cannot modify data — enforced on backend

Owners/Admins have write protections per organization scope

🗂️ Task Management

Create, update, delete, reorder tasks

Three Kanban states: To-Do, Doing, Done

Drag-and-drop UI

Tasks scoped by organization

Activity always tied to createdByUserId

💅 Modern UI/UX

Clean Vercel/Notion-inspired interface

Soft shadow boards, rounded cards

Responsive layout

Task modals and floating actions

🧱 Architecture

Nx monorepo

Shared libraries:

libs/auth

libs/data

Fully typed entities and DTOs

Modular NestJS API structure

🏗️ Tech Stack

Backend

NestJS

TypeORM

PostgreSQL

JWT + Passport

Class Validators

RBAC via custom guards

Frontend

Angular 17

DragDropModule (Angular CDK)

Standalone Components

Reactive state using signals

Dev Tools

Nx Workspace

Docker (optional)

VSCode recommended

📦 Installation
1. Clone the repository
```
git clone https://github.com/yourusername/secure-tasks.git
cd secure-tasks
```
2. Install dependencies
```
npm install
```
3. Setup environment variables

Create two env files:

apps/api/.env
```
DATABASE_URL=postgres://USER:PASS@localhost:5432/secure_tasks
JWT_SECRET=your-secret
JWT_EXPIRES_IN=1d
```
▶️ Running the App (Nx)
Start the backend: nx serve api
Start the Angular dashboard: nx serve dashboard

Backend → http://localhost:3333
Frontend → http://localhost:4200

🔄 API Overview
POST /auth/register

Registers a new Owner + Organization.

POST /auth/login

Returns JWT.

GET /tasks

Returns tasks for logged-in user/org.

POST /tasks

Creates a task (Admins + Owners only).

PUT /tasks/:id

Updates a task.

DELETE /tasks/:id

Deletes a task.
Unauthorized attempts (Viewer trying to write) return:

```
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```
🧠 RBAC Logic Summary
1. Guards

Validate JWT

Attach user + roles to request

Verify route access using custom decorator @Roles('ADMIN')

2. Service-Level Checks

Every write action checks:

Does user belong to this org?

Does user have a privileged role?

3. Enforcement

Viewers → Read-only
Admins → Write inside org
Owners → Full access

📌 Future Improvements

Organization switching (multi-tenant UI)

Activity logs

Real-time updates (WebSockets)

Dark mode

Team invites via email

Task comments & attachments

🤝 Contributing

Pull requests welcome!
For major changes, open an issue first.

Connect
email - rgharat1@asu.edu / riturajgharat.14@gmail.com
Limkedin - https://www.linkedin.com/in/riturajgharat/

