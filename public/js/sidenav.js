$(() => {
    $('.sideNav').sideNav({
        edge: 'right',
        // draggable: true,
    });

    $('.friendsMen .frLists').on('click', () => {
        $('.sideNav').sideNav('hide')
    })

})
