# TaxMate Client (React Frontend)

The frontend web application for TaxMate, built with React 18, TypeScript, and modern tooling.

## 🏗️ Project Structure

```
client/
├── public/                # Static assets
│   ├── favicon.svg       # App favicon
│   └── icons.svg         # SVG icon sprite
├── src/
│   ├── api/              # HTTP client and API calls
│   │   ├── auth.ts       # Authentication API
│   │   └── client.ts     # Axios configuration
│   ├── assets/           # Images and static files
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # shadcn/ui base components
│   │   ├── FieldError.tsx
│   │   ├── FormError.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── TaxMateLogo.tsx
│   ├── context/          # React context providers
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useAuth.ts
│   ├── lib/              # Utility functions
│   │   ├── device.ts     # Device detection
│   │   ├── schemas.ts    # Zod validation schemas
│   │   └── utils.ts      # General utilities
│   ├── pages/            # Route components
│   │   ├── ChangePasswordPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
└── tailwind.config.js    # TailwindCSS configuration
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **npm** or **yarn**

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with API URL (usually http://localhost:8080)
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

The app will open at `http://localhost:5173`

## 🎯 Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run preview      # Preview production build locally

# Building
npm run build        # Create production build
npm run build:dev    # Create development build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix auto-fixable ESLint issues
npm run type-check   # Run TypeScript type checking

# Testing (when implemented)
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 🎨 Features & Pages

### 🔐 Authentication Flow
- **Landing Page** (`/`) - Marketing page with pricing and features
- **Login Page** (`/login`) - Email/password authentication
- **Signup Page** (`/signup`) - User registration with validation
- **Change Password** (`/change-password`) - Secure password updates

### 👤 User Experience
- **Dashboard** (`/dashboard`) - Main user interface with personalized greeting
- **Onboarding Flow** - 3-step guided setup for new users
- **Profile Management** - View and edit user information including ABN

### 🛡️ Security Features
- **Protected Routes** - Automatic redirect to login for unauthenticated users
- **Token Management** - Automatic refresh with Axios interceptors
- **Cross-tab Sync** - Authentication state synced across browser tabs
- **Secure Logout** - Clear all tokens and redirect to login

## 🎨 UI Components

### Base Components (shadcn/ui)
- **Button** - Primary, secondary, outline, and ghost variants
- **Input** - Text input with error states and validation
- **Card** - Container component for content sections
- **Label** - Accessible form labels

### Custom Components
- **TaxMateLogo** - Branded logo component
- **ProtectedRoute** - Authentication wrapper for private pages
- **FieldError** - Individual field error display
- **FormError** - General form error messages

### Styling System
- **TailwindCSS** - Utility-first CSS framework
- **CSS Variables** - Consistent theming and colors
- **Responsive Design** - Mobile-first approach
- **Dark Mode Ready** - Prepared for future dark theme

## ⚡ Technical Features

### State Management
- **React Context** - Authentication state management
- **Local Storage** - Persistent login sessions
- **Cross-tab Communication** - Storage event listeners

### Form Handling
- **React Hook Form** - Performant form library
- **Zod Validation** - Runtime type checking and validation
- **Real-time Feedback** - Instant validation on user input

### HTTP Client
- **Axios** - Promise-based HTTP client
- **Interceptors** - Automatic token refresh on 401 responses
- **Error Handling** - Consistent API error processing
- **Request/Response Logging** - Development debugging

### Routing
- **React Router v6** - Client-side routing
- **Protected Routes** - Authentication guards
- **Nested Layouts** - Consistent page structure

## 🔧 Configuration

### Environment Variables
```env
# API Configuration
VITE_API_URL=http://localhost:8080

# Development
VITE_DEV_MODE=true
```

### Vite Configuration
- **TypeScript support** - Full type checking
- **Path aliases** - Clean import statements
- **Hot Module Replacement** - Fast development feedback
- **Production optimization** - Code splitting and minification

### TailwindCSS Setup
- **Custom theme** - Brand colors and typography
- **Component classes** - Reusable style combinations
- **Responsive utilities** - Mobile-first breakpoints

## 🎯 User Flows

### New User Journey
1. **Landing Page** → View pricing and features
2. **Signup** → Create account with email/password
3. **Login** → Authenticate and get redirected to dashboard
4. **Onboarding** → Complete 3-step profile setup
5. **Dashboard** → Access main application features

### Returning User Journey
1. **Auto-login** → Token validation on page load
2. **Dashboard** → Direct access to main interface
3. **Profile Updates** → Modify information as needed

### Authentication States
- **Unauthenticated** → Public pages only (landing, login, signup)
- **Authenticated** → Access to protected routes (dashboard, profile)
- **Session Expired** → Automatic token refresh or redirect to login

## 🧪 Development Guidelines

### Code Organization
- **Feature-based folders** - Group related components
- **Separation of concerns** - API, UI, and business logic separated
- **Reusable components** - DRY principle with shared UI elements
- **Type safety** - Strong TypeScript usage throughout

### Best Practices
- **Component composition** - Build complex UIs from simple components
- **Custom hooks** - Extract and reuse stateful logic
- **Error boundaries** - Graceful handling of component errors
- **Accessibility** - ARIA labels and keyboard navigation

### Performance Optimization
- **Code splitting** - Dynamic imports for route-based splitting
- **Asset optimization** - Image compression and lazy loading
- **Bundle analysis** - Monitor build size and dependencies

## 🚀 Deployment

### Build Process
```bash
# Create production build
npm run build

# Files generated in dist/ directory
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other-assets]
└── favicon.svg
```

### Deployment Options
- **Vercel** - Zero-config deployment with GitHub integration
- **Netlify** - Continuous deployment with form handling
- **AWS S3 + CloudFront** - Scalable static hosting
- **nginx** - Self-hosted with reverse proxy

### Production Considerations
- **Environment variables** - Configure API URL for production
- **HTTPS** - Required for secure cookie authentication
- **CORS** - Configure server to allow your domain
- **Error monitoring** - Set up error tracking (Sentry, etc.)

## 🐛 Troubleshooting

### Common Issues

1. **API connection failed**
   - Check VITE_API_URL in .env
   - Ensure backend server is running
   - Verify CORS configuration

2. **Authentication not working**
   - Check browser cookies are enabled
   - Verify JWT_SECRET matches between client and server
   - Check for expired tokens

3. **Build failures**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`
   - Verify all dependencies are installed

4. **Hot reload not working**
   - Check Vite port (5173) is available
   - Verify file watchers aren't at system limit
   - Try restarting development server

### Browser Developer Tools
- **Network tab** - Monitor API calls and responses
- **Application tab** - Inspect localStorage and cookies
- **Console** - Check for JavaScript errors
- **React DevTools** - Debug component state and props