const categoryDropdownBtn = document.querySelector('.category-btn');
const categoryDropdownContent = document.querySelector(
	'.categories-dropdown--content'
);

categoryDropdownBtn.addEventListener('click', () => {
	categoryDropdownContent.classList.toggle('hidden');
});
