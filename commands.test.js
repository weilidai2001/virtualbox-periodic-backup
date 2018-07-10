import "babel-polyfill"
import { shutdownVmWithTimeout, startVm, copyVm } from './commands';
import * as shell from './shell';
import * as util from './util';
import config from './config';
jest.mock('./config');

describe('shutdownVm()', () => {
    test('it calls softShutdown()', () => {
        shell.softShutdown = jest.fn();
        shutdownVmWithTimeout();

        expect(shell.softShutdown.mock.calls.length).toBe(1);
    });

    test('it calls isRunningVm()', () => {
        shell.isRunningVm = jest.fn();
        shutdownVmWithTimeout();

        expect(shell.isRunningVm.mock.calls.length).toBeGreaterThan(0);
    });

    test('it calls isRunningVm() 10 times with delay of 10 milliseconds', async () => {
        const vmName = '';
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 10;
        const responses = [...Array(9).fill(true), false];
        shell.isRunningVm = jest.fn(() => responses.shift());
        await shutdownVmWithTimeout(vmName, delayInSeconds, timeoutInSeconds);

        expect(shell.isRunningVm.mock.calls.length).toBe(10);
    });

    test('it calls isRunningVm() 5 times with before timing out', async () => {
        const vmName = '';
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 0.05;
        const responses = [...Array(9).fill(true), false];
        shell.isRunningVm = jest.fn(() => responses.shift());
        await shutdownVmWithTimeout(vmName, delayInSeconds, timeoutInSeconds);

        expect(shell.isRunningVm.mock.calls.length).toBe(5);
    });

    test('it calls forceShutdown() when timing out', async () => {
        const vmName = '';
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 0.05;
        const responses = [...Array(9).fill(true), false];
        shell.isRunningVm = jest.fn(() => responses.shift());
        shell.forceShutdown = jest.fn();

        await shutdownVmWithTimeout(vmName, delayInSeconds, timeoutInSeconds);

        expect(shell.forceShutdown.mock.calls.length).toBe(1);
    });

});

describe('startVm()', () => {
    test('it calls shell.startVm()', () => {
        shell.startVm = jest.fn();
        startVm();

        expect(shell.startVm.mock.calls.length).toBe(1);
    });
});

describe('copyVm()', () => {
    test('it calls shell.copyFile()', () => {
        shell.copyFile = jest.fn();
        copyVm();

        expect(shell.copyFile.mock.calls.length).toBe(1);
    });

    test('it calls shell.copyFile() with new file name from timestamp', () => {
        const vmFileName = 'abc';
        const mockDateTimestamp = '2018-07-10T10:10:00.260Z';
        const expectedNewFileName = vmFileName + ' ' + '2018-07-10T10_10_00.260Z';
        const srcDirectory = 'srcDir/dirA/';
        const destDirectory = 'destDir/dirB/';
        config.srcDirectory = srcDirectory;
        config.destDirectory = destDirectory;
        shell.copyFile = jest.fn();
        util.now = jest.fn(() => new Date(mockDateTimestamp));
        const newFilename = copyVm(vmFileName);

        expect(shell.copyFile.mock.calls.length).toBe(1);

        const [src, dest] = shell.copyFile.mock.calls[0];
        expect(newFilename).toBe(expectedNewFileName);
        expect(src).toBe(srcDirectory + vmFileName);
        expect(dest).toBe(destDirectory + expectedNewFileName);
    });
});