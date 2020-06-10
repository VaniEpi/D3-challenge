
var csvData;

var test = d3.select('#scatter');

d3.csv('./assets/data/data.csv').then(data => {
    csvData = data;

    var width = parseInt(d3.select('#scatter').style('width'));
    var height = width - width/3.9;
    var margin = 20;
    var labelArea = 110;
    var pad = 40;
    var curX = 'poverty';
    var curY = 'obesity';
    var xMin;
    var xMax;
    var yMin;
    var yMax;
    var circRadius;

    var svg = d3.select('#scatter').append('svg');

    svg
        .style('background','white')
        .style('width',width)
        .style('height',height)
        .attr('class','chart')

    svg.append('g').attr('class','xText');
    svg.append('g').attr('class','yText');
    

    var xText = d3.select('.xText');
    var yText = d3.select('.yText');

    xText
        .append('text')
        .text('In Poverty (%)')
        .attr('y',-26)
        .attr('data-name','poverty')
        .attr('data-axis','x')
        .attr('class','aText active x')
        .attr('transform', `translate(${((width - labelArea) / 2 + labelArea)}, ${(height - margin - pad)})`)

    xText
        .append('text')
        .text('Age (Median)')
        .attr('y',0)
        .attr('data-name','age')
        .attr('data-axis','x')
        .attr('class','aText inactive x')
        .attr('transform', `translate(${((width - labelArea) / 2 + labelArea)}, ${(height - margin - pad)})`)

    xText
        .append('text')
        .text('Household Income (Median)')
        .attr('y',26)
        .attr('data-name','income')
        .attr('data-axis','x')
        .attr('class','aText inactive x')
        .attr('transform', `translate(${((width - labelArea) / 2 + labelArea)}, ${(height - margin - pad)})`)

    yText
        .append('text')
        .text('Obese (%)')
        .attr('y',-26)
        .attr('data-name','obesity')
        .attr('data-axis','y')
        .attr('class','aText inactive y')
        .attr('transform', `translate(${margin + pad}, ${(height + labelArea)/2 - labelArea})rotate(-90)`)

    yText
        .append('text')
        .text('Smokes (%)')
        .attr('y',0)
        .attr('data-name','smokes')
        .attr('data-axis','y')
        .attr('class','aText inactive y')
        .attr('transform', `translate(${margin + pad}, ${(height + labelArea)/2 - labelArea})rotate(-90)`)

    yText
        .append('text')
        .text('Lacks Healthcare (%)')
        .attr('y',26)
        .attr('data-name','healthcare')
        .attr('data-axis','y')
        .attr('class','aText active y')
        .attr('transform', `translate(${margin + pad}, ${(height + labelArea)/2 - labelArea})rotate(-90)`)

    function xMinMax() {
        // define min value, which is 1/10 less than min value to create line with buffer
        xMin = d3.min(data, d => parseFloat(d[curX]) * 0.9);
        xMax = d3.max(data, d => parseFloat(d[curX]) * 1.1);
    };

    xMinMax();

    var xScale = d3
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin]);
 
    function yMinMax() {
        // define min value, which is 1/10 less than min value to create line with buffer
        yMin = d3.min(data, d => parseFloat(d[curY]) * 0.9);
        yMax = d3.max(data, d => parseFloat(d[curY]) * 1.1);
    };

    yMinMax();

    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    function tickCount() {
        
        if (width <= 500) {
            xAxis.ticks(5);
            yAxis.ticks(5);     
        } else {
            xAxis.ticks(10);
            yAxis.ticks(10);
        }
    };
    tickCount();

    svg
        .append('g')
        .call(xAxis)
        .attr('class','xAxis')
        .attr('transform', `translate(0,${(height - margin - labelArea)})`);
    
    svg
        .append('g')
        .call(yAxis)
        .attr('class','yAxis')
        .attr('transform',`translate(${(margin + labelArea)},0)`);

    var toolTip = d3
        .tip()
        .attr('class', 'd3-tip')
        .html(d => {
            var theX;
            var theState = `<div>${d.state}</div>`;
            var theY = `<div>${curY}: ${d[curY]}%</div>`;
            if(curX === 'poverty') {
                theX = `<div>${curX}: ${d[curX]}%</div>`
            } else {
                theX = `<div>${curX}: ${parseFloat(d[curX])}</div>`;
                // theX = `<div>${curX}: ${parseFloat(d[curX]).toLocateString('en')}</div>`;
            }
            return theState + theX + theY;
        });
    svg.call(toolTip);
 
    var theCircles = svg.selectAll('g theCircles').data(data).enter();
   
   
    function crGet() {
        if (width <= 530) {
            circRadius = 7;
        } else {
            circRadius = 14;
        };
    };

    crGet();
    
    theCircles
        .append('circle')
        .attr('cx', d => xScale(d[curX]))
        .attr('cy', d => yScale(d[curY]))
        .attr('r', circRadius)
        .attr('class', d => `stateCircle ${d.abbr}`)
        .on('mouseover', function (d) {
            toolTip.show(d, this);
            d3.select(this).style('stroke', '#323232');
        })
        .on('mouseout', d => {
            toolTip.hide(d);
            // d3.select(this).style('stroke','#e3e3e3')
        });
    
    theCircles
        .append('text')
        .text(d => d.abbr)
        .attr('dx', d => xScale(d[curX]))
        .attr('dy', d => yScale(d[curY]) + circRadius / 2.5)
        .attr('font-size', circRadius)
        .attr('class', 'stateText')
        .on('mouseover', d => {
            toolTip.show(d);
            d3.select(`.${d.abbr}`).style('stroke', '#323232');
        })
        .on('mouseout', d => {
            toolTip.hide(d);
            d3.select(`.${d.abbr}`).style('stroke', '#e3e3e3');
        });
    
    d3.selectAll('.aText').on('click', handleClick);

    function handleClick() {
        var self = d3.select(this);

        if (self.classed('inactive')) {
            var axis = self.attr('data-axis');
            var name = self.attr('data-name');

            if (axis === 'x') {
                curX = name;
                xMinMax();
                xScale.domain([xMin,xMax])
                svg.select('.xAxis').transition().duration(300).call(xAxis);
                d3.selectAll('circle').each(function () {
                    d3
                        .select(this)
                        .transition()
                        .attr('cx', function (d) {
                            return xScale(d[curX]);
                        })
                        .duration(300);
                });

                d3.selectAll('.stateText').each(function () {
                    d3
                        .select(this)
                        .transition()
                        .attr('dx', function (d) {
                            return xScale(d[curX]);
                        })
                        .duration(300);
                });
                labelChange(axis, self);
            }
            else {
                curY = name;
                yMinMax();
                yScale.domain([yMin,yMax]);
                svg.select('.yAxis').transition().duration(300).call(yAxis);
                d3.selectAll('circle').each(function () {
                    d3  
                        .select(this)
                        .transition()
                        .attr('cy', function (d) {
                            return yScale(d[curY]);
                        })
                        .duration(300);
                });

                d3.selectAll('.stateText').each(function () {
                    d3
                        .select(this)
                        .transition()
                        .attr('dy', function (d) {
                            return yScale(d[curY]) + circRadius / 3;
                        })
                        .duration(300);
                });

                labelChange(axis, self);
            }
        }
    }

    function labelChange(axis, clickedText) {
        d3
            .selectAll('.aText')
            .filter(`.${axis}`)
            .filter('.active')
            .classed('active',false)
            .classed('inactive',true)

        clickedText.classed('inactive',false).classed('active',true);
    }

});