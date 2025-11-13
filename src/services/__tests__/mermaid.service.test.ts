import { MermaidService } from '../mermaid.service';
import { FileSystemService } from '../fileSystem.service';

describe('MermaidService', () => {
  let service: MermaidService;
  let fileSystemService: FileSystemService;

  beforeEach(() => {
    fileSystemService = new FileSystemService();
    service = new MermaidService(fileSystemService, 'public/projects');
  });

  describe('parseConnections', () => {
    it('should parse simple mermaid connections', async () => {
      const mermaidContent = `graph TD
A-->B
B-->C`;

      const connections = await service.parseConnections(mermaidContent);

      expect(connections).toHaveLength(2);
      expect(connections[0]).toEqual({
        from: 'A',
        to: 'B',
        connectionLabel: undefined,
      });
      expect(connections[1]).toEqual({
        from: 'B',
        to: 'C',
        connectionLabel: undefined,
      });
    });

    it('should parse connections with labels', async () => {
      const mermaidContent = `graph TD
A-->|label1|B
B-->|label2|C`;

      const connections = await service.parseConnections(mermaidContent);

      expect(connections).toHaveLength(2);
      expect(connections[0].connectionLabel).toBe('label1');
      expect(connections[1].connectionLabel).toBe('label2');
    });

    it('should handle different node shapes', async () => {
      const mermaidContent = `graph TD
A[Square]-->B
B(Round)-->C
C{Diamond}-->D
D((Circle))-->E`;

      const connections = await service.parseConnections(mermaidContent);

      expect(connections).toHaveLength(4);
      expect(connections[0].from).toBe('A');
      expect(connections[1].from).toBe('B');
      expect(connections[2].from).toBe('C');
      expect(connections[3].from).toBe('D');
    });
  });

  describe('getPorts', () => {
    it('should generate ports for nodes', () => {
      const connections = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
      ];

      const nodes = [
        {
          id: 'node1',
          name: 'A',
          type: 'node',
          displayType: 'screen',
          text: '',
          size: { width: 300, height: 288 },
          position: { x: 0, y: 0 },
          ports: {},
        },
        {
          id: 'node2',
          name: 'B',
          type: 'node',
          displayType: 'screen',
          text: '',
          size: { width: 300, height: 288 },
          position: { x: 0, y: 0 },
          ports: {},
        },
      ];

      const portsForA = service.getPorts(connections, nodes, 0);
      expect(Object.keys(portsForA).length).toBeGreaterThan(0);
      expect(portsForA['port1']?.type).toBe('output');

      const portsForB = service.getPorts(connections, nodes, 1);
      expect(Object.keys(portsForB).length).toBeGreaterThan(0);
    });
  });

  describe('makeLinks', () => {
    it('should create links from connections', () => {
      const connections = [{ from: 'A', to: 'B', connectionLabel: 'test' }];

      const nodes = [
        {
          id: 'node1',
          name: 'A',
          type: 'node',
          displayType: 'screen',
          text: '',
          size: { width: 300, height: 288 },
          position: { x: 0, y: 0 },
          ports: {
            port1: {
              id: 'port1',
              from: 'A',
              to: 'B',
              type: 'output' as const,
              connected: false,
              properties: {},
            },
          },
        },
        {
          id: 'node2',
          name: 'B',
          type: 'node',
          displayType: 'screen',
          text: '',
          size: { width: 300, height: 288 },
          position: { x: 0, y: 0 },
          ports: {
            port1: {
              id: 'port1',
              from: 'A',
              to: 'B',
              type: 'input' as const,
              connected: false,
              properties: {},
            },
          },
        },
      ];

      const links = service.makeLinks(connections, nodes);
      expect(Object.keys(links).length).toBeGreaterThan(0);

      const firstLink = Object.values(links)[0];
      expect(firstLink.from.nodeId).toBe('node1');
      expect(firstLink.to.nodeId).toBe('node2');
      expect(firstLink.properties?.label).toBe('test');
    });
  });
});
