import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { logger } from '../utils/logger.js';
import { FileSystemService } from './fileSystem.service.js';
import {
  Connection,
  HtmlGraphNode,
  Link,
  Port,
  ProjectJson,
  Node as ProjectNode,
} from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

const execAsync = promisify(exec);

export class MermaidService {
  constructor(
    private fileSystem: FileSystemService,
    private projectsDir: string
  ) {}

  /**
   * Generate SVG from Mermaid file
   */
  async generateSvg(
    mermaidFilename: string,
    projectName: string
  ): Promise<void> {
    const inputPath = path.join(
      this.projectsDir,
      projectName,
      `${mermaidFilename}.mmd`
    );
    const outputPath = path.join(
      this.projectsDir,
      projectName,
      `${mermaidFilename}.svg`
    );

    try {
      await execAsync(`npx mmdc -i ${inputPath} -o ${outputPath}`);
      logger.info(`Generated SVG for ${mermaidFilename}`);
    } catch (error) {
      logger.error(`Failed to generate SVG: ${error}`);
      throw new AppError('Failed to generate SVG from Mermaid file', 500);
    }
  }

  /**
   * Parse Mermaid content to extract connections
   */
  async parseConnections(mermaidContent: string): Promise<Connection[]> {
    const lines = mermaidContent.split(/\r?\n/g);
    const connections: Connection[] = [];

    lines.forEach((line, index) => {
      if (index === 0) return; // Skip first line (graph definition)

      const parts = line.split('-->');
      if (parts.length < 2) return;

      const from = this.cleanNodeName(parts[0]);
      let to = parts[1].trim();
      let connectionLabel: string | undefined;

      // Extract label if present
      if (to.includes('|')) {
        const labelParts = to.split('|');
        connectionLabel = labelParts[1];
        to = labelParts[2] || labelParts[0];
      }

      to = this.cleanNodeName(to);

      if (from && to) {
        connections.push({
          from,
          to,
          connectionLabel,
        });
      }
    });

    return connections;
  }

  /**
   * Clean node name by removing special characters
   */
  private cleanNodeName(name: string): string {
    let cleaned = name.replace(/\s/g, '');

    // Remove various bracket types
    const patterns = ['{', '((', '(', '['];
    for (const pattern of patterns) {
      if (cleaned.includes(pattern)) {
        cleaned = cleaned.split(pattern)[0];
      }
    }

    return cleaned;
  }

  /**
   * Generate ports for a node based on connections
   */
  getPorts(
    connections: Connection[],
    nodes: HtmlGraphNode[],
    nodeIndex: number
  ): Record<string, Port> {
    const ports: Record<string, Port> = {};
    let portCounter = 1;
    const currentNode = nodes[nodeIndex];

    connections.forEach((connection) => {
      const isSource = nodes.some(
        (node) => node.name === connection.from && node.id === currentNode.id
      );
      const isTarget = nodes.some(
        (node) => node.name === connection.to && node.id === currentNode.id
      );

      if (isSource) {
        const portId = `port${portCounter}`;
        ports[portId] = {
          from: connection.from,
          to: connection.to,
          id: portId,
          type: 'output',
          connected: false,
          properties: { value: connection.connectionLabel },
        };
        portCounter++;
      }

      if (isTarget) {
        const portId = `port${portCounter}`;
        ports[portId] = {
          from: connection.from,
          to: connection.to,
          id: portId,
          type: 'input',
          connected: false,
          properties: { value: connection.connectionLabel },
        };
        portCounter++;
      }
    });

    return ports;
  }

  /**
   * Generate links from connections
   */
  makeLinks(
    connections: Connection[],
    nodes: HtmlGraphNode[]
  ): Record<string, Link> {
    const links: Record<string, Link> = {};
    let linkCounter = 1;

    connections.forEach((connection) => {
      const fromNode = nodes.find((node) => node.name === connection.from);
      const toNode = nodes.find((node) => node.name === connection.to);

      if (fromNode && toNode) {
        const fromPort = Object.values(fromNode.ports).find(
          (port) => port.type === 'output' && port.to === connection.to
        );
        const toPort = Object.values(toNode.ports).find(
          (port) => port.type === 'input' && port.from === connection.from
        );

        if (fromPort && toPort) {
          const linkId = `link${linkCounter}`;
          links[linkId] = {
            id: linkId,
            from: {
              nodeId: fromNode.id,
              portId: fromPort.id,
            },
            to: {
              nodeId: toNode.id,
              portId: toPort.id,
            },
            properties: {
              label: connection.connectionLabel,
            },
          };
          linkCounter++;
        }
      }
    });

    return links;
  }

  /**
   * Parse SVG and create graph structure
   */
  async createGraphFromSvg(
    svgContent: string,
    _projectName: string
  ): Promise<HtmlGraphNode[]> {
    // This is a simplified version - the original used jsdom to parse SVG
    // For now, we'll create a basic structure
    // In production, you'd want to properly parse the SVG
    const nodes: HtmlGraphNode[] = [];

    // Extract node information from SVG
    // This is a placeholder - real implementation would parse SVG properly
    const nodeMatches = svgContent.matchAll(/id="([^"]+)"/g);
    let counter = 1;

    for (const match of nodeMatches) {
      const nodeId = match[1];
      if (nodeId && !nodeId.includes('arrow') && !nodeId.includes('label')) {
        nodes.push({
          id: `node${counter}`,
          name: nodeId,
          type: 'node',
          displayType: 'screen',
          text: '',
          size: { width: 300, height: 288 },
          position: { x: 340 * counter, y: 300 },
          ports: {},
        } as HtmlGraphNode);
        counter++;
      }
    }

    return nodes;
  }

  /**
   * Interpret Mermaid file and create React Graph structure
   */
  async interpretMermaid(
    mermaidFilename: string,
    projectName: string
  ): Promise<ProjectJson> {
    // Generate SVG
    await this.generateSvg(mermaidFilename, projectName);

    // Read Mermaid content
    const mmdPath = path.join(
      this.projectsDir,
      projectName,
      `${mermaidFilename}.mmd`
    );
    const mermaidContent = await this.fileSystem.readFile(mmdPath);

    // Read SVG content
    const svgPath = path.join(
      this.projectsDir,
      projectName,
      `${mermaidFilename}.svg`
    );
    const svgContent = await this.fileSystem.readFile(svgPath);

    // Parse connections
    const connections = await this.parseConnections(mermaidContent);

    // Create graph nodes from SVG
    const htmlGraph = await this.createGraphFromSvg(svgContent, projectName);

    // Add ports to nodes
    htmlGraph.forEach((node, index) => {
      node.ports = this.getPorts(connections, htmlGraph, index);
    });

    // Create React Graph structure
    const reactGraph: ProjectJson = {
      offset: { x: 0, y: 0 },
      nodes: {},
      links: this.makeLinks(connections, htmlGraph),
      selected: {},
      hovered: {},
    };

    // Convert array to object with node IDs as keys
    htmlGraph.forEach((node) => {
      reactGraph.nodes[node.id] = node as unknown as ProjectNode;
    });

    return reactGraph;
  }
}
