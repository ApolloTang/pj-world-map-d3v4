import d3 from 'd3';
import dimensions from './dimensions';

export default class WorldMap {
    getSelections(node_container) {
        const __d = this.__d;

        const container = d3.select(node_container);

        const svg = container.append('svg')
            .attr('width', __d.svg.w).attr('height', __d.h)
            .attr('viewBox', '0 0 ' + __d.viewBox.maxW + ' ' + __d.viewBox.maxH);

        const stageWrap = svg
            .append('g').classed('stageWrap', true)
            .attr('transform', 'translate(' + this.__d.margin.left + ',' + this.__d.margin.top + ')');

        const stageWrapBg = stageWrap.append('rect')
            .attr('class', 'wrap-background')
            .attr('width', __d.stageWrap.w)
            .attr('height', __d.stageWrap.h)
            .attr('fill', '#dddddd');

        const stage = stageWrap.append('g')
            .classed('stage', true)
            .attr('transform', 'translate(' + __d.padding.left + ',' + __d.padding.top + ')');

        const stageBg = stage.append('rect')
            .attr('class', 'stageBg')
            .attr('width', __d.stage.w)
            .attr('height', __d.stage.h)
            .attr('fill', 'transparent');

        const featureColl = stage.append('g')
            .classed('featureCollection', true);

        const toolTip = container.append('div').classed('map-tool-tip', true).text('tool tip');

        return {
            container,
            svg,
            featureColl,
            stageWrap,
            stageWrapBg,
            stage,
            stageBg,
            featureColl,
            toolTip
        }
    }

    constructor(node_container) {
        window.w = this;

        //configuration
        this.__d = dimensions;

        //d3 selection
        this.__s = this.getSelections(node_container);

        const __s = this.__s;
        const __d = this.__d;

        // __s.stage.call( // must bind zoom to the svg ( like bellow) not to the group (above), see: // http://bl.ocks.org/cpdean/7a71e687dd5a80f6fd57
        __s.svg.call(
            d3.behavior.zoom()
            .translate([0, 0])
            .scale(1)
            .scaleExtent([1, 14])
            .on('zoom', ()=>{ __s.stage.attr('transform', 'translate('+d3.event.translate+')scale('+d3.event.scale+')'); })
        );

        const n_toolTip = __s.toolTip.node();
        n_toolTip.style.position = 'absolute';

        // __s.svg.node().addEventListener('mousemove',function(evt){
        //     const coord_client = {
        //         x:evt.clientX,
        //         y:evt.clientY,
        //     }
        //     n_toolTip.style.left = `${coord_client.x}px`;
        //     n_toolTip.style.top = `${coord_client.y}px`;
        // }, false);


        // __s.stage.on('mousemove', function(e){
        //     var svgP = d3.mouse(this);
        //     var svgX = svgP[0];
        //     var svgY = svgP[1];
        //     const coord_client = getClientCoordinate({x:svgX, y:svgY});
        //     n_toolTip.style.left = `${coord_client.x}px`;
        //     n_toolTip.style.top = `${coord_client.y}px`;
        // });


        function getClientCoordinate(coord_svg) {
            var svgNode = __s.svg.node();
            var targetArea = __s.featureColl.node();
            var m = targetArea.getScreenCTM();
            var svgP = svgNode.createSVGPoint();
            svgP.x = coord_svg.x;
            svgP.y = coord_svg.y;
            var coord_client = svgP.matrixTransform(m);
            var clientX = coord_client.x;
            var clientY = coord_client.y;
            return { 'x': clientX, 'y': clientY};
        }

        // const onMouseEnter = function() {
        //     console.log('mouse Enter')
        // }
        //
        // const onMouseLeave = function() {
        //     console.log('mouse Leave')
        // }
        // featureColl.on('mouseenter', onMouseEnter);
        // featureColl.on('mouseleave', onMouseLeave);

        const translation_h = __d.stage.w/2;
        const translation_v = __d.stage.h/2 * 1.1;
        const projection = d3.geo.mercator().scale(480).translate([translation_h,translation_v]);
        const geoPath = d3.geo.path().projection(projection);

        let myInterval = void 0;
        d3.json("/data/world.geojson", createMap);
        function createMap(countries) {
            __s.featureColl.selectAll("path").data(countries.features)
                .enter()
                .append("path")
                .attr("d", geoPath)
                .attr("class", "countries")
                .each(function(item, i){ console.log(i, item.id, item.properties.name) })
                .on('mouseover', function(item, i){
                    console.log(i, item.id, item.properties.name)
                    console.log(n_toolTip)
                    n_toolTip.innerHTML =item.properties.name ;
                })
                .on('mouseenter', function(item, i){
                    console.log('enter', i, item.id, item.properties.name)
                    const that = this;
                    d3.select(that).on('mousemove', function(e){
                        var svgP = d3.mouse(this);
                        var svgX = svgP[0];
                        var svgY = svgP[1];
                        const coord_client = getClientCoordinate({x:svgX, y:svgY});
                        n_toolTip.style.display = `block`;
                        n_toolTip.style.left = `${coord_client.x}px`;
                        n_toolTip.style.top = `${coord_client.y}px`;
                    });
                })
                .on('mouseleave', function(item, i){
                    n_toolTip.style.display = `none`;
                    const that = this;
                    d3.select(that).on('mousemove', null);
                })
        }
    }
}

