const q=document.getElementById('busqueda');
const c=document.getElementById('categoria');
const items=[...document.querySelectorAll('[data-categoria]')];
const botones=[...document.querySelectorAll('[data-filtro]')];

function filtrar(valor){
  const texto=q.value.trim().toLowerCase();
  const categoria=valor||c.value;

  items.forEach((item)=>{
    const coincideCategoria=categoria==='todos'||item.dataset.categoria===categoria;
    const contenido=(item.textContent+' '+(item.dataset.texto||'')).toLowerCase();
    item.classList.toggle('oculto',!(coincideCategoria&&(!texto||contenido.includes(texto))));
  });

  botones.forEach((boton)=>boton.classList.toggle('activo',boton.dataset.filtro===categoria));
}

q.addEventListener('input',()=>filtrar());
c.addEventListener('change',()=>filtrar());
botones.forEach((boton)=>boton.addEventListener('click',()=>{
  c.value=boton.dataset.filtro;
  filtrar(boton.dataset.filtro);
}));
