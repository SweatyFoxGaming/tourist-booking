```markdown
# tourist-booking Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns and conventions used in the `tourist-booking` TypeScript codebase. You'll learn about file naming, import/export styles, commit conventions, and how to write and run tests. While no specific frameworks or CI workflows are detected, this guide will help you maintain consistency and efficiency when contributing to the project.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userService.ts`, `bookingController.ts`

### Import Style
- Use **alias imports** to reference modules.
  - Example:
    ```typescript
    import { Booking } from '@models/booking';
    ```

### Export Style
- Use **named exports** for modules and functions.
  - Example:
    ```typescript
    // bookingService.ts
    export function createBooking(data: BookingData) { ... }
    export const BOOKING_STATUS = { ... };
    ```

### Commit Messages
- Follow **conventional commit** format.
- Use the `feat` prefix for new features.
  - Example:
    ```
    feat: add booking cancellation endpoint
    ```

## Workflows

### Add a New Feature
**Trigger:** When implementing a new feature or module  
**Command:** `/add-feature`

1. Create a new file using camelCase naming.
2. Use alias imports for dependencies.
3. Export all functions and constants using named exports.
4. Write a test file named `featureName.test.ts`.
5. Commit your changes with a conventional commit message, starting with `feat:`.

### Write and Run Tests
**Trigger:** When adding or updating functionality  
**Command:** `/run-tests`

1. Create a test file alongside your implementation, named `yourFeature.test.ts`.
2. Write tests using the project's preferred (but unspecified) testing framework.
3. Run the test suite using the project's test runner (see project documentation or package scripts).

## Testing Patterns

- Test files are named using the pattern `*.test.*` (e.g., `bookingService.test.ts`).
- Place test files near the code they test or in a dedicated `tests` directory.
- Use the project's chosen testing framework (unspecified; check `package.json` or ask a maintainer).
- Example test file:
  ```typescript
  // bookingService.test.ts
  import { createBooking } from './bookingService';

  describe('createBooking', () => {
    it('should create a booking with valid data', () => {
      // test implementation
    });
  });
  ```

## Commands
| Command        | Purpose                                          |
|----------------|--------------------------------------------------|
| /add-feature   | Scaffold and commit a new feature                |
| /run-tests     | Run the test suite for the project               |
```
