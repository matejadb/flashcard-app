class FlashcardTracker {
	constructor() {
		this._totalCards = 0;
		this._totalMastered = 0;
		this._totalInProgress = 0;
		this._totalNotStarted = 0;
		this._currentCard = 0;
		this._flashcards = [];
		this._categories = [];

		this._displayTotalCards();
		this._displayTotalMastered();
		this._displayTotalInProgress();
		this._displayTotalNotStarted();
	}

	/* Public Methods */

	addCard(card) {
		this._flashcards.push(card);
		this._totalCards++;
		this._totalNotStarted++;

		this._populateCategoryDropdown(card);
		if (!this._categories.includes(card.category)) {
			this._categories.push(card.category);
		}

		this._showToastNotification('create');
		this._render();
	}

	removeCard(id) {
		const index = this._flashcards.findIndex((card) => card.id === id);

		if (index !== -1) {
			const card = this._flashcards[index];
			this._totalCards--;
			if (card.mastery > 0 && card.mastery < 5) {
				this._totalInProgress--;
			} else if (card.mastery === 0) {
				this._totalNotStarted--;
			} else if (card.mastery === 5) {
				this._totalMastered--;
			}
			this._flashcards.splice(index, 1);

			const cardCategory = this._formatCategoryName(card.category);
			let catNum = this._getNumberOfCategoryType(card.category);

			const dropdownEl = document.querySelectorAll(`.${cardCategory}`);

			dropdownEl.forEach((el) => {
				if (catNum === 0) {
					// Remove from categories array using the original category name, not formatted
					this._categories = this._categories.filter(
						(cat) => cat !== card.category
					);
					// Remove the parent menuitemcheckbox div
					const menuItem = el.closest('div[role="menuitemcheckbox"]');
					// Remove the following hr if it exists
					const nextHr = menuItem?.nextElementSibling;
					if (nextHr?.tagName === 'HR') {
						nextHr.remove();
					}
					menuItem.remove();
				} else {
					el.textContent = `${card.category} (${catNum})`;
				}
			});

			if (index > this._flashcards.length - 1) this._currentCard = 0;
			else this._currentCard = index;

			this._showToastNotification('delete');
			this._render();
		}
	}

	editCard(id, editedCard) {
		const index = this._flashcards.findIndex((card) => card.id === id);

		if (index !== -1) {
			// Store the old category VALUE, not the object reference
			const oldCategory = this._flashcards[index].category;

			// Check old category count BEFORE updating the card
			const oldCatNum = this._getNumberOfCategoryType(oldCategory);

			// Update the card
			this._flashcards[index] = editedCard;

			// Handle old category count decrease
			if (oldCategory !== editedCard.category) {
				const oldCategoryFormatted = this._formatCategoryName(oldCategory);

				const oldDropdownEl = document.querySelectorAll(
					`.${oldCategoryFormatted}`
				);

				oldDropdownEl.forEach((el) => {
					if (oldCatNum === 1) {
						this._categories = this._categories.filter(
							(cat) => cat !== oldCategory
						);
						el.closest('div[role="menuitemcheckbox"]').remove();
						const nextHr = el.closest(
							'div[role="menuitemcheckbox"]'
						)?.nextElementSibling;
						if (nextHr?.tagName === 'HR') {
							nextHr.remove();
						}
					} else {
						el.textContent = `${oldCategory} (${oldCatNum - 1})`;
					}
				});
			}

			// Handle new category
			this._populateCategoryDropdown(editedCard);

			if (!this._categories.includes(editedCard.category)) {
				this._categories.push(editedCard.category);
			}

			this._showToastNotification('update');
			this._render();
		}
	}

	getCurrentCard() {
		return this._flashcards[this._currentCard];
	}

	getAllFlashcards() {
		return this._flashcards;
	}

	getCurrentCardId() {
		return this._currentCard;
	}

	getTotalCards() {
		return this._totalCards;
	}

	getTotalMasteredCards() {
		return this._totalMastered;
	}

	getNextCard() {
		const checkbox = document.getElementById('hide-mastered');

		if (checkbox.checked) {
			const flashcardsMasteredHidden = this.hideMastered();
			if (this._currentCard + 1 > flashcardsMasteredHidden.length - 1) {
				this._currentCard = 0;
				return flashcardsMasteredHidden[0];
			}

			this._currentCard += 1;
			return flashcardsMasteredHidden[this._currentCard];
		}

		if (this._currentCard + 1 > this._flashcards.length - 1) {
			this._currentCard = 0;
			return this._flashcards[0];
		}

		this._currentCard += 1;

		return this._flashcards[this._currentCard];
	}

	getPreviousCard() {
		const checkbox = document.getElementById('hide-mastered');

		if (checkbox.checked) {
			const flashcardsMasteredHidden = this.hideMastered();

			if (this._currentCard - 1 < 0) {
				this._currentCard = flashcardsMasteredHidden.length - 1;
				return flashcardsMasteredHidden[flashcardsMasteredHidden.length - 1];
			}

			this._currentCard -= 1;
			return flashcardsMasteredHidden[this._currentCard];
		}

		if (this._currentCard - 1 < 0) {
			this._currentCard = this._flashcards.length - 1;
			return this._flashcards[this._flashcards.length - 1];
		}

		this._currentCard -= 1;

		return this._flashcards[this._currentCard];
	}

	incrementMastery(card) {
		if (card.mastery === 0) {
			this._totalNotStarted--;
			this._totalInProgress++;
		} else if (card.mastery === 4) {
			this._totalInProgress--;
			this._totalMastered++;
			// Find all cards with this ID and hide/show mastery elements
			document.querySelectorAll(`[data-id="${card.id}"]`).forEach((cardEl) => {
				const bar = cardEl.querySelector('.bar');
				const mastered = cardEl.querySelector('.card-mastered');

				if (bar) bar.classList.add('hidden');
				if (mastered) mastered.classList.remove('hidden');
			});

			if (this._totalMastered === this._totalCards) {
				const checkbox = document.getElementById('hide-mastered');

				document
					.querySelector('.flashcard-container--main')
					.classList.add('hidden');
				document.querySelector('.all-mastered').classList.remove('hidden');

				checkbox.click();
			}
		}

		card.mastery++;

		const allCardElements = document.querySelectorAll(
			`[data-id="${card.id}"] .progress-bar`
		);
		allCardElements.forEach((bar) => {
			bar.setAttribute('aria-valuenow', card.mastery);
			bar.setAttribute('data-progress', card.mastery);
		});

		document
			.querySelectorAll(`[data-id="${card.id}"] .progress-level`)
			.forEach((text) => {
				if (text.textContent.includes('/')) {
					text.textContent = `${card.mastery}/5`;
				}
			});

		this._render();
	}

	resetMastery(card) {
		if (card.mastery === 5) {
			this._totalMastered--;
		} else {
			this._totalInProgress--;
		}
		card.mastery = 0;
		this._totalNotStarted++;

		// Find all cards with this ID and hide/show mastery elements
		document.querySelectorAll(`[data-id="${card.id}"]`).forEach((cardEl) => {
			const bar = cardEl.querySelector('.bar');
			const mastered = cardEl.querySelector('.card-mastered');

			if (bar) bar.classList.remove('hidden');
			if (mastered) mastered.classList.add('hidden');
		});

		const allCardElements = document.querySelectorAll(
			`[data-id="${card.id}"] .progress-bar`
		);
		allCardElements.forEach((bar) => {
			bar.setAttribute('aria-valuenow', card.mastery);
			bar.setAttribute('data-progress', card.mastery);
		});

		document
			.querySelectorAll(`[data-id="${card.id}"] .progress-level`)
			.forEach((text) => {
				if (text.textContent.includes('/')) {
					text.textContent = `${card.mastery}/5`;
				}
			});

		this._render();
	}

	shuffleCards() {
		for (let i = this._flashcards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this._flashcards[i], this._flashcards[j]] = [
				this._flashcards[j],
				this._flashcards[i],
			];
		}

		return this._flashcards;
	}

	hideMastered() {
		return this._flashcards.filter((card) => card.mastery !== 5);
	}

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

	_populateCategoryDropdown(card) {
		const categoriesEl = document.querySelectorAll(
			'.categories-dropdown--content'
		);

		categoriesEl.innerHTML = ``;

		categoriesEl.forEach((el) => {
			const cardCategory = this._formatCategoryName(card.category);

			const divider = document.createElement('hr');
			const categoryEl = document.createElement('div');
			categoryEl.setAttribute('role', 'menuitemcheckbox');
			categoryEl.setAttribute('aria-checked', false);
			categoryEl.setAttribute('tabindex', 0);

			if (this._categories.includes(card.category)) {
				const categoryLabel = document.querySelectorAll(`.${cardCategory}`);

				categoryLabel.forEach((label) => {
					label.innerHTML = `${card.category} (${this._getNumberOfCategoryType(
						card.category
					)})`;
				});
			} else {
				categoryEl.innerHTML = `<input type="checkbox" id="cat-${cardCategory}" class="dropdown-element" />
				<label for="cat-${this._formatCategoryName(
					card.category
				)}" class="text--preset-5-medium ${cardCategory}">
				${card.category} (${this._getNumberOfCategoryType(card.category)})
				</label>`;
				el.append(categoryEl, divider);
			}
		});
	}

	_formatCategoryName(category) {
		return category.split(' ').join('-').toLowerCase();
	}

	_getNumberOfCategoryType(category) {
		return this._flashcards.filter((card) => card.category === category).length;
	}

	_checkIfCategoryExists(category) {
		const arr = this._getNumberOfCategoryType(category);

		if (arr.length !== 0) {
		}
	}

	_showToastNotification(type) {
		const toastCreated = document.querySelector('.card--created');
		const toastUpdated = document.querySelector('.card--updated');
		const toastDeleted = document.querySelector('.card--deleted');

		switch (type) {
			case 'create':
				this._hideToast(toastCreated);
				break;

			case 'update':
				this._hideToast(toastUpdated);
				break;

			case 'delete':
				this._hideToast(toastDeleted);
				break;
		}
	}

	_hideToast(toast) {
		toast.classList.remove('hidden');

		setTimeout(() => {
			if (!toast.classList.contains('hidden')) {
				toast.classList.add('hidden');
			}
		}, 3000);
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
		this.mastery = 0;
	}
}

class App {
	constructor() {
		this._tracker = new FlashcardTracker();

		this._loadEventListeners();
	}

	_syncLoadMoreVisibility() {
		const pagination = document.querySelector('.pagination');
		if (!pagination) return;

		const hasHiddenCards =
			document.querySelectorAll(
				'.flashcard-container--all-cards .flashcard-hidden'
			).length > 0;

		pagination.classList.toggle('hidden', !hasHiddenCards);
	}

	_fillAllCardsUpTo(limit = 12) {
		const container = document.querySelector('.flashcard-container--all-cards');
		if (!container) return;

		const visibleCount = container.querySelectorAll(
			'.flashcard:not(.flashcard-hidden)'
		).length;
		const toReveal = Math.max(0, limit - visibleCount);
		if (toReveal === 0) return;

		Array.from(container.querySelectorAll('.flashcard-hidden'))
			.slice(0, toReveal)
			.forEach((cardEl) => {
				cardEl.classList.remove('flashcard-hidden');
			});
	}

	_hideMasteredAllCards() {
		const checkbox = document.getElementById('hide-mastered--all-cards');
		document.querySelector('.flashcard-container--all-cards').innerHTML = ``;

		if (checkbox.checked) {
			const flashcards = this._tracker.hideMastered();
			flashcards.forEach((card) => {
				this._displayNewCardAll(card);
				const cardNum = document.querySelector('.card-number');

				cardNum.innerHTML = `Card ${this._tracker.getCurrentCardId() + 1} of ${
					flashcards.length
				}`;
			});
		} else {
			const flashcards = this._tracker.getAllFlashcards();
			flashcards.forEach((card) => {
				this._displayNewCardAll(card);
			});
		}

		this._fillAllCardsUpTo(12);
		this._syncLoadMoreVisibility();
	}
	_hideMasteredStudyMode() {
		const checkbox = document.getElementById('hide-mastered');
		if (this._tracker.getTotalCards() === 0) return;

		if (checkbox.checked) {
			if (
				this._tracker.getTotalCards() === this._tracker.getTotalMasteredCards()
			) {
				document.querySelector('.all-mastered').classList.remove('hidden');
				document
					.querySelector('.flashcard-container--main')
					.classList.add('hidden');
			}

			const flashcards = this._tracker.hideMastered();
			this._displayCardStudyMode(flashcards[0]);

			const cardNum = document.querySelector('.card-number');

			cardNum.innerHTML = `Card ${this._tracker.getCurrentCardId() + 1} of ${
				flashcards.length
			}`;
		} else {
			if (
				this._tracker.getTotalCards() === this._tracker.getTotalMasteredCards()
			) {
				document.querySelector('.all-mastered').classList.add('hidden');
				document
					.querySelector('.flashcard-container--main')
					.classList.remove('hidden');
			}

			const currentCard = this._tracker.getCurrentCard();
			this._displayCardStudyMode(currentCard);
		}
	}

	_getNextCard() {
		this._displayCardStudyMode(this._tracker.getNextCard());
	}

	_getPreviousCard() {
		this._displayCardStudyMode(this._tracker.getPreviousCard());
	}

	_displayCardStudyMode(card) {
		const checkbox = document.getElementById('hide-mastered');
		const flashcardContainer = document.querySelector('.flashcard-content');
		const flashcardQuestionContainer = document.querySelector(
			'.flashcard-content-question'
		);
		const flashcardAnswerContainer = document.querySelector(
			'.flashcard-content-answer'
		);

		flashcardQuestionContainer.setAttribute('data-id', card.id);
		flashcardAnswerContainer.setAttribute('data-id', card.id);

		const isMastered = card.mastery >= 5;
		const barClass = isMastered ? 'bar hidden' : 'bar';
		const masteredClass = isMastered ? 'card-mastered' : 'card-mastered hidden';

		flashcardQuestionContainer.innerHTML = `<span class="flashcard-tag text--preset-6"
										>${card.category}</span
									>
									<img
										src="./assets/images/pattern-star-blue.svg"
										role="presentation"
										class="flashcard-icon flashcard-icon--top-right"
										alt=""
									/>
									<img
										src="./assets/images/pattern-star-yellow.svg"
										role="presentation"
										class="flashcard-icon flashcard-icon--bottom-left"
										alt=""
									/>
									<div class="question-container">
										<h2 class="question-text text--preset-1">
											${card.question}
										</h2>
										<p class="reveal-answer text--preset-4-medium">
											Click to reveal answer
										</p>
									</div>

									<div class="progress-container">
										<div class="${barClass}">
											<div
												role="progressbar"
												aria-valuenow="${card.mastery}"
												aria-valuemin="0"
												aria-valuemax="5"
												aria-label="Question progress"
												class="progress-bar progress-bar--in-progress"
												data-progress="${card.mastery}"
											></div>
											<span class="progress-level text--preset-6">${card.mastery}/5</span>
										</div>
										<div class="${masteredClass}">
											<img
												src="./assets/images/icon-mastered.svg"
												role="presentation"
												alt=""
											/>
											<span class="progress-level text--preset-6"
												>Mastered</span
											>
											<span class="progress-level text--preset-6">5/5</span>
										</div>
									</div>`;

		flashcardAnswerContainer.innerHTML = `<span class="flashcard-tag text--preset-6"
										>${card.category}</span
									>
									<img
										src="./assets/images/pattern-star-pink.svg"
										role="presentation"
										class="flashcard-icon flashcard-icon--top-right"
										alt=""
									/>
									<img
										src="./assets/images/pattern-star-yellow.svg"
										role="presentation"
										class="flashcard-icon flashcard-icon--bottom-left-answer"
										alt=""
									/>
									<div class="question-container">
										<p class="question-answer text--preset-4-medium">Answer</p>
										<h2 class="question-text text--preset-2">
											${card.answer}
										</h2>
									</div>

									<div class="progress-container">
										<div class="${barClass}">
											<div
												role="progressbar"
												aria-valuenow="${card.mastery}"
												aria-valuemin="0"
												aria-valuemax="5"
												aria-label="Question progress"
												class="progress-bar progress-bar--in-progress"
												data-progress="${card.mastery}"
											></div>
											<span class="progress-level text--preset-6">${card.mastery}/5</span>
										</div>
										<div class="${masteredClass}">
											<img
												src="./assets/images/icon-mastered.svg"
												role="presentation"
												alt=""
											/>
											<span class="progress-level text--preset-6"
												>Mastered</span
											>
											<span class="progress-level text--preset-6">5/5</span>
										</div>
									</div>`;

		flashcardContainer.append(
			flashcardQuestionContainer,
			flashcardAnswerContainer
		);

		if (checkbox.checked) {
			const flashcards = this._tracker.hideMastered();
			const cardNum = document.querySelector('.card-number');

			cardNum.innerHTML = `Card ${this._tracker.getCurrentCardId() + 1} of ${
				flashcards.length
			}`;
		} else {
			this._displayCardNumber();
		}
	}

	_displayNewCardAll(card) {
		const cardsEl = document.querySelector('.flashcard-container--all-cards');
		const cardEl = document.createElement('div');
		cardEl.classList.add('flashcard');
		cardEl.setAttribute('data-id', card.id);

		// Count visible cards (not hidden)
		const visibleCards = cardsEl.querySelectorAll(
			'.flashcard:not(.flashcard-hidden)'
		);
		if (visibleCards.length >= 12) {
			cardEl.classList.add('flashcard-hidden');
		}

		const isMastered = card.mastery >= 5;
		const barClass = isMastered ? 'bar hidden' : 'bar';
		const masteredClass = isMastered ? 'card-mastered' : 'card-mastered hidden';

		cardEl.innerHTML = `<div class="question-container--all-cards">
								<h4 class="text--preset-3">${card.question}</h4>
							</div>
							<div class="answer-container--all-cards">
								<span class="text--preset-5-medium">Answer:</span>
								<p class="text--preset-5-medium">${card.answer}</p>
							</div>
							<div class="flashcard--footer">
								<div class="tag-container">
									<span class="flashcard-tag count-cat text--preset-6"
										>${card.category}</span
									>
								</div>
								<div class="progress-bar-container">
									<div class="${barClass}">
										<div
											role="progressbar"
											aria-valuenow="${card.mastery}"
											aria-valuemin="0"
											aria-valuemax="5"
											aria-label="Question progress"
											class="progress-bar progress-bar--in-progress"
											data-progress="${card.mastery}"
										></div>
										<span class="progress-level text--preset-6">${card.mastery}/5</span>
									</div>
									<div class="${masteredClass}">
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
											<button class="btn--edit-card" role="menuitem" aria-checked="false" tabindex="0">
												<img
													src="./assets/images/icon-edit.svg"
													role="presentation"
													alt=""
												/>
												<span class="text--preset-5-medium">Edit</span>
											</button>
											<hr />
											<button class="btn--delete-card" role="menuitem" aria-checked="false" tabindex="0">
												<img
													src="./assets/images/icon-delete.svg"
													role="presentation"
													alt=""
												/>
												<span class="text--preset-5-medium">Delete</span>
											</button>
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
		this._syncLoadMoreVisibility();
	}

	_displayCardNumber() {
		const cardNum = document.querySelector('.card-number');

		cardNum.innerHTML = `Card ${
			this._tracker.getCurrentCardId() + 1
		} of ${this._tracker.getTotalCards()}`;
	}

	_hideNoCardHint() {
		document.querySelector('.no-flashcards').classList.add('hidden');
		document
			.querySelector('.flashcard-container--main')
			.classList.remove('hidden');

		document
			.querySelector('.all-cards-section-controls')
			.classList.remove('hidden');
		document.querySelector('.no-cards--all-cards').classList.add('hidden');
		document
			.querySelector('.flashcard-container--all-cards')
			.classList.remove('hidden');
	}

	_newCard(e) {
		e.preventDefault();

		const question = document.getElementById('new-question');
		const answer = document.getElementById('new-answer');
		const category = document.getElementById('new-category');
		let isValid = true;

		const fields = [
			{
				element: question,
				value: question.value,
			},
			{
				element: answer,
				value: answer.value,
			},
			{
				element: category,
				value: category.value,
			},
		];

		fields.forEach((field) => {
			field.element.nextElementSibling.classList.add('hidden');
		});

		fields.forEach((field) => {
			if (!field.value) {
				field.element.nextElementSibling.classList.remove('hidden');
				isValid = false;
			}
		});

		if (!isValid) {
			return;
		}

		const card = new Flashcard(question.value, answer.value, category.value);

		this._tracker.addCard(card);
		this._displayNewCardAll(card);
		this._displayCardStudyMode(this._tracker.getCurrentCard());
		this._hideNoCardHint();
		question.value = '';
		answer.value = '';
		category.value = '';
	}

	_showLoadMore() {
		this._syncLoadMoreVisibility();
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

		if (this._tracker.getTotalCards() === 0) return;

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

	_incrementMastery() {
		const currentCard = this._tracker.getCurrentCard();
		if (currentCard.mastery < 5) {
			this._tracker.incrementMastery(currentCard);
			this._displayCardStudyMode(currentCard);
		}
	}

	_resetMastery() {
		const currentCard = this._tracker.getCurrentCard();
		if (currentCard.mastery > 0) {
			this._tracker.resetMastery(currentCard);
			this._displayCardStudyMode(currentCard);
		}
	}

	_shuffleCards() {
		const flashcards = this._tracker.shuffleCards();

		document.querySelector('.flashcard-container--all-cards').innerHTML = '';

		flashcards.forEach((card) => {
			this._displayNewCardAll(card);
		});
		this._fillAllCardsUpTo(12);
		this._syncLoadMoreVisibility();
		this._displayCardStudyMode(flashcards[0]);
	}

	_showModalEdit() {
		return new Promise((resolve, reject) => {
			const yesHandler = () => {
				modal.close();
				resolve();
			};

			const noHandler = () => {
				modal.close();
				reject();
			};

			btnConfirm.addEventListener('click', yesHandler, { once: true });
			btnCancel.addEventListener('click', noHandler, { once: true });
		});
	}

	_editCard(e) {
		const question = document.getElementById('edit-question');
		const answer = document.getElementById('edit-answer');
		const category = document.getElementById('edit-category');

		const flashcard = e.target.closest('.flashcard');
		const id = flashcard.getAttribute('data-id');
		const flashcardToEdit = this._tracker
			.getAllFlashcards()
			.filter((card) => card.id === id)[0];

		question.value = flashcardToEdit.question;
		answer.value = flashcardToEdit.answer;
		category.value = flashcardToEdit.category;

		const modal = document.querySelector('.confirm--edit');
		const btnConfirm = document.querySelector('.btn--confirm-edit');
		const btnCancel = document.querySelector('.btn--cancel-edit');
		modal.showModal();

		const confirmHandler = () => {
			const question = document.getElementById('edit-question');
			const answer = document.getElementById('edit-answer');
			const category = document.getElementById('edit-category');
			let isValid = true;

			const fields = [
				{
					element: question,
					value: question.value,
				},
				{
					element: answer,
					value: answer.value,
				},
				{
					element: category,
					value: category.value,
				},
			];

			fields.forEach((field) => {
				field.element.nextElementSibling.classList.add('hidden');
			});

			fields.forEach((field) => {
				if (!field.value) {
					field.element.nextElementSibling.classList.remove('hidden');
					isValid = false;
				}
			});

			if (!isValid) {
				return;
			}

			const editedCard = {
				id: flashcardToEdit.id,
				question: question.value,
				answer: answer.value,
				category: category.value,
				mastery: flashcardToEdit.mastery,
			};

			this._tracker.editCard(id, editedCard);
			const flashcardsArr = this._tracker.getAllFlashcards();
			document.querySelector('.flashcard-container--all-cards').innerHTML = ``;
			flashcardsArr.forEach((card) => {
				this._displayNewCardAll(card);
			});
			this._fillAllCardsUpTo(12);
			this._syncLoadMoreVisibility();
			this._displayCardStudyMode(this._tracker.getCurrentCard());
			modal.close();
			cleanup();
		};

		const cancelHandler = () => {
			modal.close();
			cleanup();
		};

		const cleanup = () => {
			btnConfirm.removeEventListener('click', confirmHandler);
			btnCancel.removeEventListener('click', cancelHandler);
		};

		btnConfirm.addEventListener('click', confirmHandler);
		btnCancel.addEventListener('click', cancelHandler);
	}

	_showModalDelete() {
		const modal = document.querySelector('.confirm--delete');
		const btnConfirm = document.querySelector('.btn--confirm-delete');
		const btnCancel = document.querySelector('.btn--cancel-delete');
		modal.showModal();

		return new Promise((resolve, reject) => {
			const yesHandler = () => {
				modal.close();
				resolve();
			};

			const noHandler = () => {
				modal.close();
				reject();
			};

			btnConfirm.addEventListener('click', yesHandler, { once: true });
			btnCancel.addEventListener('click', noHandler, { once: true });
		});
	}

	_deleteCard(e) {
		const checkbox = document.getElementById('hide-mastered');

		this._showModalDelete()
			.then(() => {
				const id = e.target.closest('.flashcard').getAttribute('data-id');

				this._tracker.removeCard(id);
				e.target.closest('.flashcard').remove();
				this._fillAllCardsUpTo(12);
				this._syncLoadMoreVisibility();

				if (this._tracker.getTotalCards() === 0) {
					document.querySelector('.no-flashcards').classList.remove('hidden');
					document
						.querySelector('.flashcard-container--main')
						.classList.add('hidden');
				} else if (
					this._tracker.getTotalMasteredCards() ===
						this._tracker.getTotalCards() &&
					this._tracker.getTotalCards() !== 0
				) {
					document
						.querySelector('.flashcard-container--main')
						.classList.add('hidden');
					document.querySelector('.all-mastered').classList.remove('hidden');
					checkbox.checked = true;
				} else {
					this._displayCardStudyMode(this._tracker.getCurrentCard());
				}
			})
			.catch(() => {});
	}

	_loadMore() {
		const btnLoadMore = document.querySelector('.btn--load-more');
		if (!btnLoadMore) return;

		const cardsPerLoad = 12;
		this._syncLoadMoreVisibility();

		btnLoadMore.addEventListener('click', (e) => {
			e.preventDefault();

			const container = document.querySelector(
				'.flashcard-container--all-cards'
			);
			if (!container) return;

			Array.from(container.querySelectorAll('.flashcard-hidden'))
				.slice(0, cardsPerLoad)
				.forEach((cardEl) => {
					cardEl.classList.remove('flashcard-hidden');
				});

			this._syncLoadMoreVisibility();
		});
	}

	_closeToastNotification(e) {
		e.target.parentElement.parentElement.classList.add('hidden');
	}

	_loadEventListeners() {
		this._loadMore();

		document
			.querySelector('.form--new-card')
			.addEventListener('submit', this._newCard.bind(this));

		document.querySelectorAll('.category-btn').forEach((btn) => {
			btn.addEventListener('click', this._toggleCategoryDropdown.bind(this));
		});

		document.querySelectorAll('.close-toast').forEach((btn) => {
			btn.addEventListener('click', this._closeToastNotification.bind(this));
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
			.querySelector('.btn-hint')
			.addEventListener('click', this._selectAllCards.bind(this));

		document
			.querySelector('.tab--all-cards')
			.addEventListener('click', this._selectAllCards.bind(this));

		document.addEventListener('click', this._closeDropdowns.bind(this));

		document
			.querySelector('.flashcard-content')
			.addEventListener('click', this._revealAnswer);

		document
			.querySelector('.next-card')
			.addEventListener('click', this._getNextCard.bind(this));

		document
			.querySelector('.previous-card')
			.addEventListener('click', this._getPreviousCard.bind(this));

		document
			.querySelector('.btn--increment-mastery')
			.addEventListener('click', this._incrementMastery.bind(this));

		document
			.querySelector('.btn--reset-mastery')
			.addEventListener('click', this._resetMastery.bind(this));

		document.querySelectorAll('.btn--shuffle').forEach((btn) => {
			btn.addEventListener('click', this._shuffleCards.bind(this));
		});

		document
			.querySelector('#hide-mastered--all-cards')
			.addEventListener('change', this._hideMasteredAllCards.bind(this));

		document
			.querySelector('#hide-mastered')
			.addEventListener('change', this._hideMasteredStudyMode.bind(this));

		document.addEventListener('click', (e) => {
			if (e.target.closest('.btn--edit-card')) {
				e.stopPropagation();
				this._editCard(e);
			}

			if (e.target.closest('.btn--delete-card')) {
				e.stopPropagation();
				this._deleteCard(e);
			}
		});
	}
}

const app = new App();
