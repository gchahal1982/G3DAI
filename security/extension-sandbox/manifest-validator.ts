/**
 * Extension Manifest Security Validator
 * Validates extension manifests for security compliance
 */

interface ExtensionManifest {
  name: string;
  version: string;
  permissions?: string[];
  contributes?: {
    commands?: any[];
    views?: any[];
    webviews?: any[];
  };
  main?: string;
  browser?: string;
}

interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  securityScore: number;
}

export class ManifestValidator {
  private readonly DANGEROUS_PERMISSIONS = [
    'file://*',
    'http://*',
    'https://*',
    '*://*/*',
    'activeTab',
    'tabs',
    'storage',
    'nativeMessaging'
  ];

  private readonly RESTRICTED_COMMANDS = [
    'executeCommand',
    'eval',
    'Function',
    'require'
  ];

  /**
   * Validates an extension manifest for security compliance
   */
  validateManifest(manifest: ExtensionManifest): SecurityValidationResult {
    const result: SecurityValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      securityScore: 100
    };

    // Check for dangerous permissions
    this.validatePermissions(manifest, result);
    
    // Check for restricted commands
    this.validateCommands(manifest, result);
    
    // Check for webview security
    this.validateWebviews(manifest, result);
    
    // Check for file access patterns
    this.validateFileAccess(manifest, result);
    
    // Calculate final security score
    result.securityScore = Math.max(0, result.securityScore - (result.errors.length * 20) - (result.warnings.length * 5));
    result.isValid = result.errors.length === 0 && result.securityScore >= 70;

    return result;
  }

  private validatePermissions(manifest: ExtensionManifest, result: SecurityValidationResult): void {
    if (!manifest.permissions) return;

    for (const permission of manifest.permissions) {
      if (this.DANGEROUS_PERMISSIONS.some(dangerous => permission.includes(dangerous))) {
        result.errors.push(`Dangerous permission detected: ${permission}`);
      }
      
      if (permission.includes('*')) {
        result.warnings.push(`Wildcard permission should be avoided: ${permission}`);
      }
    }
  }

  private validateCommands(manifest: ExtensionManifest, result: SecurityValidationResult): void {
    if (!manifest.contributes?.commands) return;

    for (const command of manifest.contributes.commands) {
      if (this.RESTRICTED_COMMANDS.some(restricted => command.command?.includes(restricted))) {
        result.errors.push(`Restricted command pattern detected: ${command.command}`);
      }
    }
  }

  private validateWebviews(manifest: ExtensionManifest, result: SecurityValidationResult): void {
    if (!manifest.contributes?.webviews) return;

    for (const webview of manifest.contributes.webviews) {
      if (!webview.csp) {
        result.warnings.push('Webview missing Content Security Policy');
      }
      
      if (webview.enableScripts && !webview.retainContextWhenHidden) {
        result.warnings.push('Webview with scripts should retain context for security');
      }
    }
  }

  private validateFileAccess(manifest: ExtensionManifest, result: SecurityValidationResult): void {
    const manifestStr = JSON.stringify(manifest);
    
    // Check for file:// protocol usage
    if (manifestStr.includes('file://')) {
      result.warnings.push('Direct file:// protocol access detected');
    }
    
    // Check for eval-like patterns
    if (manifestStr.includes('eval') || manifestStr.includes('Function(')) {
      result.errors.push('Dynamic code execution patterns detected');
    }
  }

  /**
   * Generates a security report for an extension
   */
  generateSecurityReport(manifest: ExtensionManifest): string {
    const validation = this.validateManifest(manifest);
    
    let report = `🔒 Security Report for ${manifest.name} v${manifest.version}\n`;
    report += `📊 Security Score: ${validation.securityScore}/100\n`;
    report += `✅ Status: ${validation.isValid ? 'PASSED' : 'FAILED'}\n\n`;
    
    if (validation.errors.length > 0) {
      report += `❌ Security Errors:\n`;
      validation.errors.forEach(error => report += `  • ${error}\n`);
      report += `\n`;
    }
    
    if (validation.warnings.length > 0) {
      report += `⚠️  Security Warnings:\n`;
      validation.warnings.forEach(warning => report += `  • ${warning}\n`);
      report += `\n`;
    }
    
    if (validation.isValid) {
      report += `🎉 Extension meets security requirements!\n`;
    } else {
      report += `🚨 Extension requires security improvements before approval.\n`;
    }
    
    return report;
  }
} 