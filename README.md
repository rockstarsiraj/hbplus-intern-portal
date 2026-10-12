# HB+ Intern Portal: Secure Cross-Platform Google Authentication App

> A production-grade, secure, cross-platform enterprise portal built with **React Native**, **Expo (SDK 57)**, **React Native Web**, **TypeScript**, and **Firebase Authentication & Cloud Firestore**.

---

## 1. Project Overview

The **HB+ Intern Portal** is designed to provide identity verification and access gating for organization team members and interns.

The primary security objective is to authenticate users via **Google OAuth 2.0** and **strictly restrict application access** exclusively to users whose verified Google email address belongs to the organization domain:
$$\text{ALLOWED DOMAIN: } \mathbf{@hbplus.fit}$$

### Domain Eligibility Examples
| Email Address | Verification Status | Access Result | Reason |
| :--- | :--- | :--- | :--- |
| `user@hbplus.fit` | Verified (`true`) |  **Access Granted** | Exact domain match and verified account |
| `EMPLOYEE@HBPLUS.FIT` | Verified (`true`) |  **Access Granted** | Case-insensitive match |
| `intern@hbplus.fit` | Unverified (`false`) | ❌ **Access Denied** | Unverified identity cannot be trusted |
| `user@gmail.com` | Verified (`true`) | ❌ **Access Denied** | Consumer domain outside organization |
| `user@yahoo.com` | Verified (`true`) | ❌ **Access Denied** | Unauthorized third-party domain |
| `attacker@hbplus.fit.evil.com` | Verified (`true`) | ❌ **Access Denied** | Subdomain / suffix attack strictly blocked |
| `user@another-hbplus.fit` | Verified (`true`) | ❌ **Access Denied** | Lookalike spoofing domain rejected |

---

## 2. Core Concepts: Authentication vs. Authorization

For beginners, understanding the difference between **Authentication** and **Authorization** is essential:

1. **Authentication ("Who are you?"):**
   - Handled by **Google OAuth 2.0** and **Firebase Authentication**.
   - Google cryptographically validates the user's password, two-factor authentication, and confirms their identity with a signed token containing their email and verification status.
2. **Authorization ("Are you allowed in?"):**
   - Handled by our **Domain Validation Engine** (frontend UX) and **Cloud Firestore Security Rules** (backend data enforcement).
   - Even if Google confirms that `someone@gmail.com` is a real person, our authorization layer rejects them because their email does not end with `@hbplus.fit`.
   - **Crucial Rule:** The frontend domain check only protects the UI flow. **Cloud Firestore Security Rules** independently enforce access at the database layer, ensuring unauthorized users can never read or write records.

---

## 3. Technology Stack

- **Framework**: [Expo SDK 57](https://expo.dev) & [React Native 0.86.3](https://reactnative.dev)
- **Web Layer**: [React Native Web 0.21.2](https://necolas.github.io/react-native-web/)
- **Language**: [TypeScript 6.0](https://www.typescriptlang.org) (configured in strict mode)
- **Identity & Backend**:
  - [Firebase Authentication (v13 Modular SDK)](https://firebase.google.com/docs/auth) with Google Identity Provider
  - [Cloud Firestore](https://firebase.google.com/docs/firestore) with server-side Security Rules
- **Testing**: [Jest 30](https://jestjs.io/) & [ts-jest](https://kulshekhar.github.io/ts-jest/) (46 automated unit and security tests)
- **Styling**: Vanilla React Native StyleSheet with custom design system tokens (Restrained Indigo `#1D4ED8`, Slate Charcoal `#0F172A`, Clean Gray `#F8FAFC`)
- **Web Hosting**: [Netlify](https://www.netlify.com) (`netlify.toml` pre-configured with SPA rewrites)

---

## 4. Application Architecture & Folder Structure

```
Secure Cross-Platform Google Authentication App/
├── App.tsx                     # Root App component, AuthProvider, and route gating
├── index.ts                    # Entry point registering root component
├── app.json                    # Expo configuration (bundle ID, package name, web bundler)
├── package.json                # Dependencies, testing, and build scripts
├── tsconfig.json               # TypeScript strict compiler options & Jest types
├── jest.config.js              # Jest configuration for TypeScript unit testing
├── netlify.toml                # Netlify deployment configuration & SPA fallback rules
├── firebase.json               # Firebase CLI configuration for rules & emulator suite
├── .env.example                # Template for Firebase public client configuration
├── .gitignore                  # Prevents committing secrets, .env files, node_modules
│
├── src/
│   ├── components/
│   │   ├── BrandLogo.tsx           # HB+ brand monogram component
│   │   ├── GoogleIcon.tsx          # Multi-color Google "G" vector / native icon
│   │   ├── GoogleSignInButton.tsx  # Accessible Google sign-in button with loading state
│   │   ├── LoadingIndicator.tsx    # Accessible status indicator
│   │   ├── ErrorMessage.tsx        # Dismissible error alert banner
│   │   ├── AppHeader.tsx           # Top navigation bar with user chip and logout
│   │   ├── ProfileCard.tsx         # Displays real verified identity details
│   │   └── SecurityCard.tsx        # Visual breakdown of backend security rules
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx         # Reactive auth state machine and session restoration
│   │
│   ├── hooks/
│   │   └── useAuth.ts              # Hook to consume AuthContext across components
│   │
│   ├── services/
│   │   ├── firebase.ts             # Firebase modular SDK initialization & config check
│   │   ├── authService.ts          # Cross-platform Google sign-in & sign-out logic
│   │   └── userService.ts          # Firestore profile synchronization (users/{uid})
│   │
│   ├── utils/
│   │   ├── domainValidation.ts     # Strict domain validation engine (@hbplus.fit)
│   │   └── authErrors.ts           # Human-friendly Firebase error messages
│   │
│   ├── types/
│   │   ├── auth.ts                 # Auth state, validation results, and user types
│   │   └── user.ts                 # Cloud Firestore profile schema
│   │
│   └── constants/
│       └── appConfig.ts            # Domain constants, theme colors, typography
│
├── firebase/
│   ├── firestore.rules             # Backend security rules enforcing @hbplus.fit domain
│   └── firestore.indexes.json      # Database index configuration
│
└── tests/
    ├── domainValidation.test.ts    # 24 tests for domain edge cases, attacks, malformed inputs
    ├── firestoreRules.test.ts      # 12 tests for security rule predicates and anti-tamper logic
    └── authFlow.test.ts            # 10 tests simulating auth state transitions, cancel, error
```

---

## 5. Security Architecture & Implementation

### 5.1 Step-by-Step Authentication Flow
1. **User clicks "Sign in with Google"**:
   - On **Web**: Triggers `signInWithPopup(auth, googleProvider)` with `select_account` forced.
   - On **Mobile (Android/iOS)**: Uses `expo-auth-session` with OAuth client IDs, exchanges ID token for Firebase credential via `signInWithCredential`.
2. **Identity Verification**:
   - Firebase confirms user credentials against Google Identity servers.
   - User identity (`email`, `emailVerified`, `uid`, `displayName`, `photoURL`) is retrieved directly from the cryptographically signed token.
3. **Domain Validation Engine (`src/utils/domainValidation.ts`)**:
   - Extracts the exact domain portion after the `@` symbol.
   - Checks:
     - Is the email verified? (`emailVerified === true`)
     - Does the domain match `hbplus.fit` exactly (case-insensitive)?
     - Rejects missing emails, whitespace, malformed emails, subdomains, and lookalike domains.
4. **Enforcement**:
   - If **Authorized**: Profile is synced to Firestore under `users/{uid}`, and user is transitioned to the Dashboard.
   - If **Unauthorized**: Session is **immediately purged** via `firebaseSignOut(auth)`. State transitions to `AccessDeniedScreen`, showing the rejected email and an account switch option. Protected content is never exposed.
5. **Session Restoration**:
   - When the browser refreshes or app reopens, `onAuthStateChanged` verifies the domain again before granting access, preventing cached unauthorized access.

### 5.2 Backend Cloud Firestore Security Rules (`firebase/firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default Deny All fallback
    match /{document=**} {
      allow read, write: if false;
    }

    function isAuthenticated() {
      return request.auth != null && request.auth.uid != null;
    }

    function isHbPlusAuthorized() {
      return isAuthenticated()
        && request.auth.token.email != null
        && request.auth.token.email_verified == true
        && request.auth.token.email.matches('(?i)^[a-zA-Z0-9._%+-]+@hbplus[.]fit$');
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isValidProfileData(userId) {
      let data = request.resource.data;
      return data.uid == userId
        && data.email == request.auth.token.email
        && data.domain == 'hbplus.fit'
        && (!('role' in data) || data.role == 'user')
        && (!('isAdmin' in data) || data.isAdmin == false);
    }

    match /users/{userId} {
      allow read: if isOwner(userId) && isHbPlusAuthorized();
      allow create, update: if isOwner(userId) && isHbPlusAuthorized() && isValidProfileData(userId);
      allow delete: if false;
    }
  }
}
```

#### What These Rules Enforce:
1. **Domain Restriction**: Only tokens ending with `@hbplus.fit` can read or write.
2. **Email Verification**: Only accounts verified by Google are admitted.
3. **User Isolation**: A user with UID `A` can only read/write `/users/A`. They cannot read `/users/B` by altering parameters.
4. **Privilege Escalation Prevention**: Users cannot assign themselves `role: 'admin'` or `isAdmin: true` in their profile payload.

---

## 6. Step-by-Step Firebase & Google Cloud Setup Guide

Follow these exact steps to connect your own Firebase project:

### Step 1: Create a Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g., `hbplus-intern-portal`).
4. Choose whether to enable Google Analytics (optional), then click **Create project**.

### Step 2: Register Your Web Application
1. On the Firebase Project Overview page, click the **Web icon** (`</>`) to add an app.
2. Set the App nickname to `HB+ Intern Portal Web`.
3. Do not check "Also set up Firebase Hosting" (we are deploying with Netlify).
4. Click **Register app**.
5. Firebase will display `firebaseConfig` containing:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
   - `measurementId`
6. Keep this window open; you will paste these values into your `.env` file.

### Step 3: Enable Google Sign-In in Firebase Authentication
1. In the left sidebar of the Firebase Console, navigate to **Build** → **Authentication**.
2. Click **Get started**.
3. Under the **Sign-in method** tab, click **Google** from the list of providers.
4. Switch the **Enable** toggle to **ON**.
5. Select a **Project support email** from the dropdown.
6. Click **Save**.

### Step 4: Configure Authorized Domains in Firebase
1. Under **Authentication** → **Settings** → **Authorized domains**:
2. Notice `localhost` is authorized by default.
3. When you deploy to Netlify later, click **Add domain** and enter your Netlify subdomain (e.g., `your-app-name.netlify.app`).

### Step 5: Create Cloud Firestore Database
1. In the Firebase left sidebar, navigate to **Build** → **Firestore Database**.
2. Click **Create database**.
3. Choose a Firestore location close to your users (e.g., `nam5 (us-central)` or `asia-south1`).
4. Select **Start in production mode** (our security rules will protect it).
5. Click **Create**.

### Step 6: Deploy Firestore Security Rules
1. In Firebase Console, go to **Firestore Database** → **Rules** tab.
2. Paste the entire content of `firebase/firestore.rules` from this repository.
3. Click **Publish**.

*(Alternatively, if using the Firebase CLI locally, run `npx firebase deploy --only firestore:rules` after running `npx firebase login`).*

### Step 7: (Optional) Register Android & iOS Apps
- **For Android**:
  - In Firebase Console, click **Add app** → **Android icon**.
  - Package name: `fit.hbplus.internportal` (matches `app.json`).
  - Add your debug SHA-1 signing fingerprint (obtained by running `npx expo credentials:manager` or `keytool`).
- **For iOS**:
  - In Firebase Console, click **Add app** → **iOS icon**.
  - Bundle ID: `fit.hbplus.internportal` (matches `app.json`).

---

## 7. Environment Configuration

1. In the root directory of this project, duplicate `.env.example` as `.env`:
   ```bash
   cp .env.example .env
   ```
2. Populate the keys with your credentials from Step 2:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=hbplus-intern-portal.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=hbplus-intern-portal
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=hbplus-intern-portal.firebasestorage.app
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef...
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234
   ```
> **Security Note:** Variables prefixed with `EXPO_PUBLIC_` are bundled into the client build. Firebase Web API keys are public client identifiers (authorized domains and Firestore rules form the security boundary), NOT service-account secrets. Private keys or Google secrets must never be placed here.

---

## 8. Running the Application Locally

### Running the Web Application
```bash
# Start the Expo development server with web bundler
npm run web

# Alternatively, start Expo interactive menu
npm start
```
Open your browser at `http://localhost:8081`.

### Running Android or iOS
```bash
# Android (requires Android Studio / emulator or Expo Go)
npm run android

# iOS (requires macOS with Xcode / simulator or Expo Go)
npm run ios
```

---

## 9. Automated Testing & Verification

The codebase includes **46 automated tests** spanning domain validation, security rules, and simulated state machines.

```bash
# Run all automated tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run TypeScript strict typechecking
npm run typecheck
```

### Actual Test Results
```text
PASS tests/authFlow.test.ts (10 tests)
PASS tests/firestoreRules.test.ts (12 tests)
PASS tests/domainValidation.test.ts (24 tests)

Test Suites: 3 passed, 3 total
Tests:       46 passed, 46 total
Snapshots:   0 total
Time:        1.044 s
Ran all test suites.
```

---

## 10. Building for Production & Netlify Deployment

### Step 1: Build the Web Bundle
Run the production web export:
```bash
npm run build:web
```
This generates the optimized static bundle inside the `dist/` directory.

### Step 2: Test the Production Build Locally
```bash
npx serve -s dist -l 8081
```
Open `http://localhost:8081` to verify the production bundle.

### Step 3: Deploy to Netlify
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **Add new site** → **Import an existing project**.
3. Select your GitHub repository.
4. Netlify will automatically detect `netlify.toml` with:
   - **Build command**: `npm run build:web`
   - **Publish directory**: `dist`
5. Go to **Site configuration** → **Environment variables** and add all `EXPO_PUBLIC_*` variables from your `.env` file.
6. Click **Deploy site**.
7. Once deployed, copy your site domain (e.g., `https://hbplus-intern-portal.netlify.app`) and add it to **Authorized Domains** in the Firebase Console (see Section 6, Step 4).

---

## 11. GitHub Submission Guide

Follow these beginner-friendly Git commands to submit your project to GitHub:

### Step 1: Check Working Tree & Ignored Files
```bash
git status
```
*Verify that `.env` and `node_modules/` are not tracked (they are protected by `.gitignore`).*

### Step 2: Stage and Commit All Files
```bash
git add .
git commit -m "feat: complete secure cross-platform Google authentication app for HB+"
```

### Step 3: Create GitHub Repository & Push
1. Go to [GitHub](https://github.com) and click **New repository**.
2. Name it `hbplus-intern-portal`.
3. Set visibility to **Public** or **Private** as desired. Do NOT initialize with a README (we already have one).
4. Run the following commands:
```bash
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/hbplus-intern-portal.git
git push -u origin main
```

---

## 12. Common Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `auth/popup-closed-by-user` | The user closed the Google sign-in window before finishing. | The app handles this gracefully and resets the sign-in button. Simply click sign-in again. |
| `auth/unauthorized-domain` | The URL hostname is not listed in Firebase Authorized Domains. | Add `localhost` or your Netlify domain under Firebase Console → Authentication → Settings → Authorized domains. |
| `auth/popup-blocked` | Browser blocked the OAuth popup window. | Allow popups for the site in your browser address bar. |
| Missing Firebase Config error | `.env` file is missing or has empty values. | Copy `.env.example` to `.env` and fill in your Firebase Web App credentials. |
| Permission denied in Firestore | Authenticated user is not an authorized `@hbplus.fit` user. | Expected security behavior! Firestore rules reject non-organizational requests at the database layer. |

---

## 13. Security Limitations & Assumptions

1. **Email Verification**: Google accounts provisioned by Google Workspace for domains (like `@hbplus.fit`) are automatically verified. For external Google accounts, `emailVerified` must equal `true`.
2. **Role Management**: The current application defaults client documents to `role: 'user'`. Administrative privilege escalation is prevented at the database layer. Production administrator provisioning should be managed via Firebase Admin SDK Custom Claims (`setCustomUserClaims`).
3. **Environment Security**: Public client credentials (`EXPO_PUBLIC_*`) identify the Firebase project. Backend database access is guarded by Firebase Authentication and Firestore Security Rules.
