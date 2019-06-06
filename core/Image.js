class Image{
    constructor(imgdata){
        this.initFromBuffer(imgdata);
        /*
        this.pixels = new Array(img_h);
        this.w = img_w;
        this.h = img_h;
        let i = 0;
        let imgd = img.data;
        for( let y = 0; y < img_h; y++ ) {
            this.pixels[y] = Array.from(Array(img_w), () => new Uint8ClampedArray(4));
            for( let x = 0; x < img_w; x++ ) {
                this.pixels[y][x].set([imgd[i],imgd[i+1],imgd[i+2],imgd[i+3]]);
                i += 4;
            }
        }*/
    }

    initFromBuffer = (imgdata) => {
        let inBuf = imgdata.data;
        this.w = imgdata.width;
        this.h = imgdata.height;

        this.pixels = new Array(this.h);
        for(let y = 0; y < this.h; y++){
            this.pixels[y] = new Uint32Array(inBuf.slice(y * this.w * 4, y * this.w * 4 + this.w * 4).buffer);
        }
    }

    swapPixel = (x1, y1, x2, y2) => {
        const tmp = this.pixels[y1][x1];
        this.pixels[y1][x1] = this.pixels[y2][x2];
        this.pixels[y2][x1] = tmp;
        console.log("tmp:", tmp, "1:", this.pixels[y1][x1], "2:", this.pixels[y2][x2]);
    }

    getColumn = (x) =>{
        let col = new Uint32Array(this.h);
        for(let y = 0; y < this.h; y++)
            col[y] = this.pixels[y][x];
        return col;
    }
    setColumn = (col, x) =>{
        for(let y = 0; y < this.h; y++)
            this.pixels[y][x] = col[y];
    }

    getRow = (y) =>{
        return this.pixels[y];
    }

    setRow = (arr, y) =>{
        this.pixels[y] = arr; //perhaps copy instead
    }

    getImageData = () =>{
        let rawpix = new Uint8ClampedArray(this.w * this.h * 4);
        for(let y = 0; y < this.h; y++){
            try {
                rawpix.set(new Uint8ClampedArray(this.pixels[y].buffer), y * this.w * 4);
            }
            catch (e){
                console.log(y);
            }
        }
        return new ImageData(rawpix, this.w, this.h);
    }
}

module.exports.Image = Image;
