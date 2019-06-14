onmessage = (e) => {
   console.log(e.data);
   e.data.testBuffer[2] = 100;
   postMessage({message: 'received!', testBuffer:e.data.testBuffer}, [e.data.testBuffer.buffer]);
};


sort_between = (row, comparison, filter) => {
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

adj_hue = (row, hue) => {
    const res = new Uint8ClampedArray(row.buffer);
    const n = res.length;
    for (let i = 0; i < n; i += 4) {
        res[i] += hue[0];
        res[i + 1] += hue[1];
        res[i + 2] += hue[2];
    }
    return new Uint32Array(res.buffer);
};
compare = (...args) => {
    const pix = new Uint8ClampedArray(new Uint32Array(args).buffer);
    // console.log(pix);
    const a = pix[0] + pix[1] + pix[2];
    const b = pix[4] + pix[5] + pix[6];
    if (this.state.isReverse) return a - b;
    return b - a;
};

filter = (thresh, ...pix) => {
    if (!this.state.isFilterEnabled) return true;
    pix = new Uint8ClampedArray(new Uint32Array(pix).buffer);
    //  console.log(pix, hue);
    return pix[0] >= thresh[0] && pix[1] >= thresh[1] && pix[2] >= thresh[2];
};