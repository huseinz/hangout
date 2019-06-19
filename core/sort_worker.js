const img_utils = require("./Image");

this.queue = [];

onmessage = (e) => {

    this.state = e.data;
    this.totalCompares = 0;

    this.img = new img_utils.Image(this.state.rawimgdata, this.state.w, this.state.h);

    const starttime = new Date().getTime();
    this.do_sort();
    const totalTime = new Date().getTime() - starttime;

    postMessage({  message: 'success',
                            rawimgdata: this.img.getImageData().data,
                            totalCompares: this.totalCompares,
                            totalTime: totalTime
                         },
                [this.img.getImageData().data.buffer]);
};


this.do_sort = () => {
    if (this.state.isVertical) {
        for (let x = 0; x < this.state.w; x++) {
            let newcol = this.sort_between(
                this.img.getColumn(x),
                this.compare,
                this.filter
            );
            this.img.setColumn(newcol, x);
        }
    } else {
        for (let y = 0; y < this.state.h; y++) {
            this.sort_between(this.img.pixels[y], this.compare, this.filter);
        }
    }
}


this.sort_between = (row, comparison, filter) => {
    //let row = img.pixels[y];
    // img.pixels[y] = row.sort(comparison);
    const n = row.length;
    const s = this.state;
    const thresh = new Uint32Array([s.r_f_val, s.g_f_val, s.b_f_val]);
    const hue = new Uint32Array([s.r_val, s.g_val, s.b_val]);
    for (let i = 0; i < n; i++) {
        if (filter(thresh, row[i])) {
            const start = i;
            let end = i;
            for (; i < n; i++) {
                if (filter(thresh, row[i])) end = i;
                else if (this.state.isContiguous) break;
            }
            const rowbeg = row.slice(0, start);
            let rowsort = row.slice(start, end).sort(comparison);
            if (this.state.isHue) rowsort = this.adj_hue(rowsort, hue);
            const rowend = row.slice(end);
            row.set(rowbeg, 0);
            row.set(rowsort, start);
            row.set(rowend, end);
            i = end;
        }
    }
    return row;
};

this.adj_hue = (row, hue) => {
    const res = new Uint8ClampedArray(row.buffer);
    const n = res.length;
    for (let i = 0; i < n; i += 4) {
        res[i] += hue[0];
        res[i + 1] += hue[1];
        res[i + 2] += hue[2];
    }
    return new Uint32Array(res.buffer);
};

this.compare = (...args) => {
    const pix = new Uint8ClampedArray(new Uint32Array(args).buffer);
    const a = pix[0] + pix[1] + pix[2];
    const b = pix[4] + pix[5] + pix[6];
    this.totalCompares++;
    if (this.state.isReverse) return a - b;
    return b - a;
};

this.filter = (thresh, ...pix) => {
    if (!this.state.isFilterEnabled) return true;
    pix = new Uint8ClampedArray(new Uint32Array(pix).buffer);
    //  console.log(pix, hue);
    return pix[0] >= thresh[0] && pix[1] >= thresh[1] && pix[2] >= thresh[2];
};