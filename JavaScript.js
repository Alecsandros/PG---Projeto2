var auxArray = [];
var camera = [];
var objeto = [];
var iluminacao = [];
var aux;
var C; 
var N; 
var V;  
var d;
var hx;
var hy;
window.onload = function () {
	var cfgSelected = document.getElementById('cfg');
	var byuSelected = document.getElementById('byu');
    var txtSelected = document.getElementById('txt');
    var botao = document.getElementById('button');
    botao.addEventListener('click', function (e) {
    	var cfgTobeRead = cfgSelected.files[0];
    	var byuTobeRead = byuSelected.files[0];
        var txtTobeRead = txtSelected.files[0];
        var cfgReader = new FileReader();
        var byuReader = new FileReader();
        var txtReader = new FileReader();
        cfgReader.onload = function (e) {
        	aux = "";
            camera = cfgReader.result.split('\n');
            for(var i = 0; i < camera.length-1; i++){
                auxArray = camera[i].split(' ');
                camera[i] = {a: auxArray[0], b: auxArray[1], c: auxArray[2]};
            }
            C = camera[0];
            N = camera[1];
            V = camera[2];
            d = camera[3].a;
            hx = camera[3].b;
            hy = camera[3].c;
            /*aux = d + ' ' + hx + ' ' + hy + ''; //imprimir
            var content = document.getElementById('content');  //Imprimir
            content.innerText = aux; //imprimir*/
        }
        cfgReader.readAsText(cfgTobeRead);
        byuReader.onload = function (e) {
            objeto = byuReader.result.split('\n');
            var byuContents = document.getElementById('byucontents');  //Imprimir
            for(var i = 0; i < objeto.length; i++){   //imprimir
            	aux = aux + objeto[i]; 
            } 
            byuContents.innerText = aux; //imprimir
        }
        byuReader.readAsText(byuTobeRead);
        txtReader.onload = function (e) {
            iluminacao = txtReader.result.split('\n');
            var txtContents = document.getElementById('txtcontents');  //Imprimir
            for(var i = 0; i < iluminacao.length; i++){   //imprimir
            	aux = aux + iluminacao[i]; 
            } 
            txtContents.innerText = aux; //imprimir
        }
        txtReader.readAsText(txtTobeRead);
    }, false);
}

