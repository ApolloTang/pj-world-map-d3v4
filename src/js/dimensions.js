
const svg = {
    w: '100%',
    h: '100%'
};

const viewBox = {
    maxW: 3000,
    maxH: 1800
};

const margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
};

const padding = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
};

const stageWrap = {
    w: viewBox.maxW - margin.left - margin.right,
    h: viewBox.maxH - margin.top - margin.bottom,
}

const stage = {
    w: stageWrap.w - padding.left - padding.right,
    h: stageWrap.h - padding.top - padding.right,
}

// const _conf = {
//     margin = margin,
//     padding = padding,
//     w_svg = 3000,
//     h_svg = 1000,
//
//     w_wrap = this._conf.w_svg - margin.left - margin.right
//     h_wrap = this._conf.h_svg - margin.top - margin.bottom,
//     width =  this._conf.w_wrap - padding.left - padding.right,
//     height = this._conf.h_wrap - padding.top - padding.bottom,
// };

export default {
    svg,
    viewBox,
    margin,
    padding,
    stageWrap,
    stage
};
