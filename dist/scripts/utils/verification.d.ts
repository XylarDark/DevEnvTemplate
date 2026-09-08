/**
 * Verification Utilities
 *
 * Provides framework-agnostic utilities for:
 * - Pre-commit verification checks
 * - Pre-deployment verification checks
 * - Environment setup verification
 * - Framework-agnostic verification patterns
 */
export interface VerificationResult {
    passed: boolean;
    errors: string[];
    warnings?: string[];
}
/**
 * Run pre-commit verification checks
 *
 * @param projectRoot - Root directory of the project
 * @returns Verification result with errors if any
 *
 * @example
 * ```typescript
 * const result = await verifyPreCommit('/path/to/project');
 * if (!result.passed) {
 *   console.error('Pre-commit checks failed:', result.errors);
 * }
 * ```
 */
export declare function verifyPreCommit(projectRoot: string): Promise<VerificationResult>;
/**
 * Run pre-deployment verification checks
 *
 * @param projectRoot - Root directory of the project
 * @returns Verification result with errors if any
 *
 * @example
 * ```typescript
 * const result = await verifyPreDeployment('/path/to/project');
 * if (!result.passed) {
 *   console.error('Pre-deployment checks failed:', result.errors);
 *   process.exit(1);
 * }
 * ```
 */
export declare function verifyPreDeployment(projectRoot: string): Promise<VerificationResult>;
/**
 * Verify environment setup
 *
 * @param projectRoot - Root directory of the project
 * @returns Verification result with errors if any
 *
 * @example
 * ```typescript
 * const result = await verifyEnvironment('/path/to/project');
 * if (!result.passed) {
 *   console.error('Environment setup incomplete:', result.errors);
 * }
 * ```
 */
export declare function verifyEnvironment(projectRoot: string): Promise<VerificationResult>;
/**
 * Run all verification checks
 *
 * @param projectRoot - Root directory of the project
 * @param checks - Array of check types to run (default: all)
 * @returns Combined verification result
 *
 * @example
 * ```typescript
 * const result = await verifyAll('/path/to/project', ['preCommit', 'environment']);
 * ```
 */
export declare function verifyAll(projectRoot: string, checks?: ('preCommit' | 'preDeployment' | 'environment')[]): Promise<VerificationResult>;
//# sourceMappingURL=verification.d.ts.map