import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { FileSystemService } from './services/fileSystem.service.js';
import { MermaidService } from './services/mermaid.service.js';
import { ProjectService } from './services/project.service.js';
import { ProjectRoutes } from './routes/project.routes.js';

export class App {
  public app: Express;
  private fileSystemService: FileSystemService;
  private mermaidService: MermaidService;
  private projectService: ProjectService;

  constructor() {
    this.app = express();
    this.fileSystemService = new FileSystemService();
    this.mermaidService = new MermaidService(
      this.fileSystemService,
      config.projectsDir
    );
    this.projectService = new ProjectService(
      this.fileSystemService,
      this.mermaidService,
      config.projectsDir
    );

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware() {
    // Body parsing
    this.app.use(express.json({ limit: '25mb' }));
    this.app.use(
      express.urlencoded({
        extended: true,
        limit: '25mb',
      })
    );

    // CORS
    this.app.use(cors());

    // Static files
    this.app.use(express.static(config.publicDir));

    // Request logging
    this.app.use((req, _res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes() {
    const projectRoutes = new ProjectRoutes(
      this.projectService,
      config.projectsDir
    );
    this.app.use('/api', projectRoutes.router);

    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  private setupErrorHandling() {
    this.app.use(errorHandler);
  }

  async initialize() {
    try {
      // Ensure directories exist
      await this.fileSystemService.createDirectory(config.publicDir);
      await this.fileSystemService.createDirectory(config.projectsDir);
      await this.fileSystemService.createDirectory('logs');

      // Initialize projects
      await this.projectService.initialize();

      logger.info('Application initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize application', error);
      throw error;
    }
  }

  async start() {
    await this.initialize();

    this.app.listen(config.server.port, () => {
      logger.info(
        `🚀 Flowy Backend listening on http://${config.server.name}:${config.server.port}`
      );
      logger.info(`📁 Projects directory: ${config.projectsDir}`);
      logger.info(`🌐 Frontend expected at http://${config.app.name}:${config.app.port}`);
    });
  }
}
