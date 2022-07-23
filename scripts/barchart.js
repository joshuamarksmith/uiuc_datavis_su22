async function init() {
    const margin = { top: 30, bottom: 30, right: 30, left: 30 },
        width = 900 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom - 50; // subtract 50 to account for slanted labels

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.15);
    const y = d3.scaleLinear()
        .range([height, 0]);

    const svg = d3.select("svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    let tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("opacity", 0)
        .text("placeholder");
                
    // import data and create chart    
    let data = await d3.csv("100_hotels.csv")
        .then(function(data) {

            var regionCount = {};

            // count occurrence of each region
            data.forEach((d) => {
                var region = d.Region;
                
                if (regionCount[region] === undefined) {
                    regionCount[region] = 1;
                }
                else {
                    regionCount[region] = regionCount[region] + 1;
                }
            });
            data.forEach((d) => {
                var region = d.Region;
                d.count = regionCount[region];
                // console.log(`region: ${region}: count of ${d.count}`);
            })
                
            // set domains based on data
            x.domain(data.map(function(d) { return d.Region; }));
            y.domain([0, d3.max(data, function(d) { return d.count; })]);

            // bar chart
            svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d) { return x(d.Region); })
                    .attr("width", x.bandwidth())
                    .attr("y", function(d) { return y(0); })
                    .attr("height", function(d) { return height - y(0); })
                    .on("mouseover", function(d, i) { 
                        tooltip.transition().duration(200)
                            .style('opacity', 0.9)
                            tooltip.text(`The region ${d.Region} has ${d.count} award-winning hotels.`);
                    })
                    .on("mousemove", function(){
                        return tooltip
                            .style("top", (d3.event.pageY-10)+"px")
                            .style("left",(d3.event.pageX+10)+"px");
                    })
                    .on("mouseout", function(d) {
                        tooltip.transition().duration(400)
                            .style('opacity', 0);
                    });
            
            // animation
            svg.selectAll("rect")    
                .transition()
                .duration(1200)
                .attr("y", function(d) { return y(d.count); })
                .attr("height", function(d) { return height - y(d.count); })
                .delay(function(d,i){ return(i*20) });
            
            // axes
            svg.append("g")
                .attr("class", "axis")  
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                    .attr("transform", "translate(-10,0)rotate(-45)")
                    .style("text-anchor", "end");
        
            svg.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y));

            let annotation_def = [{
                    anno: {
                        label: "Southeast Asia contains the most award-winning hotels.",
                        title: regionCount["Southeast Asia"],
                        align: "left"
                    },
                    x: 112.5,
                    y: 0,
                    dy: 100,
                    dx: 100,
                    subject: { radius: 50, radiusPadding: 10 },
                }];
            let annotate = d3.annotate()
                .type(d3.annotationLabel)
                .annotations(annotation_def)
                setTimeout(function() {
                    d3.select("svg")
                        .append("g")
                        .attr("transform", "translate(50,50)")
                        .attr("class", "annotation-group")
                        .call(annotate)
                }, 1000);

        }) .catch(error => console.error(error));



}