/* tslint:disable:no-console */
const path = require ('path');
const fs = require ('fs-extra');
const { exec } = require('child_process');

console.log('Building admin-ui from source...');
exec(
    // yarn gives error, so fallback on npm:
//     Building admin-ui from source...
// { Error: Command failed: yarn build --prod=true
// Killed
// error Command failed with exit code 137.

//     at ChildProcess.exithandler (child_process.js:294:12)
//     at ChildProcess.emit (events.js:189:13)
//     at maybeClose (internal/child_process.js:970:16)
//     at Process.ChildProcess._handle.onexit (internal/child_process.js:259:5)
//   killed: false,
//   code: 137,
//   signal: null,
//   cmd: 'yarn build --prod=true' }

    'npm run build --prod=true',
    // 'yarn build --prod=true',
    {
        cwd: path.join(__dirname, '../../admin-ui'),
    },
    async error => {
        if (error) {
            console.log(error);
            process.exit(1);
        }
        console.log('done!');
        await fs.copy('../../admin-ui/dist/vendure-admin', 'lib/admin-ui');
        process.exit(0);
    },
);
