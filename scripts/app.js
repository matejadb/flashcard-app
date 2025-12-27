/* GLOBAL */
const categoryDropdownBtns = document.querySelectorAll('.category-btn');
const categoryDropdownContents = document.querySelectorAll(
	'.categories-dropdown--content'
);
const menuDropdownBtns = document.querySelectorAll('.menu-btn');
const menuDropdownContents = document.querySelectorAll(
	'.menu-dropdown--content'
);

const categoriesDropdowns = document.querySelectorAll('.categories-dropdown');
const menuDropdowns = document.querySelectorAll('.menu-container');

const tablist = document.querySelector('.tablist');
const studyModeBtn = document.querySelector('.tab--study-mode');
const allCardsBtn = document.querySelector('.tab--all-cards');
const studyMode = document.querySelector('.study-mode-content');
const allCards = document.querySelector('.all-cards-content');
const revealAnswer = document.querySelector('.flashcard-content');

/* FUNCTIONS */
function selectStudyMode() {
	tablist.querySelectorAll('button').forEach((btn) => {
		btn.classList.remove('tab--current');
		btn.setAttribute('aria-selected', false);
	});

	studyModeBtn.classList.add('tab--current');
	studyModeBtn.setAttribute('aria-selected', true);

	studyMode.classList.remove('hidden');
	allCards.classList.add('hidden');
}

function selectAllCards() {
	tablist.querySelectorAll('button').forEach((btn) => {
		btn.classList.remove('tab--current');
		btn.setAttribute('aria-selected', false);
	});

	allCardsBtn.classList.add('tab--current');
	allCardsBtn.setAttribute('aria-selected', true);

	allCards.classList.remove('hidden');
	studyMode.classList.add('hidden');
}

function toggleCategoryDropdown(event) {
	event.stopPropagation();
	const btn = event.currentTarget;
	const dropdown = btn.nextElementSibling;

	dropdown.classList.toggle('hidden');
	const isExpanded = !dropdown.classList.contains('hidden');
	btn.setAttribute('aria-expanded', isExpanded);
}

function toggleMenuDropdown(event) {
	event.stopPropagation();
	const btn = event.currentTarget;
	const menuContainer = btn.closest('.menu-container');
	const dropdown = menuContainer.querySelector('.menu-dropdown--content');

	dropdown.classList.toggle('hidden');
	const isExpanded = !dropdown.classList.contains('hidden');
	btn.setAttribute('aria-expanded', isExpanded);
}

function closeDropdowns(event) {
	event.stopPropagation();
	categoriesDropdowns.forEach((dropdown) => {
		const dropdownContent = dropdown.querySelector(
			'.categories-dropdown--content'
		);
		const dropdownBtn = dropdown.querySelector('.category-btn');
		if (!dropdown.contains(event.target)) {
			dropdownContent.classList.add('hidden');
			dropdownBtn.setAttribute('aria-expanded', false);
		}
	});

	menuDropdowns.forEach((dropdown) => {
		const dropdownContent = dropdown.querySelector('.menu-dropdown--content');

		const dropdownBtn = dropdown.querySelector('.menu-btn');
		if (!dropdown.contains(event.target)) {
			dropdownContent.classList.add('hidden');
			dropdownBtn.setAttribute('aria-expanded', false);
		}
	});
}

function reveal() {
	document
		.querySelector('.flashcard-content-question')
		.classList.toggle('hidden');

	document
		.querySelector('.flashcard-content-answer')
		.classList.toggle('hidden');
}

/* EVENT LISTENERS */
categoryDropdownBtns.forEach((btn) => {
	btn.addEventListener('click', toggleCategoryDropdown);
});
menuDropdownBtns.forEach((btn) => {
	btn.addEventListener('click', toggleMenuDropdown);
});

document.addEventListener('click', closeDropdowns);

studyModeBtn.addEventListener('click', selectStudyMode);

allCardsBtn.addEventListener('click', selectAllCards);

revealAnswer.addEventListener('click', reveal);
