import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Helper to convert PascalCase or camelCase to kebab-case
function toKebabCase(str) {
	return str
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();
}

async function getFailedFiles() {
	try {
		await execAsync('npx @ls-lint/ls-lint');
		return [];
	} catch (error) {
		const output = error.stdout || error.stderr || '';
		const lines = output.split('\n');
		const files = [];

		for (const line of lines) {
			const match = line.match(/^(.+?) failed for .+? rules: kebabcase/);
			if (match) {
				files.push(match[1].trim());
			}
		}

		return files;
	}
}

async function renameFilesAndGetMap(files) {
	const map = new Map(); // map absolute old path (without extension) -> new basename

	for (const file of files) {
		const ext = path.extname(file);
		const basename = path.basename(file, ext);
		
		const kebabBasename = toKebabCase(basename);
		if (kebabBasename === basename) continue; // Already kebab or something else

		const dir = path.dirname(file);
		const newFile = path.join(dir, kebabBasename + ext);

		try {
			await fs.rename(file, newFile);
			console.log(`Renamed: ${file} -> ${newFile}`);
			map.set(basename, kebabBasename);
		} catch (e) {
			console.error(`Failed to rename ${file}:`, e.message);
		}
	}
	return map;
}

async function walk(dir) {
	let results = [];
	try {
		const list = await fs.readdir(dir, { withFileTypes: true });
		for (const file of list) {
			if (file.name === 'node_modules' || file.name === '.next' || file.name === 'dist' || file.name === '.git') continue;
			
			const fullPath = path.resolve(dir, file.name);
			if (file.isDirectory()) {
				results = results.concat(await walk(fullPath));
			} else {
				if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
					results.push(fullPath);
				}
			}
		}
	} catch (e) {
	}
	return results;
}

async function updateImports(renameMap) {
	console.log('Finding files to update imports...');
	const allFiles = [...await walk('apps'), ...await walk('packages')];
	let updatedCount = 0;

	for (const file of allFiles) {
		try {
			let content = await fs.readFile(file, 'utf8');
			let hasChanges = false;

			for (const [oldName, newName] of renameMap.entries()) {
				const escapedOldName = escapeRegExp(oldName);
				const regex = new RegExp(`(from\\s+['"].*?\\/?)${escapedOldName}(['"])`, 'g');
				if (regex.test(content)) {
					content = content.replace(regex, `$1${newName}$2`);
					hasChanges = true;
				}
                
                const dynRegex = new RegExp(`(import\\s*\\(\\s*['"].*?\\/?)${escapedOldName}(['"])`, 'g');
				if (dynRegex.test(content)) {
					content = content.replace(dynRegex, `$1${newName}$2`);
					hasChanges = true;
				}
			}

			if (hasChanges) {
				await fs.writeFile(file, content, 'utf8');
				updatedCount++;
			}
		} catch (e) {
		}
	}
	console.log(`Updated imports in ${updatedCount} files.`);
}

async function main() {
	console.log('Running ls-lint to find files...');
	const files = await getFailedFiles();
	console.log(`Found ${files.length} files violating kebab-case.`);
	
	if (files.length === 0) {
		console.log('Nothing to do!');
		return;
	}

	const renameMap = await renameFilesAndGetMap(files);
	console.log(`Renamed ${renameMap.size} files.`);

	if (renameMap.size > 0) {
		await updateImports(renameMap);
	}
    
    try {
		await execAsync('npx @ls-lint/ls-lint');
		console.log('All files now pass ls-lint!');
	} catch (error) {
		console.error('Some files still fail ls-lint:');
        console.error(error.stdout);
	}
}

main().catch(console.error);
