class Image {
  constructor(imgdata, w, h) {
    this.initFromRawBuffer(imgdata, w, h);
  }

  initFromRawBuffer = (rawbuf, w, h) => {
    let inBuf = rawbuf;
    this.w = w;
    this.h = h;

    this.pixels = new Array(this.h);
    for (let y = 0; y < this.h; y++) {
      this.pixels[y] = new Uint32Array(
          inBuf.slice(y * this.w * 4, y * this.w * 4 + this.w * 4).buffer
      );
    }
  };

  /*initFromBuffer = imgdata => {
    let inBuf = imgdata.data;
    this.w = imgdata.width;
    this.h = imgdata.height;

    this.pixels = new Array(this.h);
    for (let y = 0; y < this.h; y++) {
      this.pixels[y] = new Uint32Array(
        inBuf.slice(y * this.w * 4, y * this.w * 4 + this.w * 4).buffer
      );
    }
  };*/

  getColumn = x => {
    let col = new Uint32Array(this.h);
    for (let y = 0; y < this.h; y++) col[y] = this.pixels[y][x];
    return col;
  };
  setColumn = (col, x) => {
    for (let y = 0; y < this.h; y++) this.pixels[y][x] = col[y];
  };

  getImageData = () => {
    let rawpix = new Uint8ClampedArray(this.w * this.h * 4);
    for (let y = 0; y < this.h; y++) {
      try {
        rawpix.set(
          new Uint8ClampedArray(this.pixels[y].buffer),
          y * this.w * 4
        );
      } catch (e) {
        console.log(y);
      }
    }
    return new ImageData(rawpix, this.w, this.h);
  };
}

module.exports.Image = Image;
