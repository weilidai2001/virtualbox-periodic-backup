import vmStatus from './vm-status';

const checkIsVmRunning = (sleepInSec, vmName) => {
    return new Promise((res) => {
        const isVmRunning = vmStatus();
        if (isVmRunning) {
            setTimeout(() => {
                res(checkIsVmRunning(sleepInSec, vmName));
            }, sleepInSec);
        } else {
            res();
        }
    });
};

export function shutdownVM(
    vmName,
    statusCheckFrequencyInSec = 1,
    timeoutInSec = 180,
    ) {
    console.log('VM shutdown', statusCheckFrequencyInSec, timeoutInSec);

    return checkIsVmRunning(statusCheckFrequencyInSec * 1000, vmName);
}

