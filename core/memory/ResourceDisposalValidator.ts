/**
 * Resource Disposal Validator
 * Utility to validate proper cleanup of resources
 */

interface DisposableResource {
  id: string;
  type: string;
  created: number;
  disposed?: number;
}

export class ResourceDisposalValidator {
  private static resources: Map<string, DisposableResource> = new Map();

  static track(id: string, type: string): void {
    this.resources.set(id, {
      id,
      type,
      created: Date.now()
    });
  }

  static dispose(id: string): void {
    const resource = this.resources.get(id);
    if (resource) {
      resource.disposed = Date.now();
    }
  }

  static validate(): { undisposed: DisposableResource[], total: number } {
    const undisposed = Array.from(this.resources.values())
      .filter(resource => !resource.disposed);
    
    return {
      undisposed,
      total: this.resources.size
    };
  }

  static clear(): void {
    this.resources.clear();
  }
}

export const resourceDisposalValidator = ResourceDisposalValidator; 