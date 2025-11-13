import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { ProjectService } from '../services/project.service.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class ProjectRoutes {
  public router: Router;
  private upload!: multer.Multer;

  constructor(
    private projectService: ProjectService,
    private projectsDir: string
  ) {
    this.router = Router();
    this.setupMulter();
    this.setupRoutes();
  }

  private setupMulter() {
    const storage = multer.diskStorage({
      destination: (req, _file, cb) => {
        const projectName = req.params.projectName?.slice(1);
        if (!projectName) {
          return cb(new Error('Project name is required'), '');
        }
        const destPath = path.join(this.projectsDir, projectName);
        cb(null, destPath);
      },
      filename: (_req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, fileName);
      },
    });

    this.upload = multer({ storage });
  }

  private setupRoutes() {
    // Get all projects
    this.router.get(
      '/getProjects',
      asyncHandler(async (_req: Request, res: Response) => {
        const projects = await this.projectService.getAllProjects();
        logger.info(`Retrieved ${Object.keys(projects).length} projects`);
        res.json(projects);
      })
    );

    // Create new project
    this.router.get(
      '/createProject/:projectname',
      asyncHandler(async (req: Request, res: Response) => {
        const projectName = req.params.projectname?.slice(1);
        if (!projectName) {
          throw new AppError('Project name is required', 400);
        }

        const project = await this.projectService.createProject(projectName);
        logger.info(`Created project: ${projectName}`);
        res.json({
          made: project.path,
          projectname: project.name,
        });
      })
    );

    // Remove project
    this.router.get(
      '/removeProject/:projectname',
      asyncHandler(async (req: Request, res: Response) => {
        const projectName = req.params.projectname?.slice(1);
        if (!projectName) {
          throw new AppError('Project name is required', 400);
        }

        await this.projectService.removeProject(projectName);
        const projects = await this.projectService.getAllProjects();
        logger.info(`Removed project: ${projectName}`);
        res.json(projects);
      })
    );

    // Load project
    this.router.get(
      '/loadProject/:projectname',
      asyncHandler(async (req: Request, res: Response) => {
        const projectName = req.params.projectname?.slice(1);
        if (!projectName) {
          throw new AppError('Project name is required', 400);
        }

        const project = await this.projectService.loadProject(projectName);
        logger.info(`Loaded project: ${projectName}`);
        res.json(project);
      })
    );

    // Update project
    this.router.get(
      '/updateProject/:projectname',
      asyncHandler(async (req: Request, res: Response) => {
        const projectName = req.params.projectname?.slice(1);
        if (!projectName) {
          throw new AppError('Project name is required', 400);
        }

        const project = await this.projectService.updateProject(projectName);
        logger.info(`Updated project: ${projectName}`);
        res.json(project);
      })
    );

    // Save project
    this.router.post(
      '/saveProject/:projectName',
      asyncHandler(async (req: Request, res: Response) => {
        const projectData = req.body;
        if (!projectData || !projectData.projectId) {
          throw new AppError('Invalid project data', 400);
        }

        await this.projectService.saveProject(projectData);
        logger.info(`Saved project: ${projectData.projectId}`);
        res.json(projectData);
      })
    );

    // Upload project files
    this.router.post(
      '/uploadProjectData/:projectName',
      this.upload.any(),
      asyncHandler(async (req: Request, res: Response) => {
        const projectName = req.body.projectName;
        if (!projectName) {
          throw new AppError('Project name is required', 400);
        }

        const project = this.projectService.getProject(projectName);
        if (!project) {
          throw new AppError(`Project "${projectName}" not found`, 404);
        }

        // Update project files
        if (req.files && Array.isArray(req.files)) {
          project.files = req.files.map((file) => ({
            filename: path.parse(file.filename).name,
            type: path.parse(file.filename).ext.slice(1),
          }));
        }

        const allProjects = await this.projectService.getAllProjects();
        logger.info(`Uploaded files for project: ${projectName}`);
        res.json(allProjects);
      })
    );
  }
}
