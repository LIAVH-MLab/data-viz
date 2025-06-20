
const root = "https://liavh-mlab.github.io/data-viz"
const links = {
    'dancing-girl': `${root}/final-viz/`,
    'wall': `${root}/perspective/`,
    'transect': 'https://mohenjo-daro.bubbleapps.io/', 
    // make sure to styart the new address with the full http:.....https://mohenjo-daro.bubbleapps.io/
    'well': `${root}/video/`,
    'vessel': `${root}/vessels/`,
}

// create an event listener for image on hover
document.querySelectorAll('image').forEach(img => {
    img.addEventListener('mouseenter', function() {
        let imgID = this.id;


        let imageShow = document.querySelector(`#${imgID}.show`);
        let imageHide = document.querySelector(`#${imgID}.hide`);


        imageShow.classList.remove('show');
        imageShow.classList.add('hide');

        // add show
        imageHide.classList.remove('hide');
        imageHide.classList.add('show');

        // get the text objects in the SVG with the same id as the image
        let textShow = document.querySelector(`#${imgID}-text`);
        textShow.classList.add('hovered');

    });

    img.addEventListener('mouseleave', function() {
        let imgID = this.id;

        // get both elements with the id imageID and swap classes show and hide
        // remove show
        // console.log( document.querySelector(`#${imgID}.show`));

        let imageShow = document.querySelector(`#${imgID}.show`);
        let imageHide = document.querySelector(`#${imgID}.hide`);

        imageShow.classList.remove('show');
        imageShow.classList.add('hide');

        // add show
        imageHide.classList.remove('hide');
        imageHide.classList.add('show');

        let textShow = document.querySelector(`#${imgID}-text`);
        textShow.classList.remove('hovered');
    });


    img.addEventListener('click', function() {
        let imgID = this.id;
        window.open(links[imgID], '_blank');    
    });



});