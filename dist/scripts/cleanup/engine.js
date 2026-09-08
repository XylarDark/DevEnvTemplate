#!/usr/bin/env node
"use strict";
/**
 * Template Cleanup Engine
 *
 * Stack-agnostic engine for removing template-only code after scaffolding.
 * Processes declarative rules from YAML config to clean files, blocks, lines, and dependencies.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupEngine = void 0;
exports.executeCleanup = executeCleanup;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
const yaml_1 = __importDefault(require("yaml"));
const os_1 = __importDefault(require("os"));
const path_resolver_1 = require("../utils/path-resolver");
const package_managers_1 = require("./package-managers");
const performance_1 = require("../types/performance");
const cache_1 = require("../utils/cache");
const parallel_1 = require("../utils/parallel");
const progress_1 = require("../utils/progress");
// Default file extensions for code files (used by block/line marker rules)
const CODE_EXTENSIONS = [
    '**/*.js',
    '**/*.ts',
    '**/*.jsx',
    '**/*.tsx',
    '**/*.py',
    '**/*.rb',
    '**/*.go',
    '**/*.rs',
    '**/*.java',
    '**/*.cs',
    '**/*.cpp',
    '**/*.c',
    '**/*.h',
    '**/*.php',
    '**/*.scala',
    '**/*.kt',
    '**/*.swift',
    '**/*.dart',
    '**/*.sh',
    '**/*.bash',
    '**/*.zsh',
    '**/*.ps1',
    '**/*.sql',
    '**/*.html',
    '**/*.xml',
];
/**
 * Main cleanup engine class
 */
class CleanupEngine {
    config = null;
    profile;
    features;
    configPath;
    workingDir;
    dryRun;
    failOnActions;
    onlyRules;
    excludeRules;
    excludeGlobs;
    keepFiles;
    excludeGlobCache;
    report;
    performanceEnabled;
    performanceTracker;
    cacheEnabled;
    fileCache;
    configCache;
    parallelEnabled;
    concurrency;
    progressEnabled;
    progressTracker;
    constructor(options = {}) {
        this.profile = options.profile || 'common';
        this.features = new Set(options.features || []);
        this.configPath = options.configPath || 'cleanup.config.yaml';
        this.workingDir = options.workingDir || process.cwd();
        this.dryRun = options.dryRun !== false; // default true for safety
        this.failOnActions = options.failOnActions || false;
        // Rule filtering options
        this.onlyRules = options.onlyRules ? new Set(options.onlyRules) : null;
        this.excludeRules = options.excludeRules ? new Set(options.excludeRules) : null;
        this.excludeGlobs = options.excludeGlobs || [];
        this.keepFiles = options.keepFiles
            ? new Set(options.keepFiles.map(f => path_1.default.resolve(this.workingDir, f)))
            : null;
        // Performance tracking
        this.performanceEnabled = options.performance || false;
        this.performanceTracker = this.performanceEnabled ? new performance_1.PerformanceTracker() : null;
        // Caching
        this.cacheEnabled = options.cache !== false; // enabled by default
        this.fileCache = this.cacheEnabled ? new cache_1.FileCache() : null;
        this.configCache = this.cacheEnabled ? new cache_1.ConfigCache() : null;
        // Parallel processing
        this.parallelEnabled = options.parallel || false;
        const cpuCount = os_1.default.cpus().length;
        this.concurrency = options.concurrency || cpuCount;
        // Progress tracking
        this.progressEnabled = options.progress || false;
        this.progressTracker = this.progressEnabled
            ? new progress_1.ProgressTracker(options.progressVerbosity || 'simple', options.jsonProgress || false)
            : null;
        // Performance optimizations
        this.excludeGlobCache = new Map();
        this.report = {
            timestamp: new Date().toISOString(),
            profile: this.profile,
            features: Array.from(this.features),
            dryRun: this.dryRun,
            actions: [],
            errors: [],
            summary: {
                totalActions: 0,
                filesDeleted: 0,
                linesRemoved: 0,
                blocksRemoved: 0,
                dependenciesRemoved: 0,
            },
        };
    }
    /**
     * Load and validate configuration
     */
    async loadConfig() {
        try {
            const configPath = (0, path_resolver_1.resolveConfigPath)(this.configPath, this.workingDir);
            // Load file content
            const configContent = await fs_1.promises.readFile(configPath, 'utf8');
            // Try to get from cache first
            let parsedConfig;
            if (this.configCache && this.fileCache) {
                const contentHash = this.fileCache.generateHash(configContent);
                const cached = this.configCache.get(configPath, contentHash);
                if (cached) {
                    parsedConfig = cached;
                }
                else {
                    // Parse and cache the config
                    parsedConfig = yaml_1.default.parse(configContent);
                    this.configCache.set(configPath, parsedConfig, contentHash);
                }
            }
            else {
                // No caching, just parse
                parsedConfig = yaml_1.default.parse(configContent);
            }
            if (this.performanceTracker) {
                this.performanceTracker.trackFileScanned();
            }
            // Validate config structure
            if (!parsedConfig.profiles || !parsedConfig.profiles[this.profile]) {
                throw new Error(`Profile '${this.profile}' not found in config`);
            }
            // Set defaults
            parsedConfig.comment_syntax = parsedConfig.comment_syntax || {};
            parsedConfig.markers = parsedConfig.markers || {};
            // Merge default features
            if (parsedConfig.features) {
                parsedConfig.features.forEach(f => this.features.add(f));
            }
            // Store the validated config
            this.config = parsedConfig;
            return this.config;
        }
        catch (error) {
            throw new Error(`Failed to load config from ${this.configPath}: ${error.message}`, {
                cause: error,
            });
        }
    }
    /**
     * Get resolved rules for current profile, handling extends and conditionals
     */
    getRules() {
        if (!this.config) {
            throw new Error('Config not loaded. Call loadConfig() first.');
        }
        const rules = [];
        // Handle extends (recursive)
        const collectRules = (profileName) => {
            const prof = this.config.profiles[profileName];
            if (!prof)
                return;
            if (prof.extends) {
                collectRules(prof.extends);
            }
            if (prof.rules) {
                rules.push(...prof.rules);
            }
        };
        collectRules(this.profile);
        // Add conditional rules - they are evaluated based on their individual conditions
        if (this.config.conditional_rules) {
            for (const conditionalRules of Object.values(this.config.conditional_rules)) {
                rules.push(...conditionalRules);
            }
        }
        return rules;
    }
    /**
     * Execute all rules
     */
    async execute() {
        // Start performance tracking
        if (this.performanceTracker) {
            this.performanceTracker.start();
            this.performanceTracker.setParallelMode(this.parallelEnabled, this.concurrency);
        }
        const rules = this.getRules();
        // Create overall progress bar
        if (this.progressTracker) {
            this.progressTracker.createBar('overall', {
                total: rules.length,
                label: 'Cleanup Progress',
            });
        }
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            try {
                await this.executeRule(rule);
                // Update overall progress
                if (this.progressTracker) {
                    this.progressTracker.updateBar('overall', i + 1);
                }
            }
            catch (error) {
                this.report.errors.push({
                    rule: rule.id,
                    error: error.message,
                    stack: error.stack,
                });
                // Track error in performance metrics
                if (this.performanceTracker) {
                    this.performanceTracker.trackRuleExecution(rule.id, 0, 0, true);
                }
            }
        }
        // Calculate summary
        this.calculateSummary();
        // Finish overall progress bar
        if (this.progressTracker) {
            this.progressTracker.finishBar('overall');
        }
        // End performance tracking and print report
        if (this.performanceTracker) {
            this.performanceTracker.end();
            this.performanceTracker.printReport();
        }
        return this.report;
    }
    /**
     * Check if a rule should be executed based on only/exclude filters
     */
    shouldExecuteRule(rule) {
        // If onlyRules is specified, only include rules in that set
        if (this.onlyRules && !this.onlyRules.has(rule.id)) {
            return false;
        }
        // If excludeRules is specified, exclude rules in that set
        if (this.excludeRules && this.excludeRules.has(rule.id)) {
            return false;
        }
        return true;
    }
    /**
     * Check if a file should be processed (not excluded by globs or keep list)
     */
    shouldProcessFile(filePath) {
        const absolutePath = path_1.default.resolve(this.workingDir, filePath);
        // Normalize path for cross-platform compatibility (Windows case-insensitive)
        const normalizedPath = this.normalizePath(absolutePath);
        // Check keep files (normalized absolute paths)
        if (this.keepFiles) {
            for (const keepPath of this.keepFiles) {
                if (normalizedPath === this.normalizePath(keepPath)) {
                    return false;
                }
            }
        }
        // Check exclude globs (with caching for performance)
        for (const pattern of this.excludeGlobs) {
            let matches = this.excludeGlobCache.get(pattern);
            if (!matches) {
                matches = glob_1.glob.sync(pattern, {
                    cwd: this.workingDir,
                    absolute: true,
                });
                this.excludeGlobCache.set(pattern, matches);
            }
            if (matches.some(match => normalizedPath.startsWith(this.normalizePath(match)))) {
                return false;
            }
        }
        return true;
    }
    /**
     * Normalize path for cross-platform compatibility
     */
    normalizePath(filePath) {
        // Convert to forward slashes and normalize case on Windows
        let normalized = path_1.default.normalize(filePath).replace(/\\/g, '/');
        if (process.platform === 'win32') {
            normalized = normalized.toLowerCase();
        }
        return normalized;
    }
    /**
     * Execute a single rule
     */
    async executeRule(rule) {
        // Check rule filtering
        if (!this.shouldExecuteRule(rule)) {
            return;
        }
        const ruleType = rule.type;
        const handler = this.getRuleHandler(ruleType);
        if (!handler) {
            throw new Error(`Unknown rule type: ${ruleType}`);
        }
        // Time rule execution
        const startTime = this.performanceTracker ? Date.now() : 0;
        const actions = await handler(rule);
        if (actions && actions.length > 0) {
            this.report.actions.push(...actions);
        }
        // Track rule execution time
        if (this.performanceTracker) {
            const duration = Date.now() - startTime;
            this.performanceTracker.trackRuleExecution(rule.id, duration, actions?.length || 0, false);
        }
    }
    /**
     * Get handler function for rule type
     */
    getRuleHandler(type) {
        const handlers = {
            file_glob_delete: this.handleFileGlobDelete.bind(this),
            block_markers: this.handleBlockMarkers.bind(this),
            line_tag: this.handleLineTag.bind(this),
            conditional_block: this.handleConditionalBlock.bind(this),
            prune_empty: this.handlePruneEmpty.bind(this),
            package_prune: this.handlePackagePrune.bind(this),
            custom: this.handleCustomRule.bind(this),
        };
        return handlers[type] || null;
    }
    /**
     * Get comment syntax for file extension
     */
    getCommentSyntax(filePath) {
        if (!this.config) {
            return { single: '//', block: null };
        }
        const ext = path_1.default.extname(filePath).toLowerCase();
        const syntax = this.config.comment_syntax[ext];
        if (!syntax) {
            // Default to single-line comment
            return { single: '//', block: null };
        }
        if (typeof syntax === 'string') {
            return { single: syntax, block: null };
        }
        if (Array.isArray(syntax) && syntax.length === 2) {
            return { single: null, block: { start: syntax[0], end: syntax[1] } };
        }
        return { single: '//', block: null };
    }
    /**
     * Detect if line contains a marker
     */
    detectMarker(line, marker, commentSyntax) {
        const trimmed = line.trim();
        // Check single-line comments
        if (commentSyntax.single && trimmed.startsWith(commentSyntax.single)) {
            const comment = trimmed.slice(commentSyntax.single.length).trim();
            return comment.includes(marker);
        }
        // Check block comments
        if (commentSyntax.block) {
            const { start, end } = commentSyntax.block;
            if (trimmed.includes(start) && trimmed.includes(end)) {
                const startIdx = trimmed.indexOf(start);
                const endIdx = trimmed.indexOf(end, startIdx + start.length);
                if (startIdx !== -1 && endIdx !== -1) {
                    const comment = trimmed.slice(startIdx + start.length, endIdx).trim();
                    return comment.includes(marker);
                }
            }
        }
        return false;
    }
    /**
     * Parse file content for template markers
     */
    parseFileContent(content, filePath) {
        if (!this.config) {
            return { blocks: [], taggedLines: [] };
        }
        const lines = content.split('\n');
        const commentSyntax = this.getCommentSyntax(filePath);
        const blocks = [];
        const taggedLines = [];
        let inBlock = false;
        let blockStart = -1;
        let blockType = null;
        let blockMarker = null;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            // Check for line tags
            if (this.config.markers.line_tag) {
                const lineTag = typeof this.config.markers.line_tag === 'string'
                    ? this.config.markers.line_tag
                    : this.config.markers.line_tag.start;
                if (trimmed.includes(lineTag)) {
                    taggedLines.push(i);
                    continue;
                }
            }
            // Check for block markers
            if (!inBlock) {
                // Look for start markers
                for (const [type, markerConfig] of Object.entries(this.config.markers)) {
                    if (type === 'line_tag')
                        continue;
                    const config = markerConfig;
                    if (this.detectMarker(line, config.start, commentSyntax)) {
                        inBlock = true;
                        blockStart = i;
                        blockType = type;
                        blockMarker = config;
                        break;
                    }
                }
            }
            else {
                // Look for end marker
                if (blockMarker && this.detectMarker(line, blockMarker.end, commentSyntax)) {
                    blocks.push({
                        type: blockType,
                        start: blockStart,
                        end: i,
                        marker: blockMarker,
                    });
                    inBlock = false;
                    blockStart = -1;
                    blockType = null;
                    blockMarker = null;
                }
            }
        }
        return { blocks, taggedLines };
    }
    /**
     * Handle file glob delete rule
     */
    async handleFileGlobDelete(rule) {
        const actions = [];
        const globs = Array.isArray(rule.glob) ? rule.glob : [rule.glob];
        const exclude = [...(rule.exclude || []), ...this.excludeGlobs];
        for (const pattern of globs) {
            if (!pattern)
                continue;
            const files = await (0, glob_1.glob)(pattern, {
                cwd: this.workingDir,
                absolute: true,
                ignore: exclude,
            });
            // Filter files first
            const filesToProcess = files.filter(file => {
                const relativePath = path_1.default.relative(this.workingDir, file);
                return this.shouldProcessFile(relativePath);
            });
            if (this.parallelEnabled && filesToProcess.length > 10) {
                // Create per-rule progress bar in detailed mode
                if (this.progressTracker && this.progressEnabled) {
                    this.progressTracker.createBar(rule.id, {
                        total: filesToProcess.length,
                        label: `${rule.id} (files)`,
                    });
                }
                // Use parallel processing for large file sets
                const result = await (0, parallel_1.parallel)(filesToProcess, async (file) => {
                    const relativePath = path_1.default.relative(this.workingDir, file);
                    if (!this.dryRun) {
                        await fs_1.promises.rm(file, { recursive: true, force: true });
                    }
                    return {
                        type: 'file_delete',
                        rule: rule.id,
                        path: relativePath,
                        dryRun: this.dryRun,
                    };
                }, {
                    concurrency: this.concurrency,
                    onProgress: completed => {
                        if (this.progressTracker) {
                            this.progressTracker.updateBar(rule.id, completed);
                        }
                    },
                });
                // Finish per-rule progress bar
                if (this.progressTracker) {
                    this.progressTracker.finishBar(rule.id);
                }
                actions.push(...result.results.filter(r => r !== undefined));
                // Track batch in performance metrics
                if (this.performanceTracker) {
                    this.performanceTracker.trackBatch();
                }
            }
            else {
                // Sequential processing for small file sets
                for (const file of filesToProcess) {
                    const relativePath = path_1.default.relative(this.workingDir, file);
                    if (!this.dryRun) {
                        await fs_1.promises.rm(file, { recursive: true, force: true });
                    }
                    actions.push({
                        type: 'file_delete',
                        rule: rule.id,
                        path: relativePath,
                        dryRun: this.dryRun,
                    });
                }
            }
        }
        return actions;
    }
    /**
     * Handle block markers rule
     */
    async handleBlockMarkers(rule) {
        const actions = [];
        const globs = rule.include_globs || CODE_EXTENSIONS;
        const excludeGlobs = [...(rule.exclude_globs || []), ...this.excludeGlobs];
        for (const pattern of globs) {
            const files = await (0, glob_1.glob)(pattern, {
                cwd: this.workingDir,
                absolute: true,
                ignore: excludeGlobs,
                nodir: true,
            });
            // Filter files first
            const filesToProcess = files.filter(file => {
                const relativePath = path_1.default.relative(this.workingDir, file);
                return this.shouldProcessFile(relativePath);
            });
            if (this.parallelEnabled && filesToProcess.length > 10) {
                // Create per-rule progress bar in detailed mode
                if (this.progressTracker && this.progressEnabled) {
                    this.progressTracker.createBar(rule.id, {
                        total: filesToProcess.length,
                        label: `${rule.id} (blocks)`,
                    });
                }
                // Use parallel processing for large file sets
                const result = await (0, parallel_1.parallel)(filesToProcess, async (file) => {
                    try {
                        const content = await fs_1.promises.readFile(file, 'utf8');
                        const { blocks } = this.parseFileContent(content, file);
                        const templateBlocks = blocks.filter(b => b.type === 'template_only');
                        if (templateBlocks.length > 0) {
                            let newContent = content;
                            const lines = newContent.split('\n');
                            // Remove blocks in reverse order to maintain line numbers
                            templateBlocks.reverse().forEach(block => {
                                lines.splice(block.start, block.end - block.start + 1);
                            });
                            newContent = lines.join('\n');
                            if (!this.dryRun) {
                                await fs_1.promises.writeFile(file, newContent);
                            }
                            return {
                                type: 'block_remove',
                                rule: rule.id,
                                path: path_1.default.relative(this.workingDir, file),
                                blocksRemoved: templateBlocks.length,
                                dryRun: this.dryRun,
                            };
                        }
                    }
                    catch (error) {
                        this.report.errors.push({
                            rule: rule.id,
                            file: path_1.default.relative(this.workingDir, file),
                            error: `Failed to process file: ${error.message}`,
                        });
                    }
                    return undefined;
                }, {
                    concurrency: this.concurrency,
                    onProgress: completed => {
                        if (this.progressTracker) {
                            this.progressTracker.updateBar(rule.id, completed);
                        }
                    },
                });
                // Finish per-rule progress bar
                if (this.progressTracker) {
                    this.progressTracker.finishBar(rule.id);
                }
                actions.push(...result.results.filter(r => r !== undefined));
                // Track batch in performance metrics
                if (this.performanceTracker) {
                    this.performanceTracker.trackBatch();
                }
            }
            else {
                // Sequential processing for small file sets
                for (const file of filesToProcess) {
                    try {
                        const content = await fs_1.promises.readFile(file, 'utf8');
                        const { blocks } = this.parseFileContent(content, file);
                        const templateBlocks = blocks.filter(b => b.type === 'template_only');
                        if (templateBlocks.length > 0) {
                            let newContent = content;
                            const lines = newContent.split('\n');
                            // Remove blocks in reverse order to maintain line numbers
                            templateBlocks.reverse().forEach(block => {
                                lines.splice(block.start, block.end - block.start + 1);
                            });
                            newContent = lines.join('\n');
                            if (!this.dryRun) {
                                await fs_1.promises.writeFile(file, newContent);
                            }
                            actions.push({
                                type: 'block_remove',
                                rule: rule.id,
                                path: path_1.default.relative(this.workingDir, file),
                                blocksRemoved: templateBlocks.length,
                                dryRun: this.dryRun,
                            });
                        }
                    }
                    catch (error) {
                        this.report.errors.push({
                            rule: rule.id,
                            file: path_1.default.relative(this.workingDir, file),
                            error: `Failed to process file: ${error.message}`,
                        });
                    }
                }
            }
        }
        return actions;
    }
    /**
     * Handle line tag rule
     */
    async handleLineTag(rule) {
        const actions = [];
        const globs = rule.include_globs || CODE_EXTENSIONS;
        const excludeGlobs = [...(rule.exclude_globs || []), ...this.excludeGlobs];
        for (const pattern of globs) {
            const files = await (0, glob_1.glob)(pattern, {
                cwd: this.workingDir,
                absolute: true,
                ignore: excludeGlobs,
                nodir: true,
            });
            // Filter files first
            const filesToProcess = files.filter(file => {
                const relativePath = path_1.default.relative(this.workingDir, file);
                return this.shouldProcessFile(relativePath);
            });
            if (this.parallelEnabled && filesToProcess.length > 10) {
                // Create per-rule progress bar in detailed mode
                if (this.progressTracker && this.progressEnabled) {
                    this.progressTracker.createBar(rule.id, {
                        total: filesToProcess.length,
                        label: `${rule.id} (lines)`,
                    });
                }
                // Use parallel processing for large file sets
                const result = await (0, parallel_1.parallel)(filesToProcess, async (file) => {
                    try {
                        const content = await fs_1.promises.readFile(file, 'utf8');
                        const lines = content.split('\n');
                        const { taggedLines } = this.parseFileContent(content, file);
                        if (taggedLines.length > 0) {
                            // Remove tagged lines in reverse order
                            taggedLines.reverse().forEach(lineIndex => {
                                lines.splice(lineIndex, 1);
                            });
                            const newContent = lines.join('\n');
                            if (!this.dryRun) {
                                await fs_1.promises.writeFile(file, newContent);
                            }
                            return {
                                type: 'line_remove',
                                rule: rule.id,
                                path: path_1.default.relative(this.workingDir, file),
                                linesRemoved: taggedLines.length,
                                dryRun: this.dryRun,
                            };
                        }
                    }
                    catch (error) {
                        this.report.errors.push({
                            rule: rule.id,
                            file: path_1.default.relative(this.workingDir, file),
                            error: `Failed to process file: ${error.message}`,
                        });
                    }
                    return undefined;
                }, {
                    concurrency: this.concurrency,
                    onProgress: completed => {
                        if (this.progressTracker) {
                            this.progressTracker.updateBar(rule.id, completed);
                        }
                    },
                });
                // Finish per-rule progress bar
                if (this.progressTracker) {
                    this.progressTracker.finishBar(rule.id);
                }
                actions.push(...result.results.filter(r => r !== undefined));
                // Track batch in performance metrics
                if (this.performanceTracker) {
                    this.performanceTracker.trackBatch();
                }
            }
            else {
                // Sequential processing for small file sets
                for (const file of filesToProcess) {
                    try {
                        const content = await fs_1.promises.readFile(file, 'utf8');
                        const lines = content.split('\n');
                        const { taggedLines } = this.parseFileContent(content, file);
                        if (taggedLines.length > 0) {
                            // Remove tagged lines in reverse order
                            taggedLines.reverse().forEach(lineIndex => {
                                lines.splice(lineIndex, 1);
                            });
                            const newContent = lines.join('\n');
                            if (!this.dryRun) {
                                await fs_1.promises.writeFile(file, newContent);
                            }
                            actions.push({
                                type: 'line_remove',
                                rule: rule.id,
                                path: path_1.default.relative(this.workingDir, file),
                                linesRemoved: taggedLines.length,
                                dryRun: this.dryRun,
                            });
                        }
                    }
                    catch (error) {
                        this.report.errors.push({
                            rule: rule.id,
                            file: path_1.default.relative(this.workingDir, file),
                            error: `Failed to process file: ${error.message}`,
                        });
                    }
                }
            }
        }
        return actions;
    }
    /**
     * Handle conditional block rule
     */
    async handleConditionalBlock(rule) {
        const actions = [];
        const condition = rule.condition;
        const shouldRemove = this.evaluateCondition(condition);
        if (!shouldRemove) {
            return actions; // Keep the blocks
        }
        const globs = rule.include_globs || ['**/*'];
        const excludeGlobs = [...(rule.exclude_globs || []), ...this.excludeGlobs];
        for (const pattern of globs) {
            const files = await (0, glob_1.glob)(pattern, {
                cwd: this.workingDir,
                absolute: true,
                ignore: excludeGlobs,
                nodir: true,
            });
            for (const file of files) {
                const relativePath = path_1.default.relative(this.workingDir, file);
                // Check file filtering
                if (!this.shouldProcessFile(relativePath)) {
                    continue;
                }
                try {
                    const content = await fs_1.promises.readFile(file, 'utf8');
                    const { blocks } = this.parseFileContent(content, file);
                    const conditionalBlocks = blocks.filter(b => b.type === 'conditional');
                    if (conditionalBlocks.length > 0) {
                        let newContent = content;
                        const lines = newContent.split('\n');
                        // Remove blocks in reverse order
                        conditionalBlocks.reverse().forEach(block => {
                            lines.splice(block.start, block.end - block.start + 1);
                        });
                        newContent = lines.join('\n');
                        if (!this.dryRun) {
                            await fs_1.promises.writeFile(file, newContent);
                        }
                        actions.push({
                            type: 'block_remove',
                            rule: rule.id,
                            path: path_1.default.relative(this.workingDir, file),
                            blocksRemoved: conditionalBlocks.length,
                            condition: condition,
                            dryRun: this.dryRun,
                        });
                    }
                }
                catch (error) {
                    this.report.errors.push({
                        rule: rule.id,
                        file: path_1.default.relative(this.workingDir, file),
                        error: `Failed to process file: ${error.message}`,
                    });
                }
            }
        }
        return actions;
    }
    /**
     * Evaluate conditional expression
     */
    evaluateCondition(condition) {
        if (!condition)
            return false;
        // Simple feature-based conditions: "feature" or "!feature"
        if (condition.startsWith('!')) {
            const feature = condition.slice(1);
            return !this.features.has(feature);
        }
        else {
            return this.features.has(condition);
        }
    }
    /**
     * Handle prune empty rule
     */
    async handlePruneEmpty(rule) {
        const actions = [];
        const removeEmptyFiles = rule.remove_empty_files !== false;
        const removeEmptyDirs = rule.remove_empty_dirs !== false;
        // Collect all files and directories
        const allFiles = await (0, glob_1.glob)('**/*', {
            cwd: this.workingDir,
            absolute: true,
        });
        const files = [];
        const dirs = [];
        for (const file of allFiles) {
            try {
                const stat = await fs_1.promises.stat(file);
                if (stat.isDirectory()) {
                    dirs.push(file);
                }
                else {
                    files.push(file);
                }
            }
            catch (error) {
                // Skip files that can't be accessed
            }
        }
        dirs.reverse(); // Process subdirs first
        // Remove empty files
        if (removeEmptyFiles) {
            for (const file of files) {
                try {
                    const content = await fs_1.promises.readFile(file, 'utf8');
                    if (content.trim() === '') {
                        if (!this.dryRun) {
                            await fs_1.promises.unlink(file);
                        }
                        actions.push({
                            type: 'file_delete',
                            rule: rule.id,
                            path: path_1.default.relative(this.workingDir, file),
                            reason: 'empty file',
                            dryRun: this.dryRun,
                        });
                    }
                }
                catch (error) {
                    // File might not exist or be readable, skip
                }
            }
        }
        // Remove empty directories
        if (removeEmptyDirs) {
            for (const dir of dirs) {
                try {
                    const contents = await fs_1.promises.readdir(dir);
                    if (contents.length === 0) {
                        if (!this.dryRun) {
                            await fs_1.promises.rmdir(dir);
                        }
                        actions.push({
                            type: 'file_delete',
                            rule: rule.id,
                            path: path_1.default.relative(this.workingDir, dir),
                            reason: 'empty directory',
                            dryRun: this.dryRun,
                        });
                    }
                }
                catch (error) {
                    // Directory might not exist or be readable, skip
                }
            }
        }
        return actions;
    }
    /**
     * Handle package prune rule
     */
    async handlePackagePrune(rule) {
        const actions = [];
        const managerName = rule.package_prune?.manager || 'npm';
        try {
            const packageManager = (0, package_managers_1.getPackageManager)(managerName, this.workingDir, this.dryRun);
            const result = await packageManager.prune(rule);
            if (result && result.actions) {
                actions.push(...result.actions);
            }
        }
        catch (error) {
            this.report.errors.push({
                rule: rule.id,
                error: `Package pruning failed: ${error.message}`,
            });
        }
        return actions;
    }
    /**
     * Handle custom rule
     */
    async handleCustomRule(rule) {
        const actions = [];
        if (!rule.module) {
            throw new Error(`Custom rule '${rule.id}' must specify a 'module' path`);
        }
        try {
            // Resolve module path relative to working directory
            const modulePath = path_1.default.resolve(this.workingDir, rule.module);
            // Load the custom module
            // Dynamic require is the point here: custom rules are user-supplied plugin modules
            // resolved from the config at runtime, so the path is not statically known.
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const customModule = require(modulePath);
            if (typeof customModule.execute !== 'function') {
                throw new Error(`Custom module '${rule.module}' must export an 'execute' function`);
            }
            // Execute the custom rule
            const result = await customModule.execute(rule, this);
            // Handle different return formats
            if (result && Array.isArray(result)) {
                actions.push(...result);
            }
            else if (result && result.actions && Array.isArray(result.actions)) {
                actions.push(...result.actions);
            }
        }
        catch (error) {
            throw new Error(`Failed to execute custom rule '${rule.id}': ${error.message}`, {
                cause: error,
            });
        }
        return actions;
    }
    /**
     * Calculate summary statistics
     */
    calculateSummary() {
        const summary = {
            totalActions: this.report.actions.length,
            filesDeleted: 0,
            linesRemoved: 0,
            blocksRemoved: 0,
            dependenciesRemoved: 0,
        };
        for (const action of this.report.actions) {
            switch (action.type) {
                case 'file_delete':
                    summary.filesDeleted++;
                    break;
                case 'line_remove':
                    summary.linesRemoved++;
                    break;
                case 'block_remove':
                    summary.blocksRemoved++;
                    break;
                case 'dependency_remove':
                    summary.dependenciesRemoved++;
                    break;
            }
        }
        this.report.summary = summary;
    }
    /**
     * Export report to JSON file
     */
    async exportReport(outputPath) {
        const reportPath = path_1.default.resolve(this.workingDir, outputPath);
        await fs_1.promises.writeFile(reportPath, JSON.stringify(this.report, null, 2));
        return reportPath;
    }
}
exports.CleanupEngine = CleanupEngine;
/**
 * Execute cleanup with given options
 */
async function executeCleanup(options = {}) {
    const engine = new CleanupEngine(options);
    try {
        await engine.loadConfig();
        const report = await engine.execute();
        if (options.report) {
            await engine.exportReport(options.report);
        }
        // Determine exit code based on failOnActions flag
        let exitCode = 0; // Success
        if (options.failOnActions && report.actions.length > 0) {
            exitCode = 2; // Actions detected
        }
        return { report, exitCode };
    }
    catch (error) {
        throw new Error(`Cleanup failed: ${error.message}`, { cause: error });
    }
}
//# sourceMappingURL=engine.js.map