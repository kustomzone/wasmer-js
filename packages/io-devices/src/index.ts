import { WasmFs } from "../../wasmfs/src/index";

// Define our file paths
const FRAME_BUFFER = "/dev/wasmerfb0";
const WINDOW_SIZE = "/sys/class/graphics/wasmerfb0/virtual_size";
const BUFFER_INDEX_DISPLAY =
  "/sys/class/graphics/wasmerfb0/buffer_index_display";
const INPUT = "/dev/input";

export default class IoDevicesDefault {
  wasmFs: WasmFs;
  fdFrameBuffer: number;
  fdWindowSize: number;
  fdBufferIndexDisplay: number;
  fdInput: number;
  windowSizeCallback: Function;
  bufferIndexDisplayCallback: Function;

  constructor(wasmFs: WasmFs) {
    this.wasmFs = wasmFs;

    // Add our files to the wasmFs
    const wasmFsJSON = this.wasmFs.toJSON();
    wasmFsJSON[FRAME_BUFFER] = "";
    wasmFsJSON[WINDOW_SIZE] = "";
    wasmFsJSON[BUFFER_INDEX_DISPLAY] = "";
    wasmFsJSON[INPUT] = "";
    this.wasmFs.fromJSON(wasmFsJSON);

    // TODO: Check why this isn't being called?
    this.windowSizeCallback = () => {};
    this.bufferIndexDisplayCallback = () => {};

    // Open our directories and get their file descriptors
    this.fdFrameBuffer = this.wasmFs.volume.openSync(FRAME_BUFFER, "w+");
    this.fdWindowSize = this.wasmFs.volume.openSync(WINDOW_SIZE, "w+");
    this.fdBufferIndexDisplay = this.wasmFs.volume.openSync(
      BUFFER_INDEX_DISPLAY,
      "w+"
    );
    this.fdInput = this.wasmFs.volume.openSync(INPUT, "w+");

    // Set up our read / write handlers
    const context = this;
    const originalInputRead = this.wasmFs.volume.fds[this.fdInput].node.read;
    // @ts-ignore
    this.wasmFs.volume.fds[this.fdInput].node.read = function() {
      // @ts-ignore
      const args = Array.prototype.slice.call(arguments);
      const response = originalInputRead.apply(
        context.wasmFs.volume.fds[context.fdInput].node,
        args as any
      );
      context._clearInput();
      return response;
    };
    const originalWindowSizeWrite = this.wasmFs.volume.fds[this.fdWindowSize]
      .node.write;
    // @ts-ignore
    this.wasmFs.volume.fds[this.fdWindowSize].node.write = function() {
      // @ts-ignore
      const args = Array.prototype.slice.call(arguments);
      const response = originalWindowSizeWrite.apply(
        context.wasmFs.volume.fds[context.fdInput].node,
        args as any
      );
      context.windowSizeCallback();
      return response;
    };
    const originalBufferIndexDisplayWrite = this.wasmFs.volume.fds[
      this.fdBufferIndexDisplay
    ].node.write;
    // @ts-ignore
    this.wasmFs.volume.fds[this.fdBufferIndexDisplay].node.write = function() {
      // @ts-ignore
      const args = Array.prototype.slice.call(arguments);
      const response = originalBufferIndexDisplayWrite.apply(
        context.wasmFs.volume.fds[context.fdInput].node,
        args as any
      );
      context.bufferIndexDisplayCallback();
      return response;
    };
  }

  getFrameBuffer(): Uint8Array {
    const buffer = this.wasmFs.fs.readFileSync(FRAME_BUFFER);
    return new Uint8Array();
  }

  getWindowSize(): Array<number> {
    const windowSizeBuffer = this.wasmFs.fs.readFileSync(WINDOW_SIZE);
    const windowSize = new TextDecoder("utf-8").decode(windowSizeBuffer as any);
    const splitWindowSize = windowSize.split("x");
    return [parseInt(splitWindowSize[0], 10), parseInt(splitWindowSize[1], 10)];
  }

  setWindowSizeCallback(windowSizeCallback: Function): void {
    this.windowSizeCallback = windowSizeCallback;
  }

  setBufferIndexDisplayCallback(bufferIndexDisplayCallback: Function): void {
    this.bufferIndexDisplayCallback = bufferIndexDisplayCallback;
  }

  setInput(): void {}

  _clearInput(): void {}
}

export const IoDevices = IoDevicesDefault;
export type IoDevices = IoDevicesDefault;
