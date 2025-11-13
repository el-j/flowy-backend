import request from 'supertest';
import { App } from '../../app';
import path from 'path';
import { promises as fs } from 'fs';

describe('Project API Routes', () => {
  let app: App;
  const testProjectsDir = 'public/projects';

  beforeAll(async () => {
    app = new App();
    await app.initialize();
  });

  afterAll(async () => {
    // Cleanup test projects
    const testProjects = ['test-api-project', 'test-remove-project'];
    for (const projectName of testProjects) {
      const projectPath = path.join(testProjectsDir, projectName);
      try {
        await fs.rm(projectPath, { recursive: true, force: true });
      } catch {
        // Ignore errors
      }
    }
  });

  describe('GET /api/getProjects', () => {
    it('should return all projects', async () => {
      const response = await request(app.app)
        .get('/api/getProjects')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe('object');
    });
  });

  describe('GET /api/createProject/:projectname', () => {
    it('should create a new project', async () => {
      const response = await request(app.app)
        .get('/api/createProject/:test-api-project')
        .expect(200);

      expect(response.body).toHaveProperty('projectname');
      expect(response.body.projectname).toBe('test-api-project');
    });

    it('should return 400 for invalid project name', async () => {
      await request(app.app).get('/api/createProject/:').expect(400);
    });
  });

  describe('GET /api/loadProject/:projectname', () => {
    beforeEach(async () => {
      // Create a test project
      await request(app.app)
        .get('/api/createProject/:test-load-project')
        .expect(200);
    });

    afterEach(async () => {
      const projectPath = path.join(testProjectsDir, 'test-load-project');
      await fs.rm(projectPath, { recursive: true, force: true });
    });

    it('should load an existing project', async () => {
      const response = await request(app.app)
        .get('/api/loadProject/:test-load-project')
        .expect(200);

      expect(response.body).toHaveProperty('projectId');
      expect(response.body.projectId).toBe('test-load-project');
      expect(response.body).toHaveProperty('projectJson');
    });

    it('should return 404 for non-existent project', async () => {
      await request(app.app)
        .get('/api/loadProject/:non-existent-project')
        .expect(404);
    });
  });

  describe('GET /api/removeProject/:projectname', () => {
    it('should remove an existing project', async () => {
      // First create a project
      await request(app.app)
        .get('/api/createProject/:test-remove-project')
        .expect(200);

      // Then remove it
      const response = await request(app.app)
        .get('/api/removeProject/:test-remove-project')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body['test-remove-project']).toBeUndefined();
    });
  });

  describe('POST /api/saveProject/:projectName', () => {
    beforeEach(async () => {
      await request(app.app)
        .get('/api/createProject/:test-save-project')
        .expect(200);
    });

    afterEach(async () => {
      const projectPath = path.join(testProjectsDir, 'test-save-project');
      await fs.rm(projectPath, { recursive: true, force: true });
    });

    it('should save project data', async () => {
      const projectData = {
        projectId: 'test-save-project',
        name: 'test-save-project',
        files: [],
        projectJson: {
          offset: { x: 0, y: 0 },
          nodes: {},
          links: {},
          selected: {},
          hovered: {},
        },
      };

      const response = await request(app.app)
        .post('/api/saveProject/test-save-project')
        .send(projectData)
        .expect(200);

      expect(response.body.projectId).toBe('test-save-project');
    });

    it('should return 400 for invalid data', async () => {
      await request(app.app)
        .post('/api/saveProject/test-save-project')
        .send({})
        .expect(400);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app.app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
