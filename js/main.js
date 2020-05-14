'use strict';

// Реализация авторизации при нажатии на кнопку Войти
const loginRegex = /^[a-zA-Z][a-zA-Z0-9-_.]{1,20}$/; // регекс логина
const logo = document.querySelectorAll(".logo"); //logo icon
const inputSearch = document.querySelector(".input-search"); //поле поиска товаров
const modal = document.querySelector(".modal");
const closeCart = document.querySelector(".close");
const buttonCart = document.querySelector("#cart-button");
const buttonAuth = document.querySelector(".button-auth");
const buttonOut = document.querySelector(".button-out");
const buttonClearCart = document.querySelector('.clear-cart'); // кнопка очистки содержимого корзины
const modalAuth = document.querySelector(".modal-auth");
const closeAuth = document.querySelector(".close-auth");
const logInForm = document.querySelector("#logInForm");
const loginInput = document.querySelector("#login");
const userName = document.querySelector(".user-name");
const cardsRestaurants = document.querySelector(".cards-restaurants"); // все div'ы со карточками ресторанов
const containerPromo = document.querySelector(".container-promo"); // промо блок
const restaurants = document.querySelector(".restaurants"); // section c заголовком и div'ами карточек ресторанов
const menu = document.querySelector(".menu"); // section Контейнер с названием ресторана + карточками меню этого конкретного ресторана
const restaurantHeading = document.querySelector(".restaurant-heading"); // section с названием ресторана (входит в контейнер menu)
const cardsMenu = document.querySelector(".cards-menu"); // div Контейнер для вставки через js множенства карточек товаров конкретного ресторана
const modalBody = document.querySelector('.modal-body'); // область корзины для рендеринга в нее товаров
let cart; // массив корзины - для каждого логина свой


let login; // username

const getDataFromDB = async function (url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Ошибка ${ response.status } по адресу ${ url }`)
    }
    return await response.json();
};

// валидируем логин
const validateLogin = (login) => loginRegex.test(login);

// показывает-убирает корзину
const toggleModal = () => modal.classList.toggle("is-open");

// показывает-убирает форму логина
const toggleModalAuth = () => {
    modalAuth.classList.toggle("is-open");
    loginInput.style.borderColor = ''
};

const checkAuth = login => login ? authorized(login) : notAuthorized();

// логинимся при нажатии на submit формы авторизации
const logIn = (event) => {
    event.preventDefault();
    console.log("Try to log in...");
    const newLogin = loginInput.value.trim();
    console.log("Try to login with name = ", newLogin);

    if (!validateLogin(newLogin)) {
        // защита от ввода пробелов и пустого поля
        loginInput.style.borderColor = 'red';
        loginInput.value = '';
        console.log("Incorrect symbols in login login");
        return;
    }
    login = newLogin;
    localStorage.setItem('login', login);

    toggleModalAuth();
    logInForm.reset(); // очистка полей формы
    checkAuth(login);
};

// Разлогин
const logOut = () => {
    console.log("Log out...");
    login = null;
    localStorage.removeItem('login');
    checkAuth(login);
    showMainWindow();
};

const authorized = login => {
    console.log(`Login ${ login } successfully authorized`);
    // при логине кнопка Войти убирается, а кнопки Выйти и Username появляются
    buttonAuth.style.display = "none";
    userName.style.display = "inline";
    buttonOut.style.display = "flex";
    buttonCart.style.display = 'flex';
    userName.textContent = login;

    cart = loadCartFromLocalStorage();
};

const notAuthorized = () => {
    console.log("Not authorized");
    buttonAuth.style.display = "";
    userName.style.display = "";
    buttonCart.style.display = '';
    buttonOut.style.display = "";
    userName.textContent = "";
};


// отрисовка карточки ресторана
const createCardRestaurant = restaurant => {
    const {
        image,
        name,
        time_of_delivery: timeOfDelivery,
        price,
        kitchen,
        products,
        stars
    } = restaurant;
    const cardHTML = `
        <a class="card card-restaurant"  data-products="${ products }" data-name="${ name }" data-price="${ price }" data-kitchen="${ kitchen }" data-stars="${ stars }">
        <img src="${ image }" alt="image-${ name }" class="card-image"/>
        <div class="card-text">
        <div class="card-heading">
        <h3 class="card-title">${ name }</h3>
        <span class="card-tag tag">${ timeOfDelivery } мин</span>
        </div>
        <div class="card-info">
        <div class="rating">
              ${ stars }
              </div>
              <div class="price">От ${ price } ₽</div>
              <div class="category">${ kitchen }</div>
              </div>   </div>
              </a>
              `;
    cardsRestaurants.insertAdjacentHTML('beforeend', cardHTML)
};

// создаем в DOM шапку с названием ресторана, а под ней будут карточки товаров
const createRestarauntTitle = ({name, kitchen, stars, price}) => {

    const restaurantTitleHTML = `
          <h2 class="section-title restaurant-title">${ name }</h2>
          <div class="card-info">
          <div class="rating">
          ${ stars }
          </div>
          <div class="price">От ${ price } ₽</div>
        <div class="category">${ kitchen }</div>
        </div>
        `;
    restaurantHeading.insertAdjacentHTML('beforeend', restaurantTitleHTML);

};

// создаем в DOM карточку конкретного товара конкретного ресторана
const createCardGoods = ({id, name, description, price, image}) => {
    const cardHTML = `
        <img src="${ image }" alt="image" class="card-image"/>
        <div class="card-text">
        <div class="card-heading">
        <h3 class="card-title card-title-reg">${ name }</h3>
        </div>
        <div class="card-info">
        <div class="ingredients">${ description }</div>
        </div>
        <div class="card-buttons">
        <button class="button button-primary button-add-cart">
        <span class="button-card-text">В корзину</span>
        <span class="button-cart-svg"></span>
        </button>
        <strong class="card-price-bold">${ price } ₽</strong>
        </div>
        </div>
        `;
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-id', id);
    card.setAttribute('data-name', name);
    card.setAttribute('data-price', price);
    card.insertAdjacentHTML('beforeend', cardHTML);
    cardsMenu.insertAdjacentElement('beforeend', card);
};

// показываем блок промо и карточки ресторанов
const showMainWindow = () => {
    restaurants.classList.remove('hide');
    containerPromo.classList.remove('hide');
    menu.classList.add('hide');
};

// Основная функция для рендеринга страницы меню конкретного ресторана
const openRestaurantGoods = (event) => {
    const restaurant = event.target.closest('.card-restaurant'); // определяем место клика - это и есть наш ресторан
    if (!restaurant) return;
    // проверка авторизации
    if (!login) {
        toggleModalAuth();
        // showMainWindow();
        return;
    }

    // убираем блок промо и карточек ресторанов
    restaurants.classList.add('hide');
    containerPromo.classList.add('hide');
    menu.classList.remove('hide'); // Делаем контейнер для  шапки ресторана видимым
    cardsMenu.textContent = ''; //ощищаем контейнер для карточек при повторных кликах на товары ресторанов
    restaurantHeading.textContent = ''; //ощищаем контейнер для шапки ресторана при повторных кликах на товары ресторанов
    const products = restaurant.dataset.products;
    console.log('products = ', products);
    // Заполняем контейнер карточками товаров
    getDataFromDB(`./db/${ products }`)
        .then((products_list) => {
            products_list.forEach(product => createCardGoods(product))
        });
    // Делаем шапку с названием ресторана над карточками его товаров
    createRestarauntTitle(restaurant.dataset);
};

/* Бесполезная , учебная функция поиска товаров на сайте
Нельзя использовать на продакшене
*/
const searchProduct = event => {
    if (event.keyCode !== 13) return;
    const searchString = event.target.value.trim().toLowerCase();
    if (!searchString || searchString.length < 3) {
        event.target.style.backgroundColor = 'tomato';
        setTimeout(() => {
            event.target.style.backgroundColor = ""
        }, 300);
        return;
    }
    event.target.value = ''; // очищаем поле поиска
    const goods = [];
    const promises = [];
    getDataFromDB("./db/partners.json")
        .then(partners => {
            const products = partners.map(restaurant => restaurant.products);
            products.forEach(product => {
                    promises.push(
                        getDataFromDB(`./db/${ product }`)
                            .then(items => {
                                console.log(`Pushing ${ items.length } items to goods. Length of goods=${ goods.length }`);
                                goods.push(...items);
                            })
                    )
                }
            );
            Promise.all(promises).then(() => { // ждем когда отработают все запросы к бд по всем товарам ресторанов
                console.log('Отработали все запросы к БД');
                console.log('Отобраны товары=: ', goods);
                console.log('Производим фильтрацию данных по поисковому запросу ', searchString);
                return goods.filter(good => {
                    return (good.name.toLowerCase().includes(searchString)) || (good.description.toLowerCase().includes(searchString));
                });
            })
                .then((products_list) => {
                    console.log('selectedGoods: ', products_list);
                    // убираем блок промо и карточек ресторанов
                    restaurants.classList.add('hide');
                    containerPromo.classList.add('hide');
                    menu.classList.remove('hide');// Делаем контейнер для  шапки ресторана видимым
                    cardsMenu.textContent = ''; //ощищаем контейнер для карточек при повторных кликах на товары ресторанов
                    restaurantHeading.textContent = ''; //ощищаем контейнер для шапки ресторана при повторных кликах на товары ресторанов
                    console.log('products_list: ', products_list);
                    let minPrice = products_list.length ? products_list[0].price : 0;
                    products_list.forEach(product => {
                        minPrice = minPrice < product.price ? minPrice : product.price; // минимальная цена товара в отфильтрованном поиске
                        createCardGoods(product)
                    });
                    const resultTitle = products_list.length ? 'Результаты поиска' : 'По вашему запросу ничего не найдено';
                    // Делаем шапку Результатов поиска, используя функцию генерации шапки названия ресторана
                    createRestarauntTitle({name: resultTitle, kitchen: '', stars: '', price: minPrice});
                })
        })
};

// Добавляет товар в корзину при нажатии на кнопку "Добавить  в корзину"
const addToCart = event => {
    const target = event.target;
    const buttonAddToCart = target.closest('.button-add-cart');
    if (buttonAddToCart) {
        const card = target.closest('.card');
        const {id, name, price} = card.dataset;
        console.log('id, name, price: ', id, name, price);
        const good = cart.find(item => item.id === id);
        if (good) {
            good.count += 1; // если уже есть товар в корзине - увеличиваем кол-во
        } else {
            cart.push({
                id, name, price, count: 1
            })
        }
        console.log('cart: ', cart);
        saveCartToLocalStorage();
    }
};

// Отрисовывает список товаров в модальном окне корзины
const renderCart = () => {
    modalBody.textContent = '';
    const foodRowHtml = ({id, name, price, count}) => {
        return `<div class="food-row" data-id="${ id }">
    <span class="food-name">${ name }</span>
    <strong class="food-price">${ price } ₽</strong>
    <div class="food-counter">
    <button class="counter-button counter-button-minus">-</button>
    <span class="counter">${ count }</span>
    <button class="counter-button counter-button-plus">+</button>
    </div>
        </div>`
    };
    cart.forEach((item) => {
        modalBody.insertAdjacentHTML('beforeend', foodRowHtml(item))
    });
    const totalSum = cart.reduce((result, item) => result + item.count * item.price, 0);
    document.querySelector(".modal-pricetag").textContent = `${ totalSum } ₽`
};

// Изменяет (сохраняя в корзине) кол-во товара в модальном окне корзины при нажатии на кнопи + и -
const changeCount = (event) => {
    const target = event.target;
    const buttonChangeCount = target.closest('.counter-button');
    if (buttonChangeCount) {
        const stepSign = buttonChangeCount.classList.contains('counter-button-plus') ? 1 : -1;
        const foodId = buttonChangeCount.closest('.food-row').dataset.id;
        const food = cart.find((item) => item.id === foodId);
        food.count += stepSign;
        food.count = food.count < 1 ? 1 : food.count;
        renderCart();
        saveCartToLocalStorage();
    }
};

// Очистка содержимого корзины
const clearCart = () => {
    cart.length = 0;
    saveCartToLocalStorage();
    renderCart();
};

// Сохраняет корзину конкретного юзера, в корзине хранятся множество юзеров которые работали с корзиной
// !!!на продакшене так делать нельзя - это только для демонстрации работы сайта!!!
const saveCartToLocalStorage = () => {
    let storageCart;
    if (localStorage.getItem('cart')) {
        storageCart = JSON.parse(localStorage.getItem('cart'));
    } else {
        storageCart = {};
    }
    storageCart[login] = cart;
    localStorage.setItem('cart', JSON.stringify(storageCart))
};

// Загружает корзину конкретного юзера из localStorage
const loadCartFromLocalStorage = () => {
    let storageCart = localStorage.getItem('cart');
    console.log('storageCart: ', storageCart);
    const userCart = storageCart && storageCart.length ? JSON.parse(storageCart)[login] || [] : [];
    console.log('Загрузили корзину из locaStorage: ', userCart);
    return userCart
};

// Первичная инициализация при загрузке страницыы
const init = () => {

    buttonCart.addEventListener("click", () => {
        renderCart();
        toggleModal()
    }); //корзина покупок
    closeCart.addEventListener("click", toggleModal); // закрытие корзины покупок
    cardsRestaurants.addEventListener('click', openRestaurantGoods); // при нажатиии на карточку ресторана показать товары ресторана
    buttonAuth.addEventListener("click", toggleModalAuth);
    buttonOut.addEventListener("click", logOut);
    closeAuth.addEventListener("click", toggleModalAuth);
    logInForm.addEventListener("submit", logIn);
    inputSearch.addEventListener("keydown", searchProduct);
    cardsMenu.addEventListener('click', addToCart);
    modalBody.addEventListener('click', changeCount); // меняет кол-во товара в корзине
    buttonClearCart.addEventListener('click', clearCart);  // очищаем корзину

    // обработка при нажатии на логотип в хедере и футере
    logo.forEach((item) => {
        item.addEventListener('click', showMainWindow)
    });

    login = localStorage.getItem('login');

    // проверка залогиненности при открытии/обновлении страницы
    checkAuth(login);


    getDataFromDB("./db/partners.json").then((restaurants) => {
        console.log("restaurants=", restaurants);
        restaurants.forEach((restaurant) => {
            createCardRestaurant(restaurant);
        });
    });


    new Swiper('.swiper-container', {
        loop: true,
        autoplay: {
            delay: 2000, // задержка перед первой прокруткой
        },
        speed: 500, // скорость смены слайда
    });
};

init();