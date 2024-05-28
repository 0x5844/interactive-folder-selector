# Interactive Folder Selector 📁

This project  implements an interactive folder selector using React, Next.js, and TypeScript. Below are detailed instructions on setting up and running the project, including environment setup and operational details.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Approach and Time Allocation](#approach-and-time-allocation)
- [Dependencies](#dependencies)

## Prerequisites

- Node.js (v22.2.0)
- PNPM

For the ease of reference:

```bash
nvm install 22.2.0
nvm use 22.2.0
```

## Setup

```bash
pnpm install
```

## Running the Project

To run the project locally, use the following commands:

- **Development mode:**

  ```bash
  pnpm run dev
  ```

  This will start the development server on [http://localhost:3000](http://localhost:3000).

- **Production build and start:**

  ```bash
  pnpm run build
  pnpm run start
  ```

## Project Structure

- `src/types/`: TypeScript interfaces and types.
- `src/utils/`: Utility functions, including folder sorting and nesting using a merge sort algorithm.
- `src/hooks/`: React hooks for data fetching and state management.
- `src/components/`: React components for rendering the folder structure.
- `src/pages/`: Entry points for the application pages.

## Approach and Time Allocation

- **Requirement Understanding and Planning:** 30 minutes
- **Frontend Component Building:** 1 hour
- **Component Logic Implementation:** 1 hour
  - Utilizes merge sort for sorting folders and dynamic programming techniques for handling folder selections efficiently.
- **Debugging and Minor Adjustments:** 30 minutes
  - Focus on sorting logic, UI responsiveness, and handling edge cases in data.

## Dependencies

- **React and React DOM:** For building the user interface.
- **Next.js:** As the React framework for server-rendered applications.
- **TypeScript:** For type safety across the application.
- **TailwindCSS:** For utility-first CSS management.
Refer to `package.json` for a full list of dependencies and their respective versions
