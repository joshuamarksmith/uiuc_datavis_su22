// global dictionary to store radii of scatter circles, needed to remember after hiding them
radii = {};

async function init() {
    const margin = { top: 30, bottom: 30, right: 30, left: 40 },
        width = 900 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    let x = d3.scaleLinear().range([0, width])

    let y = d3.scaleLinear().range([height-40, 0]); // leave room for label

    const svg = d3.select("svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    const colors = {
        "Coastal": "#537c78",
        "Contemporary ": "#7ba591",
        "Island":"#cc222b", 
        "Nature": "#f15b4c",
        "Palace": "#faa41b", 
        "Safari": "#ffd45b"
    };

    // hover tooltip
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

            // circles for scatter
            let circles = svg.selectAll('circle')
                .data(data)
                .enter()
                .append('circle')
                //.attr("class", "cir")
                .attr('stroke','black')
                .attr('stroke-width',1)
                .attr('fill', function (d) { return colors[d.Theme] })
                .attr('cy',function (d) { return y(d.Score) }) // start points already y-aligned    
                .on("mouseover", function(d, i) { 
                    tooltip.transition().duration(200)
                        .style('opacity', 0.9)
                        tooltip.text(`${d.Hotel} is a ${d.Theme} hotel built in ${d.Year}, in ${d.Country}, with ${d.Rooms} rooms.`);
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
            svg.selectAll("circle")    
                .transition()
                .duration(500)
                .attr("class" , function(d) { return d.Theme })
                .attr('cx', function (d) { return x(d.Year) })
                .attr('cy',function (d) { return y(d.Score) })
                .attr('r', function (d,i) { radii[d.Hotel] = (d.Rooms / 11); return (d.Rooms / 11) })
                .attr('opacity', '90%')
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

    // monitor and initialize checkboxes
    d3.selectAll(".checkbox")
        .on("change", update);
    update();
    
    // helpful annotation
    const annotations = [{
        note: {
            label: "Try unchecking the \'Coastal\' box.",
            wrap: 1200
        },
        x: 205,
        y: -25,
        dy: 40,
        dx: 60,
        connector: {
            end: "arrow"
        }
    }];

    const makeAnnotations = d3.annotation()
        .annotations(annotations)
    svg.append("g")
        .attr("class", "help-annotation")
        .call(makeAnnotations)
}

/*
 * Add and remove circles with checkboxes
 */
function update() {
    const svg = d3.select("svg");
    
    // remove the unwanted circles
    d3.selectAll(".checkbox")
        .each(function(d) {
            cb = d3.select(this);
            theme = cb.property("value");

            if(cb.property("checked")) {
                console.log(`${theme} is selected...`);
                svg.selectAll("." + theme)
                    .transition()
                    .duration(1000)
                    .style("opacity", 1)
                    .attr("r", function(d){ console.log(`${d.Theme}`); return radii[d.Hotel] });
            }
            else {
                svg.selectAll("." + theme)
                    .transition()
                    .duration(1000)
                    .style("opacity", 0)
                    .attr("r", 0);
            }
    })

    // help no longer needed to find checkboxes
    svg.selectAll(".help-annotation").remove();
}



