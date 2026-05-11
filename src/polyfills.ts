(window as any).global = window;

import * as process from 'process';
(window as any).process = process;

import { Buffer } from 'buffer';
(window as any).global = window;
(window as any).Buffer = Buffer;