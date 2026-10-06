
let count=0;
const counter=document.getElementById('cartCount');
const toast=document.getElementById('toast');
document.querySelectorAll('.add').forEach(btn=>{
  btn.addEventListener('click',()=>{
    count++; counter.textContent=count;
    toast.textContent=btn.dataset.product+' adicionado ao carrinho ✓';
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'),1800);
  });
});
