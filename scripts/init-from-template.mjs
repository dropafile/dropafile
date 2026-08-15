#!/usr/bin/env node

import { initFromTemplate } from './lib/template-init/index.js';
import { CF_HONO_REACT_FILE_UPLOADER_MANIFEST } from './lib/template-init/manifests/cf-hono-react-file-uploader.js';
import { printHelp } from './lib/template-init/parse-args.js';
import { brandHeader, error as printError } from './lib/template-init/terminal.js';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  brandHeader('cf hono react file uploader template');
  printHelp('cf-hono-react-file-uploader-template');
  process.exit(0);
}

initFromTemplate({
  manifest: CF_HONO_REACT_FILE_UPLOADER_MANIFEST,
  includePackageName: false,
  includeAuthorStep: true,
  includeBundler: true,
  defaultBundler: 'npm',
  templateLabel: 'cf hono react file uploader template',
  authorStep: {
    stepTitle: 'maintainer (Git owner)',
    selectMessage: 'How should we set the package maintainer?',
    acceptLabel: 'Accept detected Git owner',
  },
  scriptsCleanup: 'all',
  nextSteps: 'npm install, then npm run dev',
}).catch((err) => {
  printError(`Init failed: ${err.message}`);
  process.exit(1);
});
