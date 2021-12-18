#!/usr/bin/env node

import * as kleur from 'kleur';
import * as fs from 'fs';
import * as path from 'path';

const [, , destPath] = process.argv;

if (!destPath) {
  console.log(kleur.red('destination path argument is missing.'));
  process.exit(-1);
}

// if(!fs.existsSync(destPath)) {
//   console.log(kleur.red(`Export destination path ${destPath} does not exist.`));
//   process.exit(-1);
// }

fs.cpSync('./ligo/', destPath, { recursive: true, errorOnExist: true });
console.log(kleur.green(`Ligo library exported to ${path.resolve(destPath)}`));
