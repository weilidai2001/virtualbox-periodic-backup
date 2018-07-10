import logger from './logger';
import config from './config';
import exec from './exec';
import fs from 'fs-extra';

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
    await fs.copy(src, dest);
}

export function isFilesIdentical(src, dest) {
    logger.info(`comparing file ${src} and ${dest}`);
    return true;
}

export function getAllFilesFromDirectory(directory) {
    logger.info(`retrieving files from ${directory}`);
    return [];
}

export function deleteFile(path) {
    logger.info(`deleting file ${path}`);
}