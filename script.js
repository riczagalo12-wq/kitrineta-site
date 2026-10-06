// ==========================================
// KITRINETA — CARRINHO
// ==========================================


// LER CARRINHO
function getCart() {
  try {
    return JSON.parse(
      localStorage.getItem("kitrinetaCart")
    ) || [];
  } catch (error) {
    return [];
  }
}


// GUARDAR CARRINHO
function saveCart(cart) {

  localStorage.setItem(
    "kitrinetaCart",
    JSON.stringify(cart)
  );

  updateCartCount();
}


// ATUALIZAR NÚMERO NO ÍCONE DO CARRINHO
function updateCartCount() {

  const cart = getCart();

  const total = cart.reduce(
    function(sum, item) {
      return sum + Number(item.quantity || 1);
    },
    0
  );

  document
    .querySelectorAll("#cartCount, #cart-count")
    .forEach(function(counter) {
      counter.textContent = total;
    });
}


// MOSTRAR MENSAGEM
function showToast(message) {

  const toast =
    document.getElementById("toast");

  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(function() {
    toast.classList.remove("show");
  }, 2200);
}


// ADICIONAR PRODUTO
function addProduct(
  productName,
  quantity,
  childName
) {

  const cart = getCart();

  cart.push({
    product: productName,
    quantity: Number(quantity),
    childName: childName || ""
  });

  saveCart(cart);

  showToast(
    "Adicionado ao carrinho! 🛒"
  );
}


// ESPERAR QUE A PÁGINA ESTEJA CARREGADA
document.addEventListener(
  "DOMContentLoaded",
  function() {

    updateCartCount();


    // TODOS OS BOTÕES "ADICIONAR"
    const addButtons =
      document.querySelectorAll(".add");


    addButtons.forEach(
      function(button) {

        button.addEventListener(
          "click",
          function() {

            const productName =
              button.dataset.product;


            if (!productName) {
              return;
            }


            // -------------------------
            // PÁGINA KIT EXPLORADOR
            // -------------------------

            if (
              productName === "Kit Explorador" &&
              document.getElementById("childName")
            ) {

              const childNameInput =
                document.getElementById("childName");

              const childName =
                childNameInput.value.trim();


              // NOME OBRIGATÓRIO
              if (!childName) {

                childNameInput.focus();

                showToast(
                  "Escreve primeiro o nome da criança."
                );

                return;
              }


              // QUANTIDADE
              const quantityElement =
                document.getElementById("quantity");

              let quantity = 1;


              if (quantityElement) {

                quantity =
                  parseInt(
                    quantityElement.textContent,
                    10
                  ) || 1;

              }


              addProduct(
                productName,
                quantity,
                childName
              );

              return;
            }


            // -------------------------
            // RESTANTES PRODUTOS
            // -------------------------

            addProduct(
              productName,
              1,
              ""
            );

          }
        );

      }
    );

  }
);
