const links = {
    'dancing-girl': '/',
    'wall': '/wall',
    'section': '/section',
    'well': '/well',
    'vessel': 'data-viz/final-viz',

}

// create an event listener for image on hover
document.querySelectorAll('image').forEach(img => {
    img.addEventListener('mouseenter', function() {
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

        console.log(imageShow);
        console.log(imageHide);
        console.log(' ------- ' );
       
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
    });


    img.addEventListener('click', function() {
        let imgID = this.id;
        window.open(links[imgID], '_blank');    
    });



});