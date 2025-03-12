
let rad = 3;
let chartWidth = document.getElementById('chart').clientWidth;
let chartHeight = document.getElementById('chart').clientHeight;

const margin = {
    top: 15,
    bottom: 40,
    left: 30,
    right: 0 
}

function createScatterPlot( data , xScale, yScale) {

    let sectors = _.uniq(data.map(d => d['Class'])); //Get Unique
    let color = d3.scaleOrdinal().domain(sectors).range(["#AEDA50", "#6395DF", "#005AC5", "#489000"]);

    // Set up Canvas
    let container = d3.selectAll("#container");
    let body = container.append("g")
        .style("transform", `translate(${margin.left}px,${margin.top}px)`);

    let locs = _.uniq(data.map((d) => d.loc)); //Get Unique
    
    // X Grid (Vertical)
    let yticks = yScale.ticks()

    // Y Grid (Horizontal)
    body.append("g").attr("class", "ygrid").selectAll("line")
        .data(yticks).enter()
        .append("line")
        .attr("class", "horizontalGrid")
        .attr("x1", 0)
        .attr("x2", chartWidth - margin.left - margin.right - margin.left)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .attr("stroke", "#333")
        .attr("stroke-width", "0.5px");
    
    //----y Linear Scale
    let yAxis = d3.axisLeft(yScale);
    container.append("g")
        .attr("class", "yaxis")
        .attr("id", "y")
        .style("transform", `translate(${margin.left}px , ${margin.top}px )`)
        .style("font-size", "12px")
        .call(yAxis)
        .selectAll("text")
        .attr("dx", "-5px");

    // Axis
    //----x Categorical Scale
    let xAxis = d3.axisBottom(xScale);

    container.append("g")
        .attr("class", "xaxis")
        .attr("id", "x")
        .style("transform", `translate( -${margin.left}px ,${chartHeight-margin.bottom}px)`)
        .style("font-size", "11px")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-90)" )
        .attr("dx", "-.8em")
        .attr("dy", "0.75rem" )
        .attr("y", 0);

    // Initialize positions
    data.forEach(d => {
        d.x = xScale(d.loc);
        d.y = yScale(d.level);
    });

    // Scatter Plot 
    let join = body.append("g").attr("class","dots").selectAll("circle")
        .data(data).enter()
        .append("circle")
        .attr("class", "circ")
        .attr("id",d => d['ind'])
        .attr("cx", d => xScale(d['loc']))
        .attr("cy", d => yScale(d['level']))
        .attr("r", rad)
        .attr("stroke", "black")
        .attr("stroke-width", "0.25px")
        .attr("fill", (d) => color(d['Class']));
    
    // --------  Collusion Detection
    function tick() {
        d3.selectAll(".circ")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    };

    // Stop any existing simulation
    if (window.simulation) {
        console.log("Stopping existing simulation");
        window.simulation.stop();
    }

    window.simulation = d3.forceSimulation(data)
        .force("x", d3.forceX(d => xScale(d.loc)).strength(0.05))
        .force("y", d3.forceY(d => yScale(d.level)).strength(1.25))
        .force("collide", d3.forceCollide().strength(0.5).radius(rad+0.5).iterations(1))
        // .alphaDecay(0.05)
        .on("tick", tick);

        // Start decay after 3 seconds
    setTimeout(() => {
        window.simulation.alphaDecay(0.02);
    }, 4000);
    

}

function resizeSVG(arts) {
    chartWidth = document.getElementById('chart').clientWidth;
    chartHeight = document.getElementById('chart').clientHeight;

    d3.select("#container").selectAll("*").remove();

    let { xScale, yScale } = calculateScales(arts);
    initializePositions(arts, xScale, yScale);
    createScatterPlot(arts, xScale, yScale);
}

function calculateScales(data) {
    let min = d3.min(data.map(d => d.level));
    let max = d3.max(data.map(d => d.level));

    let xScale = d3.scaleBand()
        .range([0, chartWidth - margin.left - margin.right])
        .domain(data.map(d => d.loc))
        .padding(0.35);

    let yScale = d3.scaleLinear()
        .domain([min - 2, max + 2])
        .range([(chartHeight - margin.top - margin.bottom), 0]);

    return { xScale, yScale };
}

function initializePositions(data, xScale, yScale) {
    data.forEach(d => {
        d.x = xScale(d.loc);
        d.y = yScale(d.level);
    });
}


d3.csv("https://raw.githubusercontent.com/LIAVH-MLab/mohenjo-daro/refs/heads/master/data/20250312_MJD_processed_data_reclassified.csv", function(error, data) {

    // Filter Block and Artefact
    let arts = data.filter( function(d) {
        return (d['Block']==="7") && (d['N1'] === "Artefacts");
    })

    // Filter House 7,8,9
    arts = arts.filter( function(d) {
        return (d['House'] === "3") || (d['House'] === "4") || (d['House'] === "5");
    });

    // Assign types to variables
    // Create Block_House Variable
    arts = arts.map((d,i) => ({
        Class: d.Class_new,
        Block: d.Block,
        House: d.House,
        level: +d.Level_ft,
        Plate: d.Plate,
        Room: d.Room,
        Text: d.Text,
        time: d.Time_Cat,
        Type: d.Type,
        Feature:d.Feature,
        photo: d.photo,
        loc: d.Block + '-' + d.House,
        x:+d.x,
        y:+d.y,
        ind:i
    }));

    // Sort by Block - House (Loc)
    arts = _.sortBy(arts, [function(d) {
        return d.loc;
    }]);


    resizeSVG(arts);

    window.addEventListener('resize', function() {
        resizeSVG(arts);
    } );

});