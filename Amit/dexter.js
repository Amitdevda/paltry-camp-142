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



