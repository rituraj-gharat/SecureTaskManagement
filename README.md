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
