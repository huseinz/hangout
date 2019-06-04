class Image{
    constructor(img, img_w, img_h){
        this.pixels = [];
        this.imgdata = img.data;
        this.w = img_w;
        this.h = img_h;
        let i = 0;
        for( let y = 0; y < img_h; y++ ) {
            this.pixels.push([]);
            for( let x = 0; x < img_w; x++ ) {
                this.pixels[y].push(
                    new Uint8ClampedArray([
                    img.data[i],
                    img.data[i + 1],
                    img.data[i + 2],
                    img.data[i + 3]
                    ]));
                i += 4;
            }
        }
        this.getImageData = this.getImageData.bind(this);
        this.swapPixel = this.swapPixel.bind(this);
        this.getColumn = this.getColumn.bind(this);
        this.getRow = this.getRow.bind(this);
        this.setRow = this.setRow.bind(this);
    }

    swapPixel(x1, y1, x2, y2){
        const tmp = this.pixels[y1][x1];
        this.pixels[y1][x1] = this.pixels[y2][x2];
        this.pixels[y2][x1] = tmp;
        console.log("tmp:", tmp, "1:", this.pixels[y1][x1], "2:", this.pixels[y2][x2]);
    }

    getColumn(x){
        let rawpix = [];
        let buf = this.imgdata;
        for(let i = 0, k = x; i < this.h * 4, k < buf.length; i++, k += this.w * 4)
            rawpix.push(new Uint8ClampedArray([buf[k],buf[k+1], buf[k+2], buf[k+3]]));
        return rawpix;
    }

    getRow(y){
        return this.pixels[y];
    }

    setRow(arr, y){
        this.pixels[y] = arr;
    }

    getImageData(){
        let rawpix = new Uint8ClampedArray(this.w * this.h * 4);
        let i = 0;
        for(let y = 0; y < this.h; y++){
            for(let x = 0; x < this.w; x++){
                rawpix[i]= this.pixels[y][x][0];
                rawpix[i+1]= this.pixels[y][x][1];
                rawpix[i+2]= this.pixels[y][x][2];
                rawpix[i+3]= this.pixels[y][x][3];
                i += 4;
            }
        }
        return new ImageData(rawpix, this.w, this.h);
    }
}

module.exports.Image = Image;
