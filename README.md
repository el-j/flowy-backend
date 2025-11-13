# Flowy Backend - Modern TypeScript Implementation

A modern, fully-typed TypeScript backend server for the Flowy project management system. This is a complete rewrite of the legacy JavaScript codebase with improved architecture, comprehensive testing, and up-to-date dependencies.

## 🚀 Features

- **Modern TypeScript**: Full type safety with strict mode enabled
- **Express.js**: Latest Express v4 with async/await patterns
- **Project Management**: Create, read, update, and delete projects
- **File Upload**: Support for uploading images and Mermaid diagrams
- **Mermaid Integration**: Convert Mermaid diagrams to SVG and graph structures
- **Comprehensive Testing**: Unit and integration tests with Jest
- **Error Handling**: Centralized error handling with proper logging
- **Logging**: Winston-based structured logging
- **Code Quality**: ESLint and Prettier for consistent code style
- **Security**: Updated dependencies with vulnerability scanning

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## 🔧 Installation

```bash
# Install dependencies
npm install
```

## 🏃 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
# Build the project
npm run build

# Start the server
npm start
```

The server will start on `http://localhost:9023` by default.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🛠️ Development

### Code Quality

```bash
# Run TypeScript type checking
npm run typecheck

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## 📁 Project Structure

```
flowy-backend/
├── src/
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic services
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express app setup
│   └── index.ts          # Application entry point
├── dist/                 # Compiled JavaScript (generated)
├── public/               # Static files and projects
│   └── projects/         # Project data storage
├── logs/                 # Application logs
└── tests/                # Test files

```

## 🔌 API Endpoints

### Projects

- `GET /api/getProjects` - Get all projects
- `GET /api/createProject/:projectname` - Create a new project
- `GET /api/removeProject/:projectname` - Remove a project
- `GET /api/loadProject/:projectname` - Load project details
- `GET /api/updateProject/:projectname` - Update project files
- `POST /api/saveProject/:projectName` - Save project data
- `POST /api/uploadProjectData/:projectName` - Upload project files

### Health Check

- `GET /health` - Server health status

## ⚙️ Configuration

Configuration is managed through environment variables or the `src/config/index.ts` file:

```typescript
SERVER_PORT=9023        # Backend server port
SERVER_NAME=localhost   # Backend server hostname
APP_PORT=3000          # Frontend app port
APP_NAME=localhost     # Frontend app hostname
LOG_LEVEL=info         # Logging level (error, warn, info, debug)
```

## 📦 Dependencies

### Runtime
- **express**: Web framework
- **cors**: CORS middleware
- **multer**: File upload handling
- **winston**: Logging
- **zod**: Schema validation
- **uuid**: Unique ID generation

### Development
- **typescript**: TypeScript compiler
- **jest**: Testing framework
- **supertest**: API testing
- **eslint**: Code linting
- **prettier**: Code formatting
- **tsx**: TypeScript execution

## 🔒 Security

- Dependencies are regularly updated
- Security vulnerabilities are monitored
- Proper error handling prevents information leakage
- Input validation on all endpoints
- File upload restrictions

## 🚧 Migration from Legacy Code

This version replaces the old JavaScript implementation with:

1. **TypeScript**: Full type safety and better IDE support
2. **Modern syntax**: ES modules, async/await, no callbacks
3. **Better architecture**: Separation of concerns with services
4. **Testing**: Comprehensive test coverage
5. **Updated packages**: All dependencies updated to latest stable versions
6. **Improved error handling**: Centralized error handling middleware
7. **Logging**: Structured logging with Winston
8. **Code quality tools**: ESLint, Prettier, TypeScript strict mode

## 📝 Development Notes

### Original Features Preserved
- ✅ Project folder management
- ✅ File upload functionality
- ✅ Mermaid diagram processing
- ✅ Static file serving
- ✅ JSON project storage
- ✅ Placeholder node generation

### New Features
- ✅ TypeScript type safety
- ✅ Comprehensive test suite
- ✅ Modern async/await patterns
- ✅ Structured logging
- ✅ Health check endpoint
- ✅ Proper error handling
- ✅ Code quality tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## 📄 License

MIT

## 🔗 Related Projects

- [flowy-frontend](https://github.com/el-j/flowy-frontend) - Frontend application
- Sketch plugin - Design tool integration

## 📞 Support

For issues and questions, please open an issue on GitHub.
