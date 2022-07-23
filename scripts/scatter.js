async function init() {
    const margin = { top: 30, bottom: 30, right: 30, left: 40 },
        width = 900 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    let x = d3.scaleLinear().range([0, width])

    let y = d3.scaleLinear().range([height-40, 0]); // leave room for label

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

            // set domains based on data
            x.domain(d3.extent(data, function(d) { return d.Year }));
            y.domain(d3.extent(data, function(d) { return d.Score }));

            let circles = svg.selectAll('circle')
                .data(data)
                .enter()
                .append('circle')
                .attr("class", "cir")
                .attr('stroke','black')
                .attr('stroke-width',1)
                .on("mouseover", function(d, i) { 
                    tooltip.transition().duration(200)
                        .style('opacity', 0.9)
                        tooltip.text(`${d.Hotel}, built in ${d.Year} in ${d.Country} with ${d.Rooms} rooms and a ${d.Score} rating.`);
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
                // attr('fill',function (d,i) { return colorScale(i) })
                
            // animation
            svg.selectAll("circle")    
                .transition()
                .duration(600)
                .attr('cx', function (d) { console.log(`${d.Hotel}, ${d.Year}`); return x(d.Year) })
                .attr('cy',function (d) { return y(d.Score) })
                .attr('r', function (d) { return (d.Rooms / 15) })
                .delay(function(d,i){ return(i*15) });
            
            // axes
            svg.append("g")
                .attr("class", "axis")  
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x)
                    .tickFormat(d3.format("d")))
                
            svg.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y))
            
            // labels
/*             svg.append("text")
                .attr("class", "x-label")
                .attr("text-anchor", "end")
                .attr("x", (width / 2 + 60))
                .attr("y", height + 50)
                .text("Year of construction"); */

            svg.append("text")
                .attr("class", "x-label")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height - 6)
                .text("Year of construction");
            
            svg.append("text")
                .attr("class", "y-label")
                .attr("text-anchor", "end")
                .attr("y", 6)
                .attr("dy", ".75em")
                .attr("transform", "rotate(-90)")
                .text("Score (0-100 Scale)");


        }) .catch(error => console.error(error));

}