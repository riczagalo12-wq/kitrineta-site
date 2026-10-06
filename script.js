// ==========================================
// KITRINETA — CARRINHO
// ==========================================

function getCart() {
  return JSON.parse(localStorage.getItem("kitrinetaCart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("kitrinetaCart", JSON.stringify(cart));
  updateCartCount();
}


// ------------------------------------------
// CONTADOR DO CARRINHO
// ------------------------------------------

function updateCartCount() {

  const cart = getCart();

  const total = cart.reduce(function(sum, item) {
    return sum + item.quantity;
  }, 0);

  const counters = document.querySelectorAll(
    "#cartCount, #cart-count"
  );

  counters.forEach(function(counter) {
    counter.textContent = total;
  });
}


// ------------------------------------------
// MENSAGEM
// ------------------------------------------

function showToast(message) {

  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(function() {
    toast.classList.remove("show");
  }, 2200);
}


// ------------------------------------------
// ADICIONAR PRODUTO
// ------------------------------------------

function addProduct(productName, quantity, childName) {

  const cart = getCart();

  const item = {
    product: productName,
    quantity: quantity,
    childName: childName || ""
  };

  cart.push(item);

  saveCart(cart);

  showToast(
    quantity === 1
      ? "Kit adicionado ao carrinho!"
      : quantity + " kits adicionados ao carrinho!"
  );
}


// ------------------------------------------
// BOTÕES ADICIONAR AO CARRINHO
// ------------------------------------------

document.querySelectorAll(".add").forEach(function(button) {

  button.addEventListener("click", function() {

    const productName = button.dataset.product;

    // Se estivermos na página individual
    // do Kit Explorador
    if (productName === "Kit Explorador" &&
        document.getElementById("childName")) {

      const childNameInput =
        document.getElementById("childName");

      const childName =
        childNameInput.value.trim();

      // O nome é obrigatório
      if (!childName) {

        childNameInput.focus();

        showToast(
          "Indica primeiro o nome da criança."
        );

        return;
      }


      // Quantidade escolhida
      const quantityElement =
        document.getElementById("quantity");

      const quantity =
        quantityElement
          ? parseInt(quantityElement.textContent)
          : 1;


      addProduct(
        productName,
        quantity,
        childName
      );

      return;
    }


    // Outros botões do site
    addProduct(
      productName,
      1,
      ""
    );

  });

});


// ------------------------------------------
// INICIAR CONTADOR
// ------------------------------------------

updateCartCount();
