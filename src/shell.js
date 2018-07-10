import logger from './logger';
import config from './config';
import exec from './exec';
import fsExtra from 'fs-extra';
import util from 'util';
const stat = util.promisify(require('fs').stat);

export async function isRunningVm(vmName) {
    const command = `${config.virtualBoxExecPath} list runningvms`;
    const { stdout } = await exec(command);
    const isRunning = !!stdout.split('\n').filter(line => line.match(/"([^"]+)"/) && line.match(/"([^"]+)"/)[1] === vmName).length;
    logger.info(`${vmName} is ${isRunning ? 'running': 'not running'}`);
    return isRunning;
}

export async function forceShutdown(vmName) {
    logger.info(`forcing ${vmName} to shutdown`);
    const command = `${config.virtualBoxExecPath} controlvm ${vmName} poweroff`;
    await exec(command);
}

export async function softShutdown(vmName) {
    logger.info(`soft shutdown ${vmName}`);
    const command = `${config.virtualBoxExecPath} controlvm ${vmName} acpipowerbutton`;
    await exec(command);
}

export async function startVm(vmName) {
    logger.info(`starting ${vmName}`);
    const command = `${config.virtualBoxExecPath} startvm "${vmName}" --type "headless"`;
    await exec(command);
}

export async function copyFile(src, dest) {
    logger.info(`copying file from ${src} to ${dest}`);
    await fsExtra.copy(src, dest);
}

export async function isFilesIdentical(src, dest) {
    const {size: srcSize} = await stat(src);
    const {size: destSize} = await stat(dest);
    const isSame = srcSize === destSize;
    if (isSame) {
        logger.info(`files are identical "${src}" and "${dest}"`);
    } else {
        logger.info(`files are different "${src}" and "${dest}". ${srcSize} vs ${destSize}`);
    }
    return isSame;
}

export function getAllFilesFromDirectory(directory) {
    logger.info(`retrieving files from ${directory}`);
    return [];
}

export function deleteFile(path) {
    logger.info(`deleting file ${path}`);
}