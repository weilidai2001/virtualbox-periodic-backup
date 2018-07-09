import "babel-polyfill"
import {shutdownVM} from './virtual-machine';
import * as vmStatus from './vm-status';

describe('shutdownVM()', () => {
    test('it calls vmStatus()', () => {
        vmStatus.default = jest.fn();
        shutdownVM();

        expect(vmStatus.default.mock.calls.length).toBeGreaterThan(0);
    });

    test('it calls vmStatus() 10 times with delay of 10 milliseconds', async () => {
        const vmName = '';
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 10;
        const responses = [...Array(9).fill(true), false];
        vmStatus.default = jest.fn(() => responses.shift());
        await shutdownVM(vmName, delayInSeconds, timeoutInSeconds);

        expect(vmStatus.default.mock.calls.length).toBe(10);
    });

    test('it calls vmStatus() 5 times with before timing out', async () => {
        const vmName = '';
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 0.05;
        const responses = [...Array(9).fill(true), false];
        vmStatus.default = jest.fn(() => responses.shift());
        await shutdownVM(vmName, delayInSeconds, timeoutInSeconds);

        expect(vmStatus.default.mock.calls.length).toBe(5);
    });
});
