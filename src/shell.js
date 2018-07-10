import logger from './logger';
import config from './config';
import exec from './exec';

export async function isRunningVm(vmName) {
    logger.info(`checking if ${vmName} is running`);
    const command = `${config.virtualBoxExecPath} list runningvms`;
    const { stdout } = await exec(command);
    return !!stdout.split('\n').filter(line => line.match(/"([^"]+)"/) && line.match(/"([^"]+)"/)[1] === vmName).length;
}

export function forceShutdown(vmName) {
    logger.info(`forcing ${vmName} to shutdown`);
    return true;
}

export async function softShutdown(vmName) {
    logger.info(`soft shutdown ${vmName}`);
    const command = `${config.virtualBoxExecPath} controlvm ${vmName} acpipowerbutton`;
    await exec(command);
}

export function startVm(vmName) {
    logger.info(`starting ${vmName}`);
    return true;
}

export function copyFile(src, dest) {
    logger.info(`copying file from ${src} to ${dest}`);
    return true;
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