/* script.js - simple product rendering + cart (localStorage) */

const PRODUCTS = [
  { id: "p1", name: "Mumbai FC 2024 Home Jersey", price: 1299, img: "https://via.placeholder.com/600x400?text=Mumbai+FC+Home" },
  { id: "p2", name: "Chennai United Away 2023", price: 1399, img: "https://via.placeholder.com/600x400?text=Chennai+United+Away" },
  { id: "p3", name: "Kerala Blasters Retro", price: 1699, img: "https://via.placeholder.com/600x400?text=Kerala+Blasters+Retro" },
  { id: "p4", name: "India National 2022 Replica", price: 1599, img: "https://via.placeholder.com/600x400?text=India+National" },
  { id: "p5", name: "Barcelona Style Replica", price: 1899, img: "https://via.placeholder.com/600x400?text=Barcelona+Replica" }
];

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

let cart = JSON.parse(localStorage.getItem('fs_cart') || '{}');

function saveCart(){ localStorage.setItem('fs_cart', JSON.stringify(cart)); updateCartCount(); renderCartItems(); }

function updateCartCount(){
  const count = Object.values(cart).reduce((s,i)=>s+i.qty,0);
  $('#cart-count').textContent = count;
}

function formatPrice(n){ return `₹${n.toLocaleString()}`; }

/* render products */
function renderProducts(list=PRODUCTS){
  const container = $('#products');
  container.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="thumb" style="background-image:url('${p.img}')"></div>
      <div class="card-body">
        <div>
          <h3>${p.name}</h3>
          <p>High quality polyester • Available S–XXL</p>
        </div>
        <div>
          <div class="price-row">
            <div><strong>${formatPrice(p.price)}</strong></div>
            <div>
              <button class="add-btn" data-id="${p.id}">Add to cart</button>
              <button class="secondary-btn view-btn" data-id="${p.id}" style="margin-left:8px">View</button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

/* add to cart */
document.addEventListener('click', (e)=>{
  const add = e.target.closest('.add-btn');
  if(add){
    const id = add.dataset.id;
    const p = PRODUCTS.find(x=>x.id===id);
    if(!cart[id]) cart[id] = { ...p, qty: 0 };
    cart[id].qty++;
    saveCart();
    return;
  }

  const view = e.target.closest('.view-btn');
  if(view){
    const id = view.dataset.id;
    const p = PRODUCTS.find(x=>x.id===id);
    openModal(renderProductModal(p));
    return;
  }
});

/* render cart items */
function renderCartItems(){
  const container = $('#cart-items');
  container.innerHTML = '';
  const keys = Object.keys(cart);
  if(keys.length===0){
    container.innerHTML = '<p style="padding:12px;color:#666">Your cart is empty.</p>';
    $('#cart-total').textContent = formatPrice(0);
    return;
  }
  let total = 0;
  keys.forEach(id=>{
    const it = cart[id];
    total += it.price * it.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${it.img}" alt="${it.name}">
      <div style="flex:1">
        <div style="font-weight:600">${it.name}</div>
        <div style="color:#777;margin-top:6px">${formatPrice(it.price)} x ${it.qty} = <strong>${formatPrice(it.price*it.qty)}</strong></div>
        <div class="qty-controls" style="margin-top:8px">
          <button class="dec" data-id="${id}">-</button>
          <span style="min-width:26px;text-align:center;display:inline-block">${it.qty}</span>
          <button class="inc" data-id="${id}">+</button>
          <button style="margin-left:8px;background:transparent;border:0;color:#b33;cursor:pointer" class="remove" data-id="${id}">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
  $('#cart-total').textContent = formatPrice(total);
}

/* cart controls */
document.addEventListener('click', (e)=>{
  const inc = e.target.closest('.inc');
  if(inc){ const id=inc.dataset.id; cart[id].qty++; saveCart(); return; }
  const dec = e.target.closest('.dec');
  if(dec){ const id=dec.dataset.id; cart[id].qty--; if(cart[id].qty<=0) delete cart[id]; saveCart(); return; }
  const rm = e.target.closest('.remove');
  if(rm){ const id=rm.dataset.id; delete cart[id]; saveCart(); return; }
});

/* search & sort */
$('#search').addEventListener('input', (e)=>{
  const q = e.target.value.trim().toLowerCase();
  const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(q));
  renderProducts(filtered);
});
$('#sort').addEventListener('change',(e)=>{
  const v = e.target.value;
  let ordered = [...PRODUCTS];
  if(v==='price-asc') ordered.sort((a,b)=>a.price-b.price);
  else if(v==='price-desc') ordered.sort((a,b)=>b.price-a.price);
  else if(v==='name-asc') ordered.sort((a,b)=>a.name.localeCompare(b.name));
  renderProducts(ordered);
});

/* cart drawer open/close */
$('#cart-btn').addEventListener('click', ()=> $('#cart-drawer').classList.add('open'));
$('#close-cart').addEventListener('click', ()=> $('#cart-drawer').classList.remove('open'));

/* modal helpers */
function openModal(html){
  const modal = $('#modal');
  $('#modal-body').innerHTML = html;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}
function closeModal(){ const modal = $('#modal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
$('#modal-close').addEventListener('click', closeModal);
$('#modal').addEventListener('click', (e)=> { if(e.target===e.currentTarget) closeModal(); });

function renderProductModal(p){
  return `
    <div style="display:flex;gap:18px;align-items:flex-start">
      <img src="${p.img}" style="width:45%;border-radius:10px;object-fit:cover" alt="${p.name}">
      <div style="flex:1;">
        <h2 style="margin-top:0">${p.name}</h2>
        <p style="color:#666">Official replica fabric — breathable, lightweight, machine-washable.</p>
        <p style="margin-top:14px;font-weight:700">${formatPrice(p.price)}</p>
        <div style="margin-top:16px">
          <button class="add-btn" data-id="${p.id}">Add to cart</button>
        </div>
      </div>
    </div>
  `;
}

/* checkout - demo behaviour */
$('#checkout').addEventListener('click', ()=>{
  if(Object.keys(cart).length===0){ alert('Your cart is empty'); return; }
  alert('Thanks! This demo store does not process payments. Cart cleared.');
  cart = {}; saveCart();
  $('#cart-drawer').classList.remove('open');
});

/* init */
renderProducts();
renderCartItems();
updateCartCount();
