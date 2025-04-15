const list = document.querySelectorAll('.list');
const indicator = document.querySelector('.indicator');

function activeLink() {
    list.forEach((item) => item.classList.remove('active'));
    this.classList.add('active');
}

list.forEach((item, index) => {
    item.addEventListener('click', function () {
        activeLink.call(this);
        // Move the indicator based on index
        indicator.style.transform = `translateX(calc(70px * ${index}))`;
    });
});
