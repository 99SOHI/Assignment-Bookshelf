// --------------------------------------------------------------- Tabs

let tabs = document.querySelectorAll('.tab-links'),
    contents = document.querySelectorAll('.tabs-content');

tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        contents.forEach((content) => {
            content.classList.remove('active');
        })
        tabs.forEach((tab) => {
            tab.classList.remove('active');
        })

        contents[index].classList.add('active');
        tabs[index].classList.add('active');
    })
});

// ----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.getElementById('book-input');
    submitButton.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    })
    if (isStorageExist()) {
        loadDataFromStorage();
    }
})

let books = [];
let RENDER_EVENT = 'render-books'

function addBook() {
    let titleInput = document.getElementById('book-title').value,
        authorInput = document.getElementById('book-author').value,
        yearInput = document.getElementById('book-year').value,
        isCompleted = document.getElementById('is-complete').checked,
        ratingInput = 'unrated';

    let generatedID = generateId(),
        bookObj = makeBook(generatedID, titleInput, authorInput, yearInput, isCompleted, ratingInput);

    books.push(bookObj);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData()

    if (bookObj.isCompleted === true) {
        rateBook(generatedID)
    }
}

function generateId() {
    return +new Date();
}

function makeBook(id, title, author, year, isCompleted, rating) {
    return {
        id,
        title,
        author,
        year,
        isCompleted,
        rating
    }
}

document.addEventListener(RENDER_EVENT, () => {
    const uncompletedBooks = document.getElementById('incompleted-list'),
        completedBooks = document.getElementById('completed-list');

    uncompletedBooks.innerHTML = '';
    completedBooks.innerHTML = '';

    for (let bookItem of books) {
        let bookElement = makeBookElement(bookItem);
        if (!bookItem.isCompleted) {
            uncompletedBooks.append(bookElement)
        } else {
            completedBooks.append(bookElement)
        }
    }

    if (uncompletedBooks.innerHTML == '') {
        let uncompletedPlaceholder = document.createElement('h3')
        uncompletedPlaceholder.innerText = `There's no currently read books`
        uncompletedBooks.append(uncompletedPlaceholder)
    }
    if (completedBooks.innerHTML == '') {
        let completedPlaceholder = document.createElement('h3')
        completedPlaceholder.innerText = `You haven't complete any book :(`
        completedBooks.append(completedPlaceholder)
    }

})

function rateBook(bookId) {

    const bookTarget = findBook(bookId);
    if (bookTarget === null) return;

    document.getElementById('rated-book-title').innerText = `${bookTarget.title}`

    openRatingModal()

    document.getElementById('rate-later').onclick = () => {
        closeRatingModal()
    }
    document.getElementById('overlay').onclick = () => {
        closeRatingModal()
    }

    document.getElementById('rate-book').onclick = () => {

        bookTarget.rating = document.getElementById('rating-select').value;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();

        closeRatingModal()
    }
}

function openRatingModal() {
    let ratingModal = document.querySelector('.modal-container');
    let overlay = document.getElementById('overlay');

    ratingModal.classList.add('active')
    overlay.classList.add('active')
    document.getElementById('rating-select').selectedIndex = 0;
}

function closeRatingModal() {
    let ratingModal = document.querySelector('.modal-container');
    let overlay = document.getElementById('overlay');

    ratingModal.classList.remove('active')
    overlay.classList.remove('active')
}


function makeBookElement(bookObj) {
    let title = document.createElement('h3');
    title.innerText = bookObj.title;

    let author = document.createElement('p');
    author.innerText = `Author: ${bookObj.author}`;

    let year = document.createElement('p');
    year.innerText = `Year: ${bookObj.year}`;

    let bookContainer = document.createElement('div');
    bookContainer.classList.add('book');
    bookContainer.append(title, author, year);

    let DeleteBtn = document.createElement('button');
    DeleteBtn.classList.add('red');
    DeleteBtn.innerText = 'Delete book';

    DeleteBtn.addEventListener('click', () => {
        deleteBook(bookObj.id);
    })

    if (!bookObj.isCompleted) {

        let completedBtn = document.createElement('button');
        completedBtn.classList.add('green');
        completedBtn.innerText = 'Completed';

        let ctaContainer = document.createElement('div');
        ctaContainer.classList.add('cta');
        ctaContainer.append(completedBtn, DeleteBtn);

        completedBtn.addEventListener('click', () => {
            moveToReadedBooks(bookObj.id)
        })

        bookContainer.append(ctaContainer);
    } else {

        let ratingInput = bookObj.rating
        let rating = document.createElement('p');
        if (ratingInput == 'excellent') {
            rating.innerText = 'User Rating: Excellent'
        } else if (ratingInput == 'very-good') {
            rating.innerText = 'User Rating: Very Good'
        } else if (ratingInput == 'good') {
            rating.innerText = 'User Rating: Good'
        } else if (ratingInput == 'weak') {
            rating.innerText = 'User Rating: Weak'
        } else if (ratingInput == 'poor') {
            rating.innerText = 'User Rating: Poor'
        } else {
            rating.innerText = 'User Rating: Unrated'
        }

        let ratingBtn = document.createElement('button');
        ratingBtn.classList.add('green')
        ratingBtn.innerText = 'Change Rating';

        let unreadBtn = document.createElement('button');
        unreadBtn.classList.add('blue');
        unreadBtn.innerText = 'Move to currently reading';

        let ctaContainer = document.createElement('div');
        ctaContainer.classList.add('cta');
        ctaContainer.append(ratingBtn, unreadBtn, DeleteBtn);

        ratingBtn.addEventListener('click', () => {
            rateBook(bookObj.id);
        })

        unreadBtn.addEventListener('click', () => {
            unreadBook(bookObj.id);
        })

        DeleteBtn.addEventListener('click', () => {
            deleteBook(bookObj.id)
        })

        bookContainer.append(rating, ctaContainer);
    }

    let bookSeparator = document.createElement('hr');
    bookSeparator.classList.add('book-line')

    bookContainer.append(bookSeparator)

    return bookContainer

}

function deleteBook(bookId) {
    const bookIndex = findBookIndex(bookId);

    if (bookIndex === -1) return;

    deleteToast(books[bookIndex].title);

    books.splice(bookIndex, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function deleteToast(title) {
    document.getElementById('deleted-book-title').innerText = title

    let toast = document.getElementById('delete-toast');
    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active')
    }, 3000)
}

function unreadBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget === null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function moveToReadedBooks(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget === null) return;

    bookTarget.isCompleted = true;

    if (bookTarget.rating == 'unrated') {
        rateBook(bookId)
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index
        }
    }

    return -1;
}

document.getElementById('search-title').addEventListener('input', filterList)

function filterList() {
    const searchInput = document.getElementById('search-title')
    const filter = searchInput.value.toLowerCase()
    const bookItems = document.querySelectorAll('.book')

    bookItems.forEach((book) => {
        let title = book.childNodes[0].innerText

        if (title.toLowerCase().includes(filter.toLowerCase())) {
            book.style.display = '';
        } else {
            book.style.display = 'none';
        }
    })

}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKS_TRACKER';

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert("Your browser didn't support local storage");
        return false
    }
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT))
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

