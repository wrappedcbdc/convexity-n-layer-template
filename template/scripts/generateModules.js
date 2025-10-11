const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
// The base directory where your modules will be created.
const MODULES_BASE_DIR = path.join('src', 'Modules');
// ---------------------

const toPascalCase = (str) => {
    return str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())
        .join('');
};

const getModuleName = () => {
    const argv = process.argv.slice(2);
    let name;

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === '--name' || arg === '-n') {
            name = argv[i + 1];
            i++;
            continue;
        }

        if (arg.startsWith('--name=')) {
            name = arg.split('=').slice(1).join('=');
            continue;
        }

        if (arg.startsWith('-n=')) {
            name = arg.split('=').slice(1).join('=');
            continue;
        }

        // Fallback: first non-flag is treated as the name
        if (!arg.startsWith('-') && !name) {
            name = arg;
        }
    }

    if (!name) {
        console.error('❌ Error: Please provide a module name.');
        console.error('   > Examples:');
        console.error('     npm run generate:module Wallet');
        console.error('     npm run generate:module -- --name Wallet');
        console.error('     node ./scripts/generateModules.js --name Wallet');
        process.exit(1);
    }

    return toPascalCase(name);
};



// --- TEMPLATES ---
// These functions return the boilerplate content for each file.

const getEntityTemplate = (moduleName, fileName) => `
export interface I${moduleName}Service {
    NewMethod(params: string): void;
}

export interface I${moduleName}Repository {
    create(params: any): Promis<any>;
    findById(id: string): Promise<any>;
    findAll(): Promis<any[]>;
    update(id: string, params: any): Promise<any>;
    delete(id: string): Promise<void>;
}
`;

const getControllerTemplate = (moduleName, fileName) => `
import { Request, Response } from 'express';

export class ${moduleName}Controller {}
`;

const getRepositoryTemplate = (moduleName, fileName) => `
// This is a placeholder for your data access logic (e.g., using an ORM like Prisma or TypeORM)
import { I${moduleName}Repository } from '../entity/${fileName}.entity';

let instance: ${moduleName}Repository | null = null;
export class ${moduleName}Repository implements I${moduleName}Repository {
    
    public static getInstance(): ${moduleName}Repository {
        if (!instance) {
            instance = new ${moduleName}Repository();
        }
        return instance;
    }

  public async findById(id: string): Promise<any> {
    console.log('Fetching ${fileName} with id:', id);
    return null;
  }
  
    public async create(params: any): Promise<void> {
        console.log('Creating ${fileName} with params:',
        params);
    }
    
    public async findAll(): Promise<any[]> {
        console.log('Fetching all ${fileName}s');
        return [];
    }
    
    public async update(id: string, params: any): Promise<void> {
        console.log('Updating ${fileName} with id:', id, 'and params:', params);
        
    }
    
    public async delete(id: string): Promise<void> {
        console.log('Deleting ${fileName} with id:', id);
     }
}

export default ${moduleName}Repository.getInstance();
`;

const getRouteTemplate = (moduleName, fileName) => `
import { Router } from 'express';
import {validateSchema} from "../../../Core/Configs/global.validation";
import { ${moduleName}Controller } from '../http/${fileName}.controller';

const router = Router();

router.get('/', [], use(${moduleName}Controller.get));

export { ${fileName}Router };
`;

const getServiceTemplate = (moduleName, fileName) => `
import { ${moduleName}Repository } from '../repository/${fileName}.repository';
import { I${moduleName}Service } from '../entity/${fileName}.entity';

export class ${moduleName}Service implements I${moduleName}Service {
  private readonly repository: ${moduleName}Repository;
  private static instance: ${moduleName}Service;
   
   // Singleton: prevent direct construction calls with the \`new\` operator
   static getInstance(): ${moduleName}Service {
       if (!${moduleName}Service.instance) {
           ${moduleName}Service.instance = new ${moduleName}Service();
        }
        return ${moduleName}Service.instance;
   }

  public async getOne(id: string) {
    return this.repository.findById(id);
  }
}

export default ${moduleName}Service.getInstance();
`;

const getValidationTemplate = (moduleName, fileName) => `
import { z } from 'zod'; // Example using Zod library

export const create${moduleName}Schema = z.object({
  body: z.object({
    // Add your validation rules here
    name: z.string().min(3, 'Name must be at least 3 characters long'),
  }),
});
`;

// --- MAIN SCRIPT LOGIC ---

const main = () => {
    const moduleNamePascal = getModuleName(); // e.g., "Wallet"
    const moduleNameLower = moduleNamePascal.toLowerCase(); // e.g., "wallet"
    const modulePath = path.join(MODULES_BASE_DIR, moduleNamePascal);

    console.log(`🚀 Starting module generation for "${moduleNamePascal}"...`);

    if (fs.existsSync(modulePath)) {
        console.error(`❌ Error: Module "${moduleNamePascal}" already exists at ${modulePath}`);
        process.exit(1);
    }

    // Define the directory and file structure
    const structure = {
        'entity': {
            [`${moduleNameLower}.entity.ts`]: getEntityTemplate(moduleNamePascal, moduleNameLower),
        },
        'http': {
            [`${moduleNameLower}.controller.ts`]: getControllerTemplate(moduleNamePascal, moduleNameLower),
        },
        'repository': {
            [`${moduleNameLower}.repository.ts`]: getRepositoryTemplate(moduleNamePascal, moduleNameLower),
        },
        'route': {
            [`${moduleNameLower}.route.ts`]: getRouteTemplate(moduleNamePascal, moduleNameLower),
        },
        'services': {
            [`${moduleNameLower}.service.ts`]: getServiceTemplate(moduleNamePascal, moduleNameLower),
        },
        'validation': {
            [`${moduleNameLower}.validation.ts`]: getValidationTemplate(moduleNamePascal, moduleNameLower),
        }
    };

    // Create the main module directory
    fs.mkdirSync(modulePath, { recursive: true });
    console.log(`   ✅ Created directory: ${modulePath}`);

    // Create subdirectories and files
    for (const dir in structure) {
        const dirPath = path.join(modulePath, dir);
        fs.mkdirSync(dirPath);
        console.log(`   ✅ Created directory: ${dirPath}`);

        for (const file in structure[dir]) {
            const filePath = path.join(dirPath, file);
            const fileContent = structure[dir][file];
            fs.writeFileSync(filePath, fileContent.trim());
            console.log(`      📄 Created file: ${filePath}`);
        }
    }

    console.log(`\n🎉 Module "${moduleNamePascal}" created successfully!`);
};

main();