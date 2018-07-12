import "babel-polyfill"
import {
    shutdownVmWithTimeout,
    startVm,
    copyVm,
    checkVmCopiedCorrectly,
    deleteOldestVmOverLimit,
} from './commands';
import * as shell from './shell';
import * as util from './util';
import config from './config';
jest.mock('./config');

describe('shutdownVm()', () => {
    test('it calls softShutdown() 3 times when isRunningVm is true', async () => {
        const vmName = '';
        shell.softShutdown = jest.fn(() => Promise.resolve());
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 0.05;
        const responses = [...Array(9).fill(true), false];
        shell.isRunningVm = jest.fn(() => Promise.resolve(responses.shift()));
        await shutdownVmWithTimeout(vmName, delayInSeconds, timeoutInSeconds);

        expect(shell.softShutdown.mock.calls.length).toBe(3);
    });

    test('it doesn`t call softShutdown() when isRunningVm is false', async () => {
        const vmName = '';
        shell.softShutdown = jest.fn(() => Promise.resolve());
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 0.05;
        shell.isRunningVm = jest.fn(() => Promise.resolve(false));
        await shutdownVmWithTimeout(vmName, delayInSeconds, timeoutInSeconds);

        expect(shell.softShutdown.mock.calls.length).toBe(0);
    });

    test('it calls isRunningVm()', async () => {
        const vmName = '';
        shell.softShutdown = jest.fn(() => Promise.resolve());
        shell.isRunningVm = jest.fn(() => Promise.resolve(false));
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 0.05;
        await shutdownVmWithTimeout(vmName, delayInSeconds, timeoutInSeconds);

        expect(shell.isRunningVm.mock.calls.length).toBeGreaterThan(0);
    });

    test('it calls isRunningVm() 10 times with delay of 10 milliseconds', async () => {
        const vmName = '';
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 10;
        const responses = [...Array(9).fill(true), false];
        shell.isRunningVm = jest.fn(() => Promise.resolve(responses.shift()));
        shell.softShutdown = jest.fn(() => Promise.resolve());
        await shutdownVmWithTimeout(vmName, delayInSeconds, timeoutInSeconds);

        expect(shell.isRunningVm.mock.calls.length).toBe(10);
    });

    test('it calls isRunningVm() 1+5 times with before timing out', async () => {
        const vmName = '';
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 0.05;
        const responses = [...Array(9).fill(true), false];
        shell.isRunningVm = jest.fn(() => Promise.resolve(responses.shift()));
        shell.softShutdown = jest.fn(() => Promise.resolve());
        shell.forceShutdown = jest.fn(() => Promise.resolve());
        await shutdownVmWithTimeout(vmName, delayInSeconds, timeoutInSeconds);

        expect(shell.isRunningVm.mock.calls.length).toBe(1+5); // once for initial check
    });

    test('it calls forceShutdown() when timed out and vm is running', async () => {
        const vmName = '';
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 0.05;
        shell.isRunningVm = jest.fn(() => Promise.resolve(true));
        shell.softShutdown = jest.fn(() => Promise.resolve());
        shell.forceShutdown = jest.fn(() => Promise.resolve());

        await shutdownVmWithTimeout(vmName, delayInSeconds, timeoutInSeconds);

        expect(shell.forceShutdown.mock.calls.length).toBe(1);
    });

});

describe('startVm()', () => {
    test('it calls shell.startVm()', async () => {
        shell.startVm = jest.fn(() => Promise.resolve());
        await startVm();

        expect(shell.startVm.mock.calls.length).toBe(1);
    });
});

describe('copyVm()', () => {
    test('it calls shell.copyFile()', async () => {
        shell.copyFile = jest.fn(() => Promise.resolve());
        await copyVm('');

        expect(shell.copyFile.mock.calls.length).toBe(1);
    });

    test('it calls shell.copyFile() with new file name from timestamp', async () => {
        const vmFileName = 'abc.ext';
        const mockDateTimestamp = '2018-07-10T10:10:00.260Z';
        const expectedNewFileName = 'abc 2018-07-10T10_10_00.260Z.ext';
        const srcDirectory = 'srcDir/dirA/';
        const destDirectory = 'destDir/dirB/';
        config.srcDirectory = srcDirectory;
        config.destDirectory = destDirectory;
        shell.copyFile = jest.fn(() => Promise.resolve());
        util.now = jest.fn(() => new Date(mockDateTimestamp));
        const newFilename = await copyVm(vmFileName);

        expect(shell.copyFile.mock.calls.length).toBe(1);

        const [src, dest] = shell.copyFile.mock.calls[0];
        expect(newFilename).toBe(expectedNewFileName);
        expect(src).toBe(srcDirectory + vmFileName);
        expect(dest).toBe(destDirectory + expectedNewFileName);
    });
});

describe('checkVmCopiedCorrectly()', () => {
    test('it calls shell.isFilesIdentical() with correct src and dest path', async () => {
        const srcFileName = 'FileA';
        const destFileName = 'FileB';

        const srcDirectory = 'srcDir/dirA/';
        const destDirectory = 'destDir/dirB/';
        config.srcDirectory = srcDirectory;
        config.destDirectory = destDirectory;

        shell.isFilesIdentical = jest.fn(() => Promise.resolve());

        await checkVmCopiedCorrectly(srcFileName, destFileName);

        expect(shell.isFilesIdentical.mock.calls.length).toBe(1);

        const [src, dest] = shell.isFilesIdentical.mock.calls[0];

        expect(src).toBe(srcDirectory + srcFileName);
        expect(dest).toBe(destDirectory + destFileName);
    });
});

describe('deleteOldestVm()', () => {
    test('it calls shell.deletFile() on the oldest filename', async () => {
        const vmFileName = 'FileA';
        const fakeBackupFiles = [
            'backup_dir/WrongName 2018-07-07T10_10_00.260Z.ext',
            'backup_dir/FileA 2018-07-08T10_10_00.260Z.ext',
            'backup_dir/FileA 2018-07-09T10_10_00.260Z.ext',
            'backup_dir/FileA 2018-07-10T10_10_00.260Z.ext',
        ];

        shell.getAllFilesFromDirectory = jest.fn(() => Promise.resolve(fakeBackupFiles));
        shell.deleteFile = jest.fn(() => Promise.resolve());

        await deleteOldestVmOverLimit(vmFileName, 2);

        expect(shell.getAllFilesFromDirectory.mock.calls.length).toBe(1);
        expect(shell.deleteFile.mock.calls.length).toBe(1);

        const [deletedFile] = shell.deleteFile.mock.calls[0];

        expect(deletedFile).toBe('backup_dir/FileA 2018-07-08T10_10_00.260Z.ext');
    });

    test('it doesn`t call shell.deletFile() if limit not met', async () => {
        const limit = 5;
        const vmFileName = 'FileA';
        const fakeBackupFiles = [
            'backup_dir/WrongName 2018-07-07T10_10_00.260Z.ext',
            'backup_dir/FileA 2018-07-08T10_10_00.260Z.ext',
            'backup_dir/FileA 2018-07-09T10_10_00.260Z.ext',
            'backup_dir/FileA 2018-07-10T10_10_00.260Z.ext',
        ];

        shell.getAllFilesFromDirectory = jest.fn(() => Promise.resolve(fakeBackupFiles));
        shell.deleteFile = jest.fn(() => Promise.resolve());

        await deleteOldestVmOverLimit(vmFileName, limit);

        expect(shell.getAllFilesFromDirectory.mock.calls.length).toBe(1);
        expect(shell.deleteFile.mock.calls.length).toBe(0);

    });

    test('it calls shell.deletFile() on the 3 oldest filenames over the limit', async () => {
        const vmFileName = 'FileA.ext';
        const fakeBackupFiles = [
            'backup_dir/WrongName 2018-07-07T10_10_00.260Z.ext',
            'backup_dir/FileA 2018-07-06T10_10_00.260Z.ext',
            'backup_dir/FileA 2018-07-05T10_10_00.260Z.ext',
            'backup_dir/FileA 2018-07-07T10_10_00.260Z.ext',
            'backup_dir/FileA 2018-07-08T10_10_00.260Z.ext',
            'backup_dir/FileA 2018-07-09T10_10_00.260Z.ext',
            'backup_dir/FileA 2018-07-10T10_10_00.260Z.ext',
        ];

        shell.getAllFilesFromDirectory = jest.fn(() => Promise.resolve(fakeBackupFiles));
        shell.deleteFile = jest.fn(() => Promise.resolve());

        await deleteOldestVmOverLimit(vmFileName, 3);

        expect(shell.getAllFilesFromDirectory.mock.calls.length).toBe(1);
        expect(shell.deleteFile.mock.calls.length).toBe(3);

        const [deletedFile1] = shell.deleteFile.mock.calls[0];
        const [deletedFile2] = shell.deleteFile.mock.calls[1];
        const [deletedFile3] = shell.deleteFile.mock.calls[2];

        expect(deletedFile1).toBe('backup_dir/FileA 2018-07-05T10_10_00.260Z.ext');
        expect(deletedFile2).toBe('backup_dir/FileA 2018-07-06T10_10_00.260Z.ext');
        expect(deletedFile3).toBe('backup_dir/FileA 2018-07-07T10_10_00.260Z.ext');
    });
});