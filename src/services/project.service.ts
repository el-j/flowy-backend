import path from 'path';
import { FileSystemService } from './fileSystem.service.js';
import { MermaidService } from './mermaid.service.js';
import { logger } from '../utils/logger.js';
import { Project, ProjectFile, ProjectJson, Node } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class ProjectService {
  private projects: Map<string, Project> = new Map();

  constructor(
    private fileSystem: FileSystemService,
    private mermaidService: MermaidService,
    private projectsDir: string
  ) {}

  /**
   * Initialize projects on startup
   */
  async initialize(): Promise<void> {
    await this.getAllProjects();
    logger.info(
      `Projects initialized: ${Array.from(this.projects.keys()).join(', ')}`
    );
  }

  /**
   * Create a new project folder
   */
  async createProject(projectName: string): Promise<Project> {
    const projectPath = path.join(this.projectsDir, projectName);

    // Check if project already exists
    if (await this.fileSystem.exists(projectPath)) {
      throw new AppError(`Project "${projectName}" already exists`, 400);
    }

    await this.fileSystem.createDirectory(projectPath);

    const project: Project = {
      projectId: projectName,
      name: projectName,
      description: projectName,
      path: projectPath,
      dateCreate: new Date(),
      files: [],
    };

    this.projects.set(projectName, project);
    logger.info(`Created project: ${projectName}`);

    return project;
  }

  /**
   * Remove a project folder
   */
  async removeProject(projectName: string): Promise<void> {
    const projectPath = path.join(this.projectsDir, projectName);

    if (!(await this.fileSystem.exists(projectPath))) {
      throw new AppError(`Project "${projectName}" not found`, 404);
    }

    await this.fileSystem.removeDirectory(projectPath);
    this.projects.delete(projectName);
    logger.info(`Removed project: ${projectName}`);
  }

  /**
   * Get all projects
   */
  async getAllProjects(): Promise<Record<string, Project>> {
    this.projects.clear();

    const projectFolders = await this.fileSystem.readDirectory(
      this.projectsDir
    );

    for (const folderName of projectFolders) {
      const project: Project = {
        projectId: folderName,
        name: folderName,
        description: folderName,
        files: [],
      };

      const projectPath = path.join(this.projectsDir, folderName);
      const files = await this.fileSystem.readDirectory(projectPath);

      for (const file of files) {
        const filePath = path.join(projectPath, file);
        const stats = await this.fileSystem.getStats(filePath);

        if (stats.isFile()) {
          const extension = this.fileSystem.getFileExtension(file);
          const filename =
            this.fileSystem.getFilenameWithoutExtension(file);

          project.files.push({
            filename,
            type: extension,
          });
        }
      }

      this.projects.set(folderName, project);
    }

    return Object.fromEntries(this.projects);
  }

  /**
   * Get a specific project
   */
  getProject(projectName: string): Project | undefined {
    return this.projects.get(projectName);
  }

  /**
   * Load project with graph data
   */
  async loadProject(projectName: string): Promise<Project> {
    await this.getAllProjects(); // Refresh project list

    const project = this.projects.get(projectName);
    if (!project) {
      throw new AppError(`Project "${projectName}" not found`, 404);
    }

    const jsonFiles = project.files.filter((f) => f.type === 'json');
    const mmdFiles = project.files.filter((f) => f.type === 'mmd');
    const imageFiles = project.files.filter(
      (f) => f.type !== 'json' && f.type !== 'mmd'
    );

    // Load existing JSON
    if (jsonFiles.length > 0) {
      const jsonPath = path.join(
        this.projectsDir,
        projectName,
        `${projectName}.json`
      );
      const jsonContent = await this.fileSystem.readFile(jsonPath);
      const loadedProject = JSON.parse(jsonContent) as Project;
      project.projectJson = loadedProject.projectJson;
      logger.info(`Loaded JSON for project: ${projectName}`);
    }
    // Generate from Mermaid
    else if (mmdFiles.length > 0) {
      const mmdFile = mmdFiles[0];
      project.projectJson = await this.mermaidService.interpretMermaid(
        mmdFile.filename,
        projectName
      );
      logger.info(`Generated graph from Mermaid: ${projectName}`);
    }
    // Create placeholder nodes from images
    else if (imageFiles.length > 0) {
      project.projectJson = this.createPlaceholderGraph(
        imageFiles,
        projectName
      );
      logger.info(`Created placeholder graph: ${projectName}`);
    } else {
      // Empty project
      project.projectJson = {
        offset: { x: 0, y: 0 },
        nodes: {},
        links: {},
        selected: {},
        hovered: {},
      };
    }

    return project;
  }

  /**
   * Update project files
   */
  async updateProject(projectName: string): Promise<Project> {
    const project = await this.loadProject(projectName);

    const jsonFiles = project.files.filter((f) => f.type === 'json');
    const imageFiles = project.files.filter(
      (f) => f.type !== 'json' && f.type !== 'mmd'
    );

    if (jsonFiles.length > 0 && project.projectJson) {
      // Update node pictures based on available files
      for (const nodeId in project.projectJson.nodes) {
        const node = project.projectJson.nodes[nodeId];
        const nodeName = node.name.toLowerCase();

        for (const file of imageFiles) {
          const fileName = file.filename.split('-').join(' ').toLowerCase();
          if (nodeName.includes(fileName)) {
            node.picture = `${file.filename}.${file.type}`;
            node.path = `${projectName}/${file.filename}.${file.type}`;
            logger.info(
              `Updated node ${nodeId} with picture: ${node.picture}`
            );
          }
        }
      }

      // Save updated JSON
      await this.saveProject(project);
      logger.info(`Updated project: ${projectName}`);
    }

    return project;
  }

  /**
   * Save project JSON
   */
  async saveProject(project: Project): Promise<void> {
    const jsonPath = path.join(
      this.projectsDir,
      project.projectId,
      `${project.projectId}.json`
    );

    await this.fileSystem.writeFile(
      jsonPath,
      JSON.stringify(project, null, 2)
    );

    this.projects.set(project.projectId, project);
    logger.info(`Saved project: ${project.projectId}`);
  }

  /**
   * Create placeholder graph from image files
   */
  private createPlaceholderGraph(
    files: ProjectFile[],
    projectName: string
  ): ProjectJson {
    const graph: ProjectJson = {
      offset: { x: 0, y: 0 },
      nodes: {},
      links: {},
      selected: {},
      hovered: {},
    };

    let counter = 1;
    let factor = 1;

    files.forEach((file, index) => {
      if (counter >= 5) {
        counter = 1;
        factor++;
      }

      const nodeId = `node${index}`;
      const node: Node = {
        id: nodeId,
        type: 'node',
        displayType: 'screen',
        picture: `${file.filename}.${file.type}`,
        text: '',
        name: file.filename,
        projectname: projectName,
        path: `${projectName}/${file.filename}.${file.type}`,
        size: {
          width: 300,
          height: 288,
        },
        position: {
          x: 340 * counter,
          y: 300 * factor,
        },
        ports: {},
      };

      graph.nodes[nodeId] = node;
      counter++;
    });

    return graph;
  }
}
