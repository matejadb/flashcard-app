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

	addCard(card) {
		this._flashcards.push(card);
		this._totalCards++;
		this._totalNotStarted++;

		if (!this._categories.includes(card.category.toLowerCase())) {
			this._categories.push(card.category);
		}

		this._displayNewCardAll(card);
		this._render();
	}

	removeCard(id) {}

	/* Private Methods */

	_displayTotalCards() {
		const totalCardsEl = document.querySelector('.cards--total');
		totalCardsEl.textContent = this._totalCards;
	}

	_displayTotalMastered() {
		const totalMasteredEl = document.querySelector('.cards--mastered');
		totalMasteredEl.textContent = this._totalMastered;
	}

	_displayTotalInProgress() {
		const totalInProgressEl = document.querySelector('.cards--in-progress');
		totalInProgressEl.textContent = this._totalInProgress;
	}

	_displayTotalNotStarted() {
		const totalNotStartedEl = document.querySelector('.cards--not-started');
		totalNotStartedEl.textContent = this._totalNotStarted;
	}

	_displayNewCardAll(card) {
		const cardsEl = document.querySelector('.flashcard-container--all-cards');
		const cardEl = document.createElement('div');
		cardEl.classList.add('flashcard');
		cardEl.setAttribute('data-id', card.id);

		cardEl.innerHTML = `<div class="question-container--all-cards">
								<h4 class="text--preset-3">${card.question}</h4>
							</div>
							<div class="answer-container--all-cards">
								<span class="text--preset-5-medium">Answer:</span>
								<p class="text--preset-5-medium">${card.answer}</p>
							</div>
							<div class="flashcard--footer">
								<div class="tag-container">
									<span class="flashcard-tag text--preset-6"
										>${card.category}</span
									>
								</div>
								<div class="progress-bar-container">
									<div class="bar ">
										<div
											role="progressbar"
											aria-valuenow="0"
											aria-valuemin="0"
											aria-valuemax="5"
											aria-label="Question progress"
											class="progress-bar progress-bar--in-progress"
											data-progress="0"
										></div>
										<span class="progress-level text--preset-6">0/5</span>
									</div>
									<div class="card-mastered hidden">
										<img
											src="./assets/images/icon-mastered.svg"
											role="presentation"
											alt=""
										/>
										<span class="progress-level text--preset-6">Mastered</span>
										<span class="progress-level text--preset-6">5/5</span>
									</div>
								</div>

								<div class="menu-container">
									<div class="card-menu--dropdown">
										<div
											id="card-menu"
											role="menu"
											aria-labelledby="menu-button"
											class="menu-dropdown--content hidden"
										>
											<div role="menuitem" aria-checked="false" tabindex="0">
												<img
													src="./assets/images/icon-edit.svg"
													role="presentation"
													alt=""
												/>
												<span class="text--preset-5-medium">Edit</span>
											</div>
											<hr />
											<div role="menuitem" aria-checked="false" tabindex="0">
												<img
													src="./assets/images/icon-delete.svg"
													role="presentation"
													alt=""
												/>
												<span class="text--preset-5-medium">Delete</span>
											</div>
											<hr />
										</div>
									</div>
									<button
										class="menu-icon menu-btn"
										aria-expanded="false"
										aria-haspopup="menu"
										type="button"
									>
										<img
											class="card-menu"
											src="./assets/images/icon-menu.svg"
											alt="Card menu button"
										/>
									</button>
								</div>
							</div>`;

		cardsEl.appendChild(cardEl);
	}

	_render() {
		this._displayTotalCards();
		this._displayTotalMastered();
		this._displayTotalInProgress();
		this._displayTotalNotStarted();
	}
}

class Flashcard {
	constructor(question, answer, category) {
		this.id = Math.random().toString(16).slice(2);
		this.question = question;
		this.answer = answer;
		this.category = category;
	}
}

class App {
	constructor() {
		this._tracker = new FlashcardTracker();

		this._loadEventListeners();
	}

	_newCard(e) {
		e.preventDefault();

		const question = document.getElementById('new-question');
		const answer = document.getElementById('new-answer');
		const category = document.getElementById('new-category');

		if (!question.value || !answer.value || !category.value) {
			return;
		}
		const card = new Flashcard(question.value, answer.value, category.value);

		this._tracker.addCard(card);

		question.value = '';
		answer.value = '';
		category.value = '';
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

	_toggleMenuDropdown(btn) {
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
		document
			.querySelector('.form--new-card')
			.addEventListener('submit', this._newCard.bind(this));

		document.querySelectorAll('.category-btn').forEach((btn) => {
			btn.addEventListener('click', this._toggleCategoryDropdown.bind(this));
		});

		document.addEventListener('click', (e) => {
			const menuBtn = e.target.closest('.menu-btn');
			if (menuBtn) {
				e.stopPropagation();
				this._toggleMenuDropdown(menuBtn);
			}
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
