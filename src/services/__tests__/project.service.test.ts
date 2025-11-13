import { ProjectService } from '../project.service';
import { FileSystemService } from '../fileSystem.service';
import { MermaidService } from '../mermaid.service';
import path from 'path';
import { promises as fs } from 'fs';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let fileSystemService: FileSystemService;
  let mermaidService: MermaidService;
  const testProjectsDir = path.join(process.cwd(), 'test-projects');

  beforeEach(async () => {
    fileSystemService = new FileSystemService();
    mermaidService = new MermaidService(fileSystemService, testProjectsDir);
    projectService = new ProjectService(
      fileSystemService,
      mermaidService,
      testProjectsDir
    );

    await fs.mkdir(testProjectsDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testProjectsDir, { recursive: true, force: true });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const projectName = 'test-project';
      const project = await projectService.createProject(projectName);

      expect(project.projectId).toBe(projectName);
      expect(project.name).toBe(projectName);
      expect(project.files).toEqual([]);

      const exists = await fileSystemService.exists(
        path.join(testProjectsDir, projectName)
      );
      expect(exists).toBe(true);
    });

    it('should throw error if project already exists', async () => {
      const projectName = 'duplicate-project';
      await projectService.createProject(projectName);

      await expect(projectService.createProject(projectName)).rejects.toThrow();
    });
  });

  describe('removeProject', () => {
    it('should remove an existing project', async () => {
      const projectName = 'remove-me';
      await projectService.createProject(projectName);
      await projectService.removeProject(projectName);

      const exists = await fileSystemService.exists(
        path.join(testProjectsDir, projectName)
      );
      expect(exists).toBe(false);
    });

    it('should throw error if project does not exist', async () => {
      await expect(
        projectService.removeProject('non-existent')
      ).rejects.toThrow();
    });
  });

  describe('getAllProjects', () => {
    it('should return all projects', async () => {
      await projectService.createProject('project1');
      await projectService.createProject('project2');

      const projects = await projectService.getAllProjects();

      expect(Object.keys(projects)).toContain('project1');
      expect(Object.keys(projects)).toContain('project2');
    });

    it('should include file information', async () => {
      const projectName = 'project-with-files';
      await projectService.createProject(projectName);

      // Add test files
      const projectPath = path.join(testProjectsDir, projectName);
      await fs.writeFile(path.join(projectPath, 'test.png'), 'fake-image');
      await fs.writeFile(
        path.join(projectPath, 'diagram.mmd'),
        'graph TD\nA-->B'
      );

      const projects = await projectService.getAllProjects();
      const project = projects[projectName];

      expect(project.files).toHaveLength(2);
      expect(project.files.some((f) => f.type === 'png')).toBe(true);
      expect(project.files.some((f) => f.type === 'mmd')).toBe(true);
    });
  });

  describe('loadProject', () => {
    it('should load project with JSON file', async () => {
      const projectName = 'json-project';
      await projectService.createProject(projectName);

      const projectData = {
        projectId: projectName,
        name: projectName,
        files: [],
        projectJson: {
          offset: { x: 0, y: 0 },
          nodes: {
            node1: {
              id: 'node1',
              type: 'node',
              displayType: 'screen',
              text: 'Test',
              name: 'TestNode',
              projectname: projectName,
              path: '',
              size: { width: 300, height: 288 },
              position: { x: 0, y: 0 },
              ports: {},
            },
          },
          links: {},
          selected: {},
          hovered: {},
        },
      };

      await projectService.saveProject(projectData);

      const loadedProject = await projectService.loadProject(projectName);
      expect(loadedProject.projectJson).toBeDefined();
      expect(loadedProject.projectJson?.nodes).toBeDefined();
      expect(Object.keys(loadedProject.projectJson?.nodes || {})).toContain(
        'node1'
      );
    });

    it('should create placeholder graph for image files', async () => {
      const projectName = 'image-project';
      await projectService.createProject(projectName);

      const projectPath = path.join(testProjectsDir, projectName);
      await fs.writeFile(path.join(projectPath, 'image1.png'), 'fake-image');
      await fs.writeFile(path.join(projectPath, 'image2.png'), 'fake-image');

      const project = await projectService.loadProject(projectName);

      expect(project.projectJson).toBeDefined();
      expect(Object.keys(project.projectJson?.nodes || {}).length).toBe(2);
    });
  });

  describe('saveProject', () => {
    it('should save project to JSON file', async () => {
      const projectName = 'save-test';
      await projectService.createProject(projectName);

      const projectData = {
        projectId: projectName,
        name: projectName,
        files: [],
        projectJson: {
          offset: { x: 0, y: 0 },
          nodes: {},
          links: {},
          selected: {},
          hovered: {},
        },
      };

      await projectService.saveProject(projectData);

      const jsonPath = path.join(
        testProjectsDir,
        projectName,
        `${projectName}.json`
      );
      const exists = await fileSystemService.exists(jsonPath);
      expect(exists).toBe(true);

      const content = await fileSystemService.readFile(jsonPath);
      const parsed = JSON.parse(content);
      expect(parsed.projectId).toBe(projectName);
    });
  });
});
