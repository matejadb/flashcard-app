class FlashcardTracker {
	constructor() {
		this._totalCards = 0;
		this._totalMastered = 0;
		this._totalInProgress = 0;
		this._totalNotStarted = 0;
		this._flashcards = [];
		this._categories = [];
	}

	/* Public Methods */

	addCard(card) {}

	removeCard(id) {}
}

class Flashcard {
	constructor(question, answer, category) {
		this.id = Math.random().toString(16).slice(2);
		this._question = question;
		this._answer = answer;
		this._category = category;
	}
}

class App {
	constructor() {
		this._tracker = new FlashcardTracker();

		this._loadEventListeners();
	}

	_revealAnswer() {
		document
			.querySelector('.flashcard-content-question')
			.classList.toggle('hidden');

		document
			.querySelector('.flashcard-content-answer')
			.classList.toggle('hidden');
	}

	_selectStudyMode() {
		const studyModeContent = document.querySelector('.study-mode-content');
		const allCardsContent = document.querySelector('.all-cards-content');

		document
			.querySelector('.tablist')
			.querySelectorAll('button')
			.forEach((btn) => {
				btn.classList.remove('tab--current');
				btn.setAttribute('aria-selected', false);
			});

		document.querySelector('.tab--study-mode').classList.add('tab--current');
		document
			.querySelector('.tab--study-mode')
			.setAttribute('aria-selected', true);

		studyModeContent.classList.remove('hidden');
		allCardsContent.classList.add('hidden');
	}

	_selectAllCards() {
		const allCardsContent = document.querySelector('.all-cards-content');
		const studyModeContent = document.querySelector('.study-mode-content');

		document
			.querySelector('.tablist')
			.querySelectorAll('button')
			.forEach((btn) => {
				btn.classList.remove('tab--current');
				btn.setAttribute('aria-selected', false);
			});

		document.querySelector('.tab--all-cards').classList.add('tab--current');
		document
			.querySelector('.tab--all-cards')
			.setAttribute('aria-selected', true);

		allCardsContent.classList.remove('hidden');
		studyModeContent.classList.add('hidden');
	}

	_toggleCategoryDropdown(e) {
		e.stopPropagation();
		const btn = e.currentTarget;
		const dropdown = btn.nextElementSibling;

		dropdown.classList.toggle('hidden');
		const isExpanded = !dropdown.classList.contains('hidden');
		btn.setAttribute('aria-expanded', isExpanded);
	}

	_toggleMenuDropdown(e) {
		e.stopPropagation();
		const btn = e.currentTarget;
		const menuContainer = btn.closest('.menu-container');
		const dropdown = menuContainer.querySelector('.menu-dropdown--content');

		dropdown.classList.toggle('hidden');
		const isExpanded = !dropdown.classList.contains('hidden');
		btn.setAttribute('aria-expanded', isExpanded);
	}

	_closeDropdowns(event) {
		const categoriesDropdowns = document.querySelectorAll(
			'.categories-dropdown'
		);
		const menuDropdowns = document.querySelectorAll('.menu-container');

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

	_loadEventListeners() {
		document.querySelectorAll('.category-btn').forEach((btn) => {
			btn.addEventListener('click', this._toggleCategoryDropdown.bind(this));
		});

		document.querySelectorAll('.menu-btn').forEach((btn) => {
			btn.addEventListener('click', this._toggleMenuDropdown.bind(this));
		});

		document
			.querySelector('.tab--study-mode')
			.addEventListener('click', this._selectStudyMode.bind(this));

		document
			.querySelector('.tab--all-cards')
			.addEventListener('click', this._selectAllCards.bind(this));

		document.addEventListener('click', this._closeDropdowns.bind(this));

		document
			.querySelector('.flashcard-content')
			.addEventListener('click', this._revealAnswer);
	}
}

const app = new App();
