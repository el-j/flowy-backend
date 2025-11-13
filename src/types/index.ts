export interface ProjectFile {
  filename: string;
  type: string;
}

export interface ProjectJson {
  offset: {
    x: number;
    y: number;
  };
  nodes: Record<string, Node>;
  links: Record<string, Link>;
  selected: Record<string, unknown>;
  hovered: Record<string, unknown>;
}

export interface Node {
  id: string;
  type: string;
  displayType: string;
  picture?: string;
  text: string;
  name: string;
  projectname: string;
  path: string;
  size: {
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
  };
  ports: Record<string, Port>;
}

export interface Port {
  from: string;
  to: string;
  id: string;
  type: 'input' | 'output' | 'nothing';
  connected: boolean;
  properties: {
    value?: string;
  };
}

export interface Link {
  id: string;
  from: {
    nodeId: string;
    portId: string;
  };
  to: {
    nodeId: string;
    portId: string;
  };
  properties?: {
    label?: string;
  };
}

export interface Project {
  projectId: string;
  name: string;
  description?: string;
  path?: string;
  dateCreate?: Date;
  files: ProjectFile[];
  projectJson?: ProjectJson;
  previewImg?: string;
  info?: string;
}

export interface Connection {
  from: string;
  to: string;
  id?: string;
  connectionLabel?: string;
}

export interface HtmlGraphNode {
  id: string;
  name: string;
  type: string;
  displayType: string;
  text: string;
  size: {
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
  };
  ports: Record<string, Port>;
}
