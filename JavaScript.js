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

var Pl;
var ka;
var Ia;
var kd;
var Od;
var ks;
var Il;
var n;

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
            camera = cfgReader.result.split('\n');
            C = setVetor(camera[0]);
            N = setVetor(camera[1]);
            V = setVetor(camera[2]);
            var s = setVetor(camera[3]);
            d = s.a;
            hx = s.b;
            hy = s.c;

            aux = d + ' ' + hx + ' ' + hy + ''; //imprimir
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
            Pl = setVetor(iluminacao[0]);
            ka = iluminacao[1];
            Ia = setVetor(iluminacao[2]);
            kd = iluminacao[3];
            Od = setVetor(iluminacao[4]);
            ks = iluminacao[5];
            Il = setVetor(iluminacao[6]);
            n = iluminacao[7];
        }
        txtReader.readAsText(txtTobeRead);
    }, false);
}

function setVetor(vetor){
    auxArray = vetor.split(' ');
    return {a: auxArray[0], b: auxArray[1], c: auxArray[2]};
}

