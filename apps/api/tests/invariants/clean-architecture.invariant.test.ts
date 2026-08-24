import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else if (file.endsWith('.ts')) {
      results.push(filePath);
    }
  }
  return results;
}

describe('Clean Architecture Invariant Test', () => {
  const domainDir = path.resolve(__dirname, '../../src/core/domain');
  const forbiddenFrameworkImports = [
    'express',
    'fastify',
    '@prisma/client',
    'prisma',
    'jsonwebtoken',
    'bullmq',
    'ioredis',
    'redis',
    'supertest'
  ];

  it('should have zero framework dependencies inside core/domain (Positive Proof)', () => {
    const domainFiles = getFilesRecursively(domainDir);
    expect(domainFiles.length).toBeGreaterThan(0);

    for (const filePath of domainFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const forbidden of forbiddenFrameworkImports) {
        const regex = new RegExp(`from\\s+['"]${forbidden}['"]`, 'i');
        const matches = regex.test(content);
        expect(
          matches,
          `Invariant Violation: File '${path.basename(filePath)}' in core/domain imports forbidden framework '${forbidden}'`
        ).toBe(false);
      }
    }
  });

  it('should detect violation if a forbidden import is introduced (Negative Proof)', () => {
    const dummyBadContent = `import express from 'express';\nexport class BadEntity {}`;
    const hasForbidden = forbiddenFrameworkImports.some(pkg =>
      new RegExp(`from\\s+['"]${pkg}['"]`, 'i').test(dummyBadContent)
    );
    expect(hasForbidden).toBe(true);
  });
});
