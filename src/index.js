import {
    shutdownVmWithTimeout,
    copyVm,
    checkVmCopiedCorrectly,
    deleteOldestVmOverLimit,
    startVm,
} from './commands';

import config from './config';

(async function(){
    const vmName = config.vmName;
    const vmFileName = config.vmFileName;
    await shutdownVmWithTimeout(vmName);
    const newName = await copyVm(vmFileName);
    await checkVmCopiedCorrectly(vmFileName, newName);
    await deleteOldestVmOverLimit(vmName);
    await startVm(vmName);
})();
