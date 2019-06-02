import React from 'react';

class PixelSorter extends React.Component{

    constructor(props){
        super(props)
        this.props.set_title('PixelSorter');
    }

    componentDidMount() {
        const canvas = this.refs.canvas;
        canvas.style.width ='100%';
        canvas.style.height='100%';
        const ctx = canvas.getContext("2d");
        const img = this.refs.image;
        let chunk = function (arr, chunkSize) {
            var R = [];
            for (var i=0,len=arr.length; i<len; i+=chunkSize)
                R.push(arr.slice(i,i+chunkSize));
            return R;
        };
        img.onload = () => {
            ctx.drawImage(img, 0, 0, img.width, img.height,
                                    0, 0, canvas.width, canvas.height);
            let imgdata = ctx.getImageData(0,0,canvas.width, canvas.height);
            let data = imgdata.data;
             = chunk(data, 3).sort(function(a, b){return a[0] - b[0]});
            ctx.putImageData(imgdata, 0,0);
        }
    }
    render() {
        return(
            <div>
                <canvas ref="canvas" width={640} height={425} />
                <img ref="image" src={this.props.defaultimg} style={{display: "none"}} />
            </div>
        )
    }
}

export default PixelSorter;