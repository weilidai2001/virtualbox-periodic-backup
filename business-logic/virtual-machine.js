import { isRunningVm, forceShutdown } from '../shell-commands/virtual-machine';

const checkIsVmRunning = (sleepInSec, vmName) => {
    return new Promise((res) => {
        const isVmRunning = isRunningVm();
        if (isVmRunning) {
            setTimeout(() => {
                res(checkIsVmRunning(sleepInSec, vmName));
            }, sleepInSec);
        } else {
            res();
        }
    });
};

export function shutdownVmWithTimeout(
    vmName,
    statusCheckFrequencyInSec = 1,
    timeoutInSec = 180,
    ) {
    console.log(`VM shutdown requested with status checking every ${statusCheckFrequencyInSec}s and a timeout of ${timeoutInSec}s`);

    const timeoutPromise = new Promise((res) => {
        setTimeout(() => {
            forceShutdown();
            res();
        }, timeoutInSec * 1000);
    });
    const checkIsVmRunningPromise = checkIsVmRunning(statusCheckFrequencyInSec * 1000, vmName);
    return Promise.race([timeoutPromise, checkIsVmRunningPromise]);
}
