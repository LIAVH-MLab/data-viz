console.log("Vessels script loaded");


d3.csv("./assets/data/mjd-vessels.csv", function(error, data) {
    console.log("Data loaded", data);

    let container = d3.select("#vessel-container");
    console.log("Container selected", container);

    data.forEach(element => {
        // add a div for each vessel in the container
        let item = document.createElement("div");
        let idName = element['Column 3'].toLowerCase().replace(/\s+/g, '-');
        item.id = `vessel-${idName}`;
        item.className = "vessel-item";
        container.node().appendChild(item);
        
        // add an h1 for the vessel name
        let h1 = document.createElement("h1");
        h1.innerHTML = element['Column 3'];
        item.appendChild(h1);

        // created an emoty div, class vessel-image
        let vesselImage = document.createElement("div");
        
        vesselImage.className = "vessel-image";
        item.appendChild(vesselImage);
        
        // add an iframe for the vessel image, using the link from the csv
        let frameLink = `${element['Link']}/embed`;
        // console.log("Frame link", frameLink);

        let iframe = document.createElement("iframe");
        iframe.src = frameLink;
        iframe.allow = "autoplay; encrypted-media";


        if (idName === 'pot-2') {
            console.log("pot-2 is here")
            let image = document.createElement("img");
            image.src = "./assets/images/pot-2.jpg";
            image.style.width = "100%";
            image.style.height = "100%";

            vesselImage.appendChild(image);
        }

        vesselImage.appendChild(iframe);

    });

});
