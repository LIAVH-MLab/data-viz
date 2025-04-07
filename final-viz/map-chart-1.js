
let rad = 6;
let radDiamater = rad * 2;
let radHover = rad * 3;
let chartWidth = document.getElementById('chart').clientWidth;
let chartHeight = document.getElementById('chart').clientHeight;
let hoveredObject;

const margin = {
    top: 10,
    bottom: 20,
    left: 30,
    right: 0 
}

let map;
let locators;
let mapDots;

const icons = {
    "Feeding / holding": "feeding-holding",
    "Trade + currency / access":  "trade-currency-access",
    "Beauty / Affect" : "beauty-affect",
    "Making / Craft / Food" : "making-craft",
    "Uncategorized" : "uncategorized",
    "Play / Spiritual" : "play-spiritual",
    "Water Platforms" : "water-platforms",
    "Drainage": "drainage",
    "Well": "well",
}

function createLegend() {
    // 1. artefacts
    // get the .legend-items inside the .legend
    const artefactItems = {
        "Feeding / holding": "feeding-holding",
        "Trade + currency / access":  "trade-currency-access",
        "Beauty / Affect" : "beauty-affect",
        "Making / Craft / Food" : "making-craft",
        "Uncategorized" : "uncategorized",
        "Play / Spiritual" : "play-spiritual",
    }

    let legendItems = document.querySelectorAll(".legend-artefacts > .legend-items")[0];
    
    Object.keys(artefactItems).forEach((key) => {
        let item = document.createElement("div");
        item.classList.add("legend-item");
        item.innerHTML = `<img src="./assets/icons/${artefactItems[key]}.svg" class="legend-icon"></img><p>${key}</p>`;
        legendItems.appendChild(item);
    });

    // 2. features
    const featureItems = {
        "Water Platforms" : "water-platforms",
        "Drainage": "drainage",
        "Well": "well",
    }

    let featureItemsDiv = document.querySelectorAll(".legend-architecture > .legend-items")[0];

    Object.keys(featureItems).forEach((key) => {
        let item = document.createElement("div");
        item.classList.add("legend-item");
        item.innerHTML = `<img src="./assets/icons/${featureItems[key]}.svg" class="legend-icon"></img><p>${key}</p>`;
        featureItemsDiv.appendChild(item);
    });

}
function createScatterPlot( data , xScale, yScale) {

    // Set up Canvas
    let container = d3.selectAll("#container");
    let body = container.append("g").style("transform", `translate(${margin.left}px,${margin.top}px)`);
    // Y Grid (Vertical)
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

    // Add label for y=0 grid line
    body.append("text")
        .attr("x",  5)
        .attr("y", yScale(0) - 5)
        .attr("text-anchor", "start")
        .attr("font-size", "12px")
        .attr("fill", "#333")
        .text("Excavation Depth below datum (ft)");
    
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
        .style("transform", `translate( ${margin.left}px ,${chartHeight-margin.bottom}px)`)
        .style("font-size", "13px")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("dx", `-${margin.left}px`)
        .attr("dy", "1.1rem")
        .attr("y", 0)
        .text(d => `House ${d.split("-")[1]}`); 

    // Initialize positions
    data.forEach(d => {
        d.x = xScale(d.loc);
        d.y = yScale(d.level);
    });

    let join = body.append("g").attr("class","dots").selectAll("circle")
        .data(data).enter()
        .append("image")
        .attr("class", "circ")
        .attr("id",d => d['ind'])
        .attr("xlink:href", d => { return `./assets/icons/${icons[d['Class']]}.svg`; })
        .attr("width", radDiamater) // Set the width of the icon
        .attr("height", radDiamater) // Set the height of the icon
        .attr("x", d => xScale(d.loc) - rad) // Adjust x position to center the icon
        .attr("y", d => yScale(d.level) - rad); // Adjust y position to center the icon

    
    // --------  Collusion Detection
    function tick() {
        d3.selectAll(".circ")
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    };

    // Stop any existing simulation
    if (window.simulation) {
        window.simulation.stop();
    }

    window.simulation = d3.forceSimulation(data)
        .force("x", d3.forceX(d => xScale(d.loc)).strength(0.05))
        .force("y", d3.forceY(d => yScale(d.level)).strength(1.25))
        .force("collide", d3.forceCollide().strength(0.5).radius(rad*1.2).iterations(1))
        // .alphaDecay(0.05)
        .on("tick", tick);

        // Start decay after 3 seconds
    setTimeout(() => {
        window.simulation.alphaDecay(0.02);
    }, 4000);

    // TOOLTIP and Interaction
    d3.select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('opacity', 1)
        .style('position', 'absolute')
        .style('left', '0px')
        .style('top', '0px')
        .style('pointer-events', 'none'); // Ensure the tooltip does not interfere with mouse events
    
    join.on("mouseenter", function(d) {
        
        hoveredObject = d['ind'];

        d3.selectAll(".circ")
            .attr("height", radDiamater)
            .attr("width", radDiamater)

        // Scale up the icon / this is ojbect hovered
        d3.select(this)
            .transition().duration(500)
            .attr("width", radHover )             
            .attr("height",radHover);

        d3.selectAll(".map-dots") // selects all map objects
            .attr("width", d => d.ind === hoveredObject ? radHover : radDiamater)
            .attr("height", d => d.ind === hoveredObject ? radHover : radDiamater)
            .attr("x", function(d){
                if (d.ind === hoveredObject){
                    let currentX = d3.select(this).attr("x");
                    return currentX - (rad);
                } else {
                    return d3.select(this).attr("x");
                }
            })
            .attr("y", function(d){
                if (d.ind === hoveredObject){
                    let currentY = d3.select(this).attr("y");
                    return currentY - (rad);
                } else {
                    return d3.select(this).attr("y");
                }
            })


        // Bring the hovered icon to the front
        d3.selectAll(".map-dots").filter(d => d.ind === hoveredObject).raise();  
        d3.select(this).raise();
        

    });


    join.on('mouseover', function(d) {
        d3.select('#tooltip')
            .transition().duration(200)
            .style('opacity', 1)
    })

    join.on('mouseleave', function(d) {
        
        hoveredObject = null;
        d3.select('#tooltip')
            .transition().duration(200)
            .style('opacity', 0);

        d3.select(this)
            .attr("width", radDiamater)
            .attr("height", radDiamater)     
        
        d3.selectAll(".map-dots")
            .attr("width", radDiamater)
            .attr("height", radDiamater)
        
        updateGrid();
            
    })

    join.on('mousemove', function(d) {

        let [px, py] = d3.mouse(document.body);

        // Tooltip content is here. if ones are conditional
        let tooltipContent = `<p2><b>Location: </b> ${d.Block}-${d.House}-${d.Room}
                    <br>
                <b>Class: </b>${d.Class}
                    <br>
                <b>Feature: </b>${d.Feature}`

        if (d.Type !== ""){
            tooltipContent += `<br><b>Type: </b>${d.Type}`
        }
        if (d.Text !== ""){
            tooltipContent += `<br><b>Description: </b>${d.Text}`
        }
        if (d.photo !== "" && d.photo !== undefined && d.photo !== null) {
            tooltipContent += `<br><img src=${d.photo}></img>`;
        }

        // if (d.photo !== "" && d.photo !== undefined && d.photo !== null) {
        //     // tooltipContent += `<br><img src=${d.photo}></img>`;
            
        //     let img = new Image();
        //     img.onload = function() {
        //         tooltipContent += `<br><img src=${d.photo}></img>`;
        //     };
        //     img.src = d.photo; // This triggers the image loading process
        // }
        
        // Set the tooltip content first to get the height
        d3.select('#tooltip')
            .html(tooltipContent);

        // Get the tooltip dimensions
        let tooltipNode = d3.select('#tooltip').node();
        let tooltipWidth = tooltipNode.getBoundingClientRect().width;
        let tooltipHeight = tooltipNode.getBoundingClientRect().height;

        // Position the tooltip to the middle of the icon vertically and horizontally
        d3.select('#tooltip')
            .style('left', (px + 15) + 'px')
            .style('top', (py - tooltipHeight / 2) + 'px')
            .style("background-color", "rgb(255,255,255,0.9)")
            .html(tooltipContent);



        });

    // create an event listener of the buttons .btn
    d3.selectAll(".btn").on("click", function() {
        let btn = d3.select(this);
        let value = btn.attr("value");

        if (value !== "All") {

            d3.selectAll(".btn").classed("clicked", false);
            btn.classed("clicked", true);

            join.transition().duration(250)
                .attr("style", d=> d.time === value ?  "filter:''" : "filter: grayscale(1) brightness(1.5);" );

            d3.selectAll(".map-dots").transition().duration(250)
                .attr("style", d=> d.time === value ?  "filter:''" : "filter: grayscale(1) brightness(1.5);" );

        } else {

            d3.selectAll(".btn").classed("clicked", false);
            btn.classed("clicked", true);

            join.transition().duration(250)
                .attr("style","filter: ''" );
            
            d3.selectAll(".map-dots").transition().duration(250)
                .attr("style","filter: ''" );
        }

    });

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
//-- adjusted padding from .5 to .75 to center data in chart after resizing icons
    let xScale = d3.scaleBand()
        .range([0, chartWidth - margin.left - margin.right])
        .domain(data.map(d => d.loc))
        .padding(.75);

        // -4 and +4 are for the padding -- adjusted bottom to align with -35ft
    let yScale = d3.scaleLinear()
        .domain([min - 1.73, max + 4])
        .range([(chartHeight - margin.top - margin.bottom), 0]);

    return { xScale, yScale };
}

function initializePositions(data, xScale, yScale) {
    data.forEach(d => {
        d.x = xScale(d.loc);
        d.y = yScale(d.level);
    });
}

// Project to whatever the map is
function project(d) {
    return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
}

function createMapBG() {
    // Initialize Map  
    mapboxgl.accessToken = 'pk.eyJ1IjoibGlhdmgiLCJhIjoiY20yZHA2Nmh1MWZwajJrcTR4bDczM3BhbyJ9.OVzst5OiXSKnT-ayoSqp5A';

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/liavh/cm3g29g83004h01rvfq472xgt', 
        zoom: 20,
        center: [68.13745,27.3268],
    });
}

function updateGrid() {
    carpan = (radDiamater)+1; // multiplier for distance between grid objects (dots)
    gnum = 8; // number of columns

    // Group data by loc
    let groupedData = d3.nest()
        .key(d => d.loc)
        .entries(arts1);

    // Flatten the grouped data while maintaining the group structure
    let flattenedData = [];
    groupedData.forEach(group => {
        group.values.forEach((d, i) => {
            d.groupIndex = i;
            d.groupSize = group.values.length;
            flattenedData.push(d);
        });
    });

    // Find the maximum groupIndex 
    // adjust location of map grids here : Max move is 
    let maxGroupIndex = d3.max(flattenedData, d => d.groupIndex);
    let maxMove = ((Math.floor( maxGroupIndex / gnum) % 12) * carpan) - (carpan / 2);

    locators.data(flattenedData)
        .attr("x", function(d) {
            let p = project([d.x, d.y]);
            let move = ((d.groupIndex % gnum) * carpan) - (carpan / 2);
            let position = p.x + move - 35;
            //let position = p.x + move - (gnum*carpan/2);
            return position;
        })
        .attr("y", function(d) {
            let p = project([d.x, d.y]);
            let move = ((Math.floor(d.groupIndex / gnum) % 12) * carpan) - (carpan / 2);
            // console.log("move", move)
            let position = p.y + move - 55;
           // let position = p.y + move - maxMove;
            return position;
        });
}

function createMap( data ){

    // Sort by Block - House (Loc) and Class so they come up in order
    arts1 = _.sortBy( data, ['loc','Class']);
    console.log("Arts on map:" , arts1)

    // Get Mapbox map canvas container
    let canvas = map.getCanvasContainer();

    let mapWidth = document.getElementById('map').clientWidth;
    let mapHeight = document.getElementById('map').clientHeight;

    // add svg on the map
    let map_svg = d3.select(canvas).append("svg")
        .attr("id","map-box")
        .attr("width", mapWidth )
        .attr("height", mapHeight );


    locators = map_svg.selectAll("circle")
        .data( arts1 ).enter()
        .append("image")
        .attr("class","map-dots")
        .attr("id", d => d.ind)
        .attr("xlink:href", d => { return `./assets/icons/${icons[d['Class']]}.svg`; })
        .attr("width", d => d.ind === hoveredObject ? radHover : radDiamater) // Set the width of the icon
        .attr("height", d => d.ind === hoveredObject ? radHover : radDiamater)
        .attr("x", d => project([d.x, d.y]).x - rad) // Adjust x position to center the icon
        .attr("y", d => project([d.x, d.y]).y - rad); // Adjust y position to center the icon

    updateGrid();

    // add a on mouse enter evert for locators
    locators.on("mouseenter", function(d) {
        hoveredObject = d['ind'];
        console.log("hoveredObject", hoveredObject)
        d3.selectAll(".circ")
            .attr("width", d => d.ind === hoveredObject ? radHover : radDiamater)
            .attr("height", d => d.ind === hoveredObject ? radHover : radDiamater)
        d3.select(this)
            .transition().duration(500)
            .attr("width", radHover )             
            .attr("height",radHover);          
    });

    locators.on('mouseleave', function(d) {
        hoveredObject = null;
        d3.select(this)
            .transition().duration(500)
            .attr("width", radDiamater)
            .attr("height", radDiamater) 
            
        d3.selectAll(".circ")
            .attr("width", radDiamater)
            .attr("height", radDiamater)
        
        updateGrid();
            
    });

}


d3.csv("https://raw.githubusercontent.com/LIAVH-MLab/mohenjo-daro/refs/heads/master/data/20250407_MJD_processed_data.csv", function(error, data) {

    // Filter Block and Artefact
    let filteredData = data.filter( function(d) {
        return (d['Block']==="7") & ((d['House'] === "3") || (d['House'] === "4") || (d['House'] === "5"));
    })

    // Assign types to variables
    // Create Block_House Variable
    filteredData = filteredData.map((d,i) => ({
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
        photo: d.Path,
        loc: d.Block + '-' + d.House,
        x:+d.x,
        y:+d.y,
        ind:i
    }));

    
    // Sort by Block - House (Loc)
    let arts = _.cloneDeep(filteredData);
    arts = _.sortBy(arts, [function(d) {
        return d.loc;
    }]);

    // Create the chart
    resizeSVG( arts );

    // Create the map
    createMapBG();
    createMap( filteredData );

    window.addEventListener('resize', function() {
        resizeSVG(arts);
    } );

    map.on("viewreset", updateGrid );
    map.on("move", updateGrid);

});

createLegend();

