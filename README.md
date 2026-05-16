# Task Management Application

## Overview
This is a robust, full-stack task management application designed for teams. It leverages modern web technologies to provide a seamless, real-time experience for managing projects and tasks. 

## Key Features
- **Secure Authentication**: User sign-up, login, and protected routes using Supabase Auth.
- **Project Management**: Create, view, and organize projects effectively.
- **Task Tracking**: Inside each project, users can create tasks, assign statuses (Todo, In Progress, Done), and seamlessly manage their workflow.
- **Real-Time Synchronization**: UI updates automatically without a page refresh when tasks are created, updated, or deleted across multiple clients.

## Tech Stack
- **Frontend**: Next.js (React), Tailwind CSS
- **Backend / Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime Subscriptions

## Architecture & Database Design
- The application implements a clear separation of concerns, maintaining a robust frontend structure with reusable components and efficient state management.
- **Database Schema**:
  - `projects`: Contains project metadata (`id`, `title`, `description`, `created_at`, `created_by`).
  - `tasks`: Associated with projects via foreign keys (`project_id`), tracking individual task details and statuses.
  - Foreign key constraints ensure data integrity and automatic cascading where necessary.
  - Row Level Security (RLS) is recommended in Supabase to guarantee that users can only access their authorized data.

## Setup Instructions
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Create a `.env.local` file based on the provided `.env.local.example` and populate it with your Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Run the development server with `npm run dev`.
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
