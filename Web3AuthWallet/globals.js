import { decode } from 'base-64';

global.Buffer = require('buffer').Buffer;

global.process.version = 'v16.0.0';
if (!global.process.version) {
    global.process = require('process');
    console.log({ process: global.process });
}

process.browser = true;

global.atob = decode;