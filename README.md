# CRM API

A CRM API is a robust Customer Relationship Management (CRM) backend system built with [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/), and [PostgreSQL](https://www.postgresql.org/). It provides a comprehensive set of features for managing users, companies, contacts, deals, and activities, designed with scalability and security in mind.

## 🚀 Features

- **Authentication & Authorization**: Secure JWT-based authentication with Role-Based Access Control (RBAC).
- **User Management**: Full CRUD operations for users with role assignment (Super Admin, Admin, Manager, User).
- **Company Management**: Manage company details, industry, and related data.
- **Contact Management**: Track contacts associated with companies, including status tracking (Lead, Customer, etc.).
- **Deal Management**: Manage sales pipelines with deal stages (New, Qualified, Proposal Sent, etc.).
- **Activity Tracking**: Log calls, emails, meetings, notes, and tasks.
- **Security**: Integrated with Helmet for header security and Throttler for rate limiting.
- **Validation**: Global validation pipes using `class-validator`.
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation.
- **Database**: Type-safe database access with Prisma ORM.

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Documentation**: Swagger (OpenAPI)
- **Testing**: Jest (Unit & E2E)

## 📋 Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- PostgreSQL database

## ⚙️ Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd crm-api
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Environment Configuration**

    Create a `.env` file in the root directory and configure the following variables:

    ```env
    PORT=3000
    DATABASE_URL="postgresql://user:password@localhost:5432/crm_db?schema=public"
    JWT_SECRET="your-super-secret-key"
    JWT_EXPIRES_IN="1d"
    ```

4.  **Database Setup**

    Run the Prisma migrations to set up your database schema:

    ```bash
    npx prisma migrate dev
    ```

## ▶️ Running the Application

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

The API will be available at `http://localhost:3000/api/v1`.

## 📚 API Documentation

Once the application is running, you can access the interactive Swagger documentation at:

```
http://localhost:3000/api/docs
```

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 📂 Project Structure

```
src/
├── activities/     # Activity management module
├── auth/           # Authentication & Authorization module
├── common/         # Shared decorators, filters, guards, interceptors
├── companies/      # Company management module
├── contacts/       # Contact management module
├── database/       # Database connection module
├── deals/          # Deal management module
├── users/          # User management module
├── app.module.ts   # Main application module
└── main.ts         # Application entry point
```


