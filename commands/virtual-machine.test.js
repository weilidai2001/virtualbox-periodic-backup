import "babel-polyfill"
import {shutdownVM} from './virtual-machine';
import * as vmStatus from './vm-status';


test('shutdownVM() calls vmStatus()', () => {
    vmStatus.default = jest.fn();
    shutdownVM();

    expect(vmStatus.default.mock.calls.length).toBeGreaterThan(0);
});

test('shutdownVM() calls vmStatus() 10 times with timeout of 10 seconds', async () => {
    const vmName = '';
    const responses = [...Array(9).fill(true), false];
    vmStatus.default = jest.fn(() => responses.shift());
    await shutdownVM(vmName, 0.01, 10);

    expect(vmStatus.default.mock.calls.length).toBe(10);
});