const flash = document.querySelector('.flash');

// prevent the scrollIntoView() from triggering the 'scroll' event
setTimeout(() => {
    // fade-out/close the flash message if the user scrolls
    window.addEventListener('scroll', function() {
        flash.classList.add('opacity-0');
        // time for the transition to end
        setTimeout(() => flash.remove(), 500);
    }, {once: true}),
    100
});

// fade-out/close the flash message after 4 seconds
setTimeout(() => {
    flash.classList.add('opacity-0');
    // time for the transition to end
    setTimeout(() => flash.remove(), 500);
}, 4000)