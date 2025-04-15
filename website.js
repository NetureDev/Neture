const list = document.querySelectorAll('.list');
const indicator = document.querySelector('.indicator');

list.forEach((item, index) => {
  item.addEventListener('click', () => {
    // Remove "active" from all
    list.forEach(i => i.classList.remove('active'));
    // Add "active" to clicked item
    item.classList.add('active');
    // Move the indicator
    indicator.style.transform = `translateX(calc(70px * ${index}))`;
  });
});
