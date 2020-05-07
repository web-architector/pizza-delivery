// Реализация модального окна корзины
const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");

cartButton.addEventListener("click", toggleModal);
close.addEventListener("click", toggleModal);

function toggleModal() {
  modal.classList.toggle("is-open");
}

// day 1
// Реализация авторизации при нажатии на кнопку Войти
const buttonAuth = document.querySelector(".button-auth");
const modalAuth = document.querySelector(".modal-auth");
const closeAuth = document.querySelector(".close-auth");
const logInForm = document.querySelector("#logInForm");
const loginInput = document.querySelector("#login");
const userName = document.querySelector(".user-name");
const buttonOut = document.querySelector(".button-out");
let login = localStorage.getItem('login');

// показывает-убирает форму логина
const toggleModalAuth = () => {
  modalAuth.classList.toggle("is-open");
  loginInput.style.borderColor=''
};

const checkAuth = (login) => {
  if (login) {
    authorized(login);
  } else notAuthorized();
};

// логин при нажатии на submit формы авторизации
const logIn = (event) => {
  event.preventDefault();
  console.log("Try to log in...");
  login = loginInput.value.trim();
  console.log("login=", login);
  
  if (!login) {
    // защита от ввода пробелов и пустого поля
    loginInput.style.borderColor='red'
    console.log("empty login");
    return;

  }
  localStorage.setItem('login', login)
  toggleModalAuth();
  logInForm.reset(); // очистка полей формы
  checkAuth(login);
};

const logOut = (event) => {
  console.log("Log out...");
  login = null;
  localStorage.removeItem('login')
  checkAuth(login);
};

function authorized(login) {
  console.log(`Login ${login} successfully authorized`);
  // при логине кнопка Войти убирается, а кнопки Выйти и Username появляются
  buttonAuth.style.display = "none";
  userName.style.display = "inline";
  buttonOut.style.display = "block";
  userName.textContent = login;
}
function notAuthorized() {
  console.log("Not authorized");
  buttonAuth.style.display = "";
  userName.style.display = "";
  buttonOut.style.display = "";
  userName.textContent = "";
}

buttonAuth.addEventListener("click", toggleModalAuth);
buttonOut.addEventListener("click", logOut);
closeAuth.addEventListener("click", toggleModalAuth);
logInForm.addEventListener("submit", logIn);

checkAuth(login);
