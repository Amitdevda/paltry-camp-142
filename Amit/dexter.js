function run(){
    let htmlcode=document.getElementById('htmlsec').value;
    let csscode=document.getElementById('csssec').value;
    let jscode=document.getElementById('jssec').value; 
    let Output=document.getElementById('output');

    Output.contentDocument.body.innerHTML = htmlcode + `<style> ${csscode} </style>`;
    Output.contentWindow.eval(jscode);

}

// ==========NAVbar=================

let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");

closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    menuBtnChange();//calling the function(optional)
});
// following are the code to change sidebar button(optional)
function menuBtnChange() {
    if (sidebar.classList.contains("open")) {
        closeBtn.classList.replace("fa-solid fa-bars", "fa-solid fa-bars-sort fa-flip-horizontal");//replacing the iocns class
    } else {
        closeBtn.classList.replace("fa-solid fa-bars-sort fa-flip-horizontal", "fa-solid fa-bars");//replacing the iocns class
        
    }
}

//=====================layout======================

let layout1=document.getElementById('nav_layout-1')
let layout2=document.getElementById('nav_layout-2')
let layout3=document.getElementById('nav_layout-3')
let layout4=document.getElementById('nav_layout-4')
let sec=document.getElementById('content')



layout1.addEventListener('click',()=>{
    sec.classList.remove('a')
    sec.classList.remove('b')
    sec.classList.remove('x')
    sec.classList.remove('d')
    sec.classList.add('cont')
})
layout2.addEventListener('click',()=>{
    sec.classList.remove('cont')
    sec.classList.remove('b')
    sec.classList.remove('x')
    sec.classList.remove('d')
    sec.classList.add('a')
})

layout3.addEventListener('click',()=>{
    sec.classList.remove('a')
    sec.classList.remove('cont')
    sec.classList.remove('d')
    sec.classList.remove('x')
    sec.classList.add('b')
})
layout4.addEventListener('click',()=>{
   sec.classList.remove('a')
   sec.classList.remove('cont')
   sec.classList.remove('b')
   sec.classList.remove('x')
   sec.classList.add('d')
})

//======================== chat function=============
let open=0
let box= document.querySelector('.chating')
function khulja(){
    if(open==0){
     open=1;
    box.style.display = 'block';
}else{
        box.style.display = 'none';
        open=0;
    }
}