console.log("Vessels script loaded");


d3.csv("./assets/data/mjd-vessels.csv", function(error, data) {

    data = data.map((d,i) => ({
        order : +d.order,
        'Column 3': d['Column 3'],
        'Link': d['Link'],
    }));

    data = _.sortBy(data, 'order');
    console.log("Data loaded", data);


    let container = d3.select("#vessel-container");

    // grid
    // let grid = document.createElement("div");
    // grid.className = "grid-container";
    // container.node().appendChild(grid);
    let grid = document.querySelector("#grid-container");


    data.forEach(element => {


        // add a div for each vessel in the container
        let item = document.createElement("div");
        let idName = element['Column 3'].toLowerCase().replace(/\s+/g, '-');
        item.id = `vessel-${idName}`;
        item.className = "vessel-item";
        container.node().appendChild(item);

        let frameLink = `${element['Link']}/embed`;


        if (idName === 'pot-2') {
            console.log("pot-2 is here")

            let highlight = document.querySelector("#highlight");
            highlight.appendChild(item);

            let imagesContainer = document.createElement("div");
            imagesContainer.className = "images-container";
            item.appendChild(imagesContainer);
            
            let image1 = document.createElement("img");
            image1.src = "./assets/images/pot-2a.jpg";

            let image2 = document.createElement("img");
            image2.src = "./assets/images/pot-2b.jpg";

            imagesContainer.appendChild(image1);
            imagesContainer.appendChild(image2);
            
            // created an emoty div, class vessel-image
            let vesselModel = document.createElement("div");
            
            vesselModel.className = "vessel-model";
            item.appendChild(vesselModel);
            
            let iframe = document.createElement("iframe");
            iframe.src = frameLink;
            vesselModel.appendChild(iframe);
        } else {

            grid.appendChild(item);
            let vesselModel = document.createElement("div");
            
            vesselModel.className = "vessel-model";
            grid.appendChild(vesselModel);
            
            let iframe = document.createElement("iframe");
            iframe.src = frameLink;
            vesselModel.appendChild(iframe);

            item.appendChild(vesselModel);


        }
        



    });

});
