#!/usr/bin/env node

/**
 * Simplified Agent CLI for Indie Developers
 * 
 * 5 questions max, opinionated defaults, fast setup
 */

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

class SimpleAgentCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async prompt(question, options = null, defaultIndex = 0) {
    return new Promise((resolve) => {
      let fullQuestion = question;
      if (options && options.length > 0) {
        fullQuestion += `\n${options.map((opt, idx) => `${idx + 1}) ${opt}`).join('\n')}`;
        fullQuestion += `\n(default: ${defaultIndex + 1})`;
      }
      fullQuestion += '\n> ';

      this.rl.question(fullQuestion, (answer) => {
        if (options && options.length > 0) {
          const index = parseInt(answer.trim()) - 1;
          if (!isNaN(index) && index >= 0 && index < options.length) {
            resolve(options[index]);
            return;
          }
          if (answer.trim() === '') {
            resolve(options[defaultIndex]);
            return;
          }
          console.log('Invalid selection. Please choose a number from the list.');
          resolve(this.prompt(question, options, defaultIndex));
          return;
        }
        resolve(answer.trim() || '');
      });
    });
  }

  async run() {
    console.log('\n📋 Quick Setup - 5 Questions\n');

    // Question 1: Project type (simplified)
    const projectType = await this.prompt(
      '1️⃣  What are you building?',
      [
        'Side Project / SaaS (web app)',
        'API / Backend Service',
        'Full-Stack App (frontend + backend)',
        'Static Website / Landing Page',
        'Other'
      ],
      0 // Default: Side Project
    );

    // Question 2: Primary language
    const language = await this.prompt(
      '\n2️⃣  Primary language?',
      [
        'JavaScript',
        'TypeScript',
        'Python',
        'Other'
      ],
      1 // Default: TypeScript
    );

    // Question 3: Framework (context-aware based on project type)
    let frameworkOptions = [];
    if (projectType.includes('Side Project') || projectType.includes('Full-Stack')) {
      frameworkOptions = ['Next.js', 'React', 'Vue', 'Svelte', 'Vanilla JS'];
    } else if (projectType.includes('API')) {
      frameworkOptions = ['Express', 'Fastify', 'NestJS', 'None'];
    } else if (projectType.includes('Static')) {
      frameworkOptions = ['Astro', 'Next.js (static)', 'Vanilla HTML/CSS', 'None'];
    } else {
      frameworkOptions = ['Next.js', 'Express', 'React', 'None'];
    }

    const framework = await this.prompt(
      '\n3️⃣  Framework?',
      frameworkOptions,
      0 // Default: first option
    );

    // Question 4: Features (simplified, auto-selected based on type)
    const features = [];
    if (projectType.includes('Side Project') || projectType.includes('Full-Stack')) {
      features.push('auth', 'database', 'api');
    } else if (projectType.includes('API')) {
      features.push('api', 'database');
    }

    const needsAuth = await this.prompt(
      '\n4️⃣  Need authentication?',
      ['Yes', 'No'],
      projectType.includes('Side Project') ? 0 : 1
    );
    if (needsAuth === 'Yes' && !features.includes('auth')) {
      features.push('auth');
    }

    // Question 5: Package manager (auto-detect)
    let packageManager = 'npm';
    try {
      const lockFiles = await fs.readdir(process.cwd());
      if (lockFiles.includes('pnpm-lock.yaml')) {
        packageManager = 'pnpm';
      } else if (lockFiles.includes('yarn.lock')) {
        packageManager = 'yarn';
      } else if (lockFiles.includes('package-lock.json')) {
        packageManager = 'npm';
      }
    } catch (err) {
      // Default to npm
    }

    const confirmedPM = await this.prompt(
      `\n5️⃣  Package manager? (detected: ${packageManager})`,
      ['npm', 'pnpm', 'yarn'],
      packageManager === 'npm' ? 0 : packageManager === 'pnpm' ? 1 : 2
    );

    // Generate manifest
    const manifest = {
      name: path.basename(process.cwd()),
      version: '1.0.0',
      productType: this.mapProductType(projectType),
      technologies: this.mapTechnologies(language, framework),
      features: features,
      packageManager: confirmedPM,
      deployment: {
        target: 'cloud-free-tier',
        platforms: this.suggestPlatforms(projectType, framework)
      },
      rationale: {
        productType: `Building a ${projectType.toLowerCase()}`,
        technologies: `Using ${language} with ${framework}`,
        features: features.length > 0 ? `Core features: ${features.join(', ')}` : 'Minimal feature set',
        deployment: 'Optimized for free-tier deployment (Vercel, Railway, Fly.io)'
      }
    };

    // Save manifest
    const manifestPath = path.join(process.cwd(), 'project.manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`\n✅ Created project.manifest.json`);
    console.log(`\n📊 Your Setup:`);
    console.log(`   Type: ${projectType}`);
    console.log(`   Language: ${language}`);
    console.log(`   Framework: ${framework}`);
    console.log(`   Features: ${features.length > 0 ? features.join(', ') : 'none'}`);
    console.log(`   Package Manager: ${confirmedPM}`);

    this.rl.close();
  }

  mapProductType(type) {
    if (type.includes('Side Project') || type.includes('SaaS')) return 'web-application';
    if (type.includes('API')) return 'api-service';
    if (type.includes('Full-Stack')) return 'full-stack-application';
    if (type.includes('Static')) return 'static-website';
    return 'other';
  }

  mapTechnologies(language, framework) {
    const tech = [];
    
    if (language === 'JavaScript') tech.push('javascript');
    if (language === 'TypeScript') tech.push('typescript', 'javascript');
    if (language === 'Python') tech.push('python');
    
    const frameworkLower = framework.toLowerCase();
    if (frameworkLower.includes('next')) tech.push('nextjs', 'react');
    else if (frameworkLower.includes('react')) tech.push('react');
    else if (frameworkLower.includes('vue')) tech.push('vue');
    else if (frameworkLower.includes('svelte')) tech.push('svelte');
    else if (frameworkLower.includes('express')) tech.push('express', 'nodejs');
    else if (frameworkLower.includes('fastify')) tech.push('fastify', 'nodejs');
    else if (frameworkLower.includes('nestjs')) tech.push('nestjs', 'nodejs');
    else if (frameworkLower.includes('astro')) tech.push('astro');
    
    if (tech.includes('express') || tech.includes('fastify') || tech.includes('nestjs') || tech.includes('nextjs')) {
      if (!tech.includes('nodejs')) tech.push('nodejs');
    }
    
    return tech;
  }

  suggestPlatforms(projectType, framework) {
    if (framework.includes('Next.js') || projectType.includes('Full-Stack')) {
      return ['vercel', 'netlify'];
    }
    if (projectType.includes('API')) {
      return ['railway', 'fly.io'];
    }
    if (projectType.includes('Static')) {
      return ['vercel', 'netlify', 'github-pages'];
    }
    return ['vercel', 'railway'];
  }
}

// CLI entry point
if (require.main === module) {
  const cli = new SimpleAgentCLI();
  cli.run().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = SimpleAgentCLI;

