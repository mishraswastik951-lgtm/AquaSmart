# Setup Unit Testing Frameworks

This plan outlines the steps to configure unit testing in all three parts of the ContentMohalla project: `backend`, `client`, and `admin`.

## Proposed Changes

### 1. Backend Service (`backend/`)
We will configure **Jest** and **Supertest** to test the API endpoints. Since the backend uses ES Modules (`"type": "module"`), we will configure the test runner with the experimental VM modules flag.

#### [MODIFY] [package.json](file:///c:/Users/mishr/OneDrive/Desktop/ContentMohalla-main/ContentMohalla-main/backend/package.json)
- Add `jest` and `supertest` to `devDependencies`.
- Update the `"test"` script to: `"cross-env NODE_OPTIONS=--experimental-vm-modules jest"`.

#### [NEW] [__tests__/api.test.js](file:///c:/Users/mishr/OneDrive/Desktop/ContentMohalla-main/ContentMohalla-main/backend/__tests__/api.test.js)
- Add a basic unit test to verify the `/` Express endpoint returns the expected message.

---

### 2. Client Application (`client/`)
We will configure **Jest** and **React Testing Library** for Next.js 13.

#### [MODIFY] [package.json](file:///c:/Users/mishr/OneDrive/Desktop/ContentMohalla-main/ContentMohalla-main/client/package.json)
- Add `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom` to `devDependencies`.
- Add `"test"` and `"test:watch"` scripts.

#### [NEW] [jest.config.js](file:///c:/Users/mishr/OneDrive/Desktop/ContentMohalla-main/ContentMohalla-main/client/jest.config.js)
- Define standard Jest configuration for Next.js.

#### [NEW] [__tests__/index.test.js](file:///c:/Users/mishr/OneDrive/Desktop/ContentMohalla-main/ContentMohalla-main/client/__tests__/index.test.js)
- Add a component test for one of the key pages/components to verify rendering.

---

### 3. Admin Application (`admin/`)
We will configure **Jest** and **React Testing Library** for Next.js 15.

#### [MODIFY] [package.json](file:///c:/Users/mishr/OneDrive/Desktop/ContentMohalla-main/ContentMohalla-main/admin/package.json)
- Add `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom` to `devDependencies`.
- Add `"test"` and `"test:watch"` scripts.

#### [NEW] [jest.config.js](file:///c:/Users/mishr/OneDrive/Desktop/ContentMohalla-main/ContentMohalla-main/admin/jest.config.js)
- Define Jest configuration using Next.js 15 rules.

#### [NEW] [__tests__/index.test.js](file:///c:/Users/mishr/OneDrive/Desktop/ContentMohalla-main/ContentMohalla-main/admin/__tests__/index.test.js)
- Add a test verifying the page renders.

---

## Verification Plan

### Automated Tests
- Run `npm test` in the `backend` folder to ensure Express API tests pass.
- Run `npm test` in the `client` folder to ensure Next.js client component tests pass.
- Run `npm test` in the `admin` folder to ensure Next.js admin component tests pass.
