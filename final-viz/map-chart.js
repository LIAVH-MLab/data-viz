let height = 700;
w = $("#chart").width();
let width = w;
let rad = 2.5


// moved the chart here
function makeChart( data ) {
    
    let arts = data;

    let margin = {
        top: 5,
        bottom: 65,
        left: 40,
        right: 0 
    }

    // Create Scales
    let min = d3.min(arts.map(d => d.level))
    let max = d3.max(arts.map(d => d.level))

    // --x
    let xScale = d3.scaleBand()
        // .range([+5, width - margin.left - margin.right - 3])
        .range([0, width - margin.left - margin.right])
        .domain(arts.map(d => d.loc)) //X Scale is Block House
        .padding(0.35)

    // --y
    let yScale = d3.scaleLinear()
        .domain([min-2, max+2])
        .range([(height - margin.top - margin.bottom), 0]);
    
    // --color
    // sectors are the unique "Classes" of artefacts
    let sectors = Array.from(new Set( arts.map((d) => d['Class'] ))); //Get Unique
    let color = d3.scaleOrdinal().domain(sectors).range(["#AEDA50", "#6395DF", "#005AC5", "#489000"]);

    // Starts setting up the canvas for d3
    let container = d3.selectAll("#container");
    container.attr("height", height).attr("width", "100%" );

    // shifting 
    let body = container.append("g")
        .style("transform", `translate(${margin.left}px,${margin.top}px)`);

    // Unique Locations
    // This is Block-House and will be the categorical X-axis
    let locs = Array.from(new Set(arts.map((d) => d.loc))); //Get Unique

    // X Grid (Vertical)
    body.append("g").attr("class","xgrid").selectAll("line")
        .data(locs).enter()
        .append("line")
        .attr("class", "horizontalGrid")
        .attr("y1", 0)
        .attr("y2", height - margin.bottom - margin.top)
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d))
        .attr("stroke", "black")
        .attr("stroke-width", ".01em")

    // Scatter Plot 
    let join = body.append("g").attr("class","dots").selectAll("circle")
        .data(arts).enter()
        .append("circle")
        .attr("class", "circ")
        .attr("id",d => d['ind'])
        .attr("cx", d => xScale(d['loc']))
        .attr("cy", d => yScale(d['level']))
        .attr("r", rad)
        .attr("stroke", "black")
        .attr("stroke-width", ".01em")
        .attr("fill", (d) => color(d['Class']));

    // // Collusion Detection
    function tick() {
        d3.selectAll(".circ")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    };

    
    d3.forceSimulation(arts)
        .force("x", d3.forceX(d => xScale(d.loc)).strength(0.5))
        .force("y", d3.forceY(d => yScale(d.level)).strength(0.1))
        .force("collide", d3.forceCollide().strength(.1).radius(rad).iterations(1))
        // .alpha(0.3)
        .on("tick", tick);

    // Features of the forces applied to the nodes:
    // let simulation = d3.forceSimulation()
    // .force("x", d3.forceX().strength(0.5).x( function(d){ return xScale(d.loc) } ))
    // .force("y", d3.forceY().strength(0.1).y( function(d){ return yScale(d.level) } ))
    // // .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
    // // .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
    // .force("collide", d3.forceCollide().strength(.1).radius(rad).iterations(1)) // Force that avoids circle overlapping
    // .on("tick", tick);

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.



    // Axis
    //----x Categorical Scale
    let xAxis = d3.axisBottom(xScale);

    container.append("g")
        .attr("class", "xaxis")
        .attr("id", "x")
        .style("transform", `translate( 0 ,${height-margin.bottom}px)`)
        .style("font-size", "11px")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-90)" )
        .attr("dx", "-.8em")
        .attr("dy", '-5.5px' );

    //----y Linear Scale
    let yAxis = d3.axisLeft(yScale);
    container.append("g")
        .attr("class", "yaxis")
        .attr("id", "y")
        .style("transform", `translate(${margin.left}px,0 )`)
        .style("font-size", "12px")
        .call(yAxis)
        .selectAll("text")
        .attr("dx", "-5px")
        .attr("dy", "5px");
        // new: label y axis at top of chart with "level in feet"

    // TOOLTIP and Interaction
    d3.select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('opactiy', 0);

    //-- Mouse Over, enter, move, out
    join.on("mouseenter", function(d) {
            // When mouse enters to any circle, first makes sure all other are back to normal
            // added black stroke for visibility
           join.attr("r",rad).attr("stroke","black");

            // Hovered circle has black stroke
            d3.select(this)
                .attr("stroke","white")
                .transition().duration(500)
                .attr("r", 6)             
                .attr("stroke","black")
                .attr("opacity",1);

            // if the id of the hovered cirle is the same the map dot, make it bigger
            search = +this.id;
            locators.attr("stroke", d => {
                    if(d.ind === search){
                        r = "black";
                    } else{
                        r = 'none';
                    }
                    return r;
                })
                .attr("r", d => {
                    if(d.ind === search){
                        r = rad*3;
                    } else{
                        r = rad;
                    }
                    return r;
                });

        })
        .on('mouseover', function(d) {
            d3.select('#tooltip')
                .transition().duration(200)
                .style('opacity', 1)
        })
        .on('mouseout', function(d) {
            d3.select('#tooltip')
                .transition().duration(200)
                .style('opacity', 0);

            locators.attr("r",rad).attr("stroke","black");

            d3.select(this)
                .attr("stroke","white")
                .attr("r", rad)             
                .attr("stroke","none");
        })

        // reset the tool tip hover box to be closer to the point it's referencing
        // not sure where that is>>>  chaned line 401 below
        // let px = d3.mouse(this)[0] + (($(window).width()-1200)/2) + 80;

        .on('mousemove', function(d) {
            let px = d3.mouse(this)[0] +  85;
            let py = d3.mouse(this)[1];

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
            if (d.photo !== ""){
                tooltipContent += `<br><img src=${d.photo}></img>`
            }

            // tooltip is positioned here
            d3.select('#tooltip')
                .style('left', px + 'px')
                .style('top', py + 'px')
                .style("background-color", "rgb(255,255,255,0.9)")
                .html( tooltipContent )
        })


    // TIME SELECTION
    // I am selecting the time category from the ribbon above
    value = $(document).ready(function() {
        $('.btn').click(function() {
            
            timeval = $(this).text();
            if (timeval !== "All"){
                join.transition().duration(250)
                    .attr("fill", function(d) {
                        if (d.time === timeval){
                            return color(d.Class)
                        }
                        else {
                            return "#ffffff";
                        }
                    });
            }else {
                join.transition().duration(250)
                    .attr("fill", d => color(d.Class));
            };

        });
    });
}

function resizeSVG(arts) {
    w = $("#chart").width();
    width = w;

    d3.select("#container").selectAll("*").remove();

    makeChart(arts);

}


d3.csv("https://raw.githubusercontent.com/LIAVH-MLab/mohenjo-daro/refs/heads/master/data/Processed_Data.csv", function(error, data) {

    // Filter Block and Artefact
    let arts = data.filter( function(d) {
        return (d['Block']==="7") && (d['N1'] === "Artefacts");
    })

    // Filter House 7,8,9
    arts = arts.filter( function(d) {
        return (d['House'] === "07") || (d['House'] === "08") || (d['House'] === "09");
    });

    // Assign types to variables
    // Create Block_House Variable
    arts = arts.map((d,i) => ({
        Class: d.Class,
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
    console.log("Data: " , data);

    // Sort by Block - House (Loc)
    arts = _.sortBy(arts, [function(d) {
        return d.loc;
    }]);


    makeChart( arts );

    // ---- Map
    // Making a copy of the data for the map
    let arts1 = arts.map(d => ({
        Class: d.Class,
        time: d.time,
        x:+d.x,
        y:+d.y,
        ind:d.ind,
        loc:d.loc,
    }));

    arts1 = arts1.filter( function(d) {
        return (d['x'] !== "");
    });

    // Sort by Block - House (Loc) and Class so they come up in order
    arts1 = _.sortBy(arts1, ['loc','Class']);

    // Initialize Map  
    mapboxgl.accessToken = 'pk.eyJ1IjoibGlhdmgiLCJhIjoiY20yZHA2Nmh1MWZwajJrcTR4bDczM3BhbyJ9.OVzst5OiXSKnT-ayoSqp5A';
    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/liavh/cm3g29g83004h01rvfq472xgt', 
        zoom: 18.75,
        center: [68.1371040,27.32674541],
    });

    // Get Mapbox map canvas container
    let canvas = map.getCanvasContainer();

    // add svg on the map
    let map_svg = d3.select(canvas).append("svg")
        .attr("id","map-box")
        .attr("width",w)
        .attr("height",height);

    let sectors = Array.from(new Set( arts.map((d) => d['Class'] ))); //Get Unique
    let color = d3.scaleOrdinal().domain(sectors).range(["#AEDA50", "#6395DF", "#005AC5", "#489000"]);

    // new: add stroke around map markers: wrong place? did not do anything
    let locators = map_svg.selectAll("circle")
        .data( arts1 ).enter()
        .append("circle")
        .attr("class","map-dots")
        .attr("id", d => d.ind)
        .attr("r", rad)
        .attr("stroke", "black")
        .attr("stroke-width", ".01em")
        .attr("fill", d => color(d.Class))
        .style("opacity",1)
    

    // Project to whatever the map is
    function project(d) {
        return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
    }
    
    function update() {
        // Update the locators positions to form a grid
        // Do this over grouped data so that we can use the group index to position them
        carpan = 6; // multiplier for distance between grid objects (dots)
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
    
        locators.data(flattenedData)
            .attr("cx", function(d) {
                let p = project([d.x, d.y]);
                let position = p.x + ((d.groupIndex % gnum) * carpan) - (carpan / 2);
                return position;
            })
            .attr("cy", function(d) {
                let p = project([d.x, d.y]);
                let position = p.y + ((Math.floor(d.groupIndex / gnum) % 12) * carpan) - (carpan / 2);
                return position;
            });
    }

    update();

    // new added stroke around markers
    $('.btn').click(function() {
        timeval2 = $(this).text();

        if (timeval2 === "All"){
            
            locators.attr("fill", d => color(d.Class))
                .attr("stroke", "black")
                .attr("stroke-width", ".01em");
        }
        else {
            locators.attr("fill", function(d) {
                if (d.time === timeval2){
                    return color(d.Class)
                }
                else {
                    return "#ffffff";
                }
            });
        }
    })

    // Everytime map moves recalculate the grid
    map.on("viewreset", update)
    map.on("move", update)
    
    window.addEventListener('resize', function() {
        resizeSVG(arts);
    } );

});





