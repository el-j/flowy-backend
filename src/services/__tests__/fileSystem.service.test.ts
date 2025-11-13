import { FileSystemService } from '../fileSystem.service';
import path from 'path';
import { promises as fs } from 'fs';

describe('FileSystemService', () => {
  let service: FileSystemService;
  const testDir = path.join(process.cwd(), 'test-temp');
  const testFile = path.join(testDir, 'test.txt');

  beforeEach(async () => {
    service = new FileSystemService();
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('createDirectory', () => {
    it('should create a directory', async () => {
      const newDir = path.join(testDir, 'newdir');
      await service.createDirectory(newDir);
      const exists = await service.exists(newDir);
      expect(exists).toBe(true);
    });

    it('should create nested directories', async () => {
      const nestedDir = path.join(testDir, 'a', 'b', 'c');
      await service.createDirectory(nestedDir);
      const exists = await service.exists(nestedDir);
      expect(exists).toBe(true);
    });
  });

  describe('readDirectory', () => {
    it('should read directory contents', async () => {
      await fs.writeFile(path.join(testDir, 'file1.txt'), 'content');
      await fs.writeFile(path.join(testDir, 'file2.txt'), 'content');

      const files = await service.readDirectory(testDir);
      expect(files).toContain('file1.txt');
      expect(files).toContain('file2.txt');
    });

    it('should filter out .DS_Store files', async () => {
      await fs.writeFile(path.join(testDir, '.DS_Store'), 'content');
      await fs.writeFile(path.join(testDir, 'file1.txt'), 'content');

      const files = await service.readDirectory(testDir);
      expect(files).not.toContain('.DS_Store');
      expect(files).toContain('file1.txt');
    });
  });

  describe('writeFile and readFile', () => {
    it('should write and read file content', async () => {
      const content = 'Hello, World!';
      await service.writeFile(testFile, content);
      const readContent = await service.readFile(testFile);
      expect(readContent).toBe(content);
    });

    it('should throw error when reading non-existent file', async () => {
      await expect(
        service.readFile(path.join(testDir, 'nonexistent.txt'))
      ).rejects.toThrow();
    });
  });

  describe('removeDirectory', () => {
    it('should remove a directory', async () => {
      const dirToRemove = path.join(testDir, 'remove-me');
      await service.createDirectory(dirToRemove);
      await service.removeDirectory(dirToRemove);
      const exists = await service.exists(dirToRemove);
      expect(exists).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true for existing path', async () => {
      await fs.writeFile(testFile, 'content');
      const exists = await service.exists(testFile);
      expect(exists).toBe(true);
    });

    it('should return false for non-existing path', async () => {
      const exists = await service.exists(path.join(testDir, 'nonexistent'));
      expect(exists).toBe(false);
    });
  });

  describe('getFileExtension', () => {
    it('should return file extension', () => {
      expect(service.getFileExtension('test.txt')).toBe('txt');
      expect(service.getFileExtension('image.png')).toBe('png');
      expect(service.getFileExtension('file.tar.gz')).toBe('gz');
    });
  });

  describe('getFilenameWithoutExtension', () => {
    it('should return filename without extension', () => {
      expect(service.getFilenameWithoutExtension('test.txt')).toBe('test');
      expect(service.getFilenameWithoutExtension('image.png')).toBe('image');
      expect(service.getFilenameWithoutExtension('/path/to/file.js')).toBe(
        'file'
      );
    });
  });
});
