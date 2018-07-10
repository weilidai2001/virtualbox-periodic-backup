import "babel-polyfill"

import {isRunningVm} from "./shell";
import config from "./config";
import * as exec from './exec';

describe('isRunningVm()', () => {
    test('it returns true if vm is found running', async () => {
        const fakeStdout = '"IE9-Win7" {57922938-0b51-4e02-9c27-f831e3e80b51}\n' +
            '"IE11 - Win7" {b4729f8b-47a5-4e02-a210-f5b5e171c4bc}\n';

        jest.mock('./exec');
        exec.default = jest.fn(() => Promise.resolve({stdout: fakeStdout}));
        const isRunning = await isRunningVm('IE9-Win7');
        expect(isRunning).toBe(true);

    });

    test('it returns false if vm is found not running', async () => {
        const fakeStdout = '"IE9-Win7" {57922938-0b51-4e02-9c27-f831e3e80b51}\n' +
            '"IE11 - Win7" {b4729f8b-47a5-4e02-a210-f5b5e171c4bc}\n';

        jest.mock('./exec');
        exec.default = jest.fn(() => Promise.resolve({stdout: fakeStdout}));
        const isRunning = await isRunningVm('NOT_EXIST');
        expect(isRunning).toBe(false);
    });
});