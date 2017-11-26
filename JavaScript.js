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

var Pontos = [];
var Triangulos = [];

var Pl;
var ka;
var Ia;
var kd;
var Od;
var ks;
var Il;
var n;

var U;

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
            var vet = setVetor(camera[3]);
            d = vet.a;
            hx = vet.b;
            hy = vet.c;
        }
        cfgReader.readAsText(cfgTobeRead);

        byuReader.onload = function (e) {
            objeto = byuReader.result.split('\n');  //de 1 a vet[0]-1
            var vet = objeto[0].split(' ');
            for(var i = 0; i < vet[0]; i ++){
                Pontos[i] = setVetor(objeto[i+1]);
            }
            vet0 = parseInt(vet[0]) + 1;
            for(var i = 0; i < vet[1]; i++){ // de vet[0] a vet[1]-1
                Triangulos[i] = setVetor(objeto[i + vet0]);
            }
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

    V = V - projecao(V,N);
    U = produtoVetorial(V,N);
}

function setVetor(vetor){
    auxArray = vetor.split(' ');
    return {a: auxArray[0], b: auxArray[1], c: auxArray[2]};
}

/*aux = d + ' ' + hx + ' ' + hy + ''; //imprimir
var content = document.getElementById('content');  //Imprimir
content.innerText = aux; //imprimir*/
function produtoInterno(vetor1,vetor2) {
    var total = 0;
    total = (vetor1.a * vetor2.a) + (vetor1.b * vetor2.b) + (vetor1.c * vetor2.c);
    return total;
}

function produtoVetorial(vetor1, vetor2) {
    var resut = {a: 0, b: 0, c: 0};
    result.a = (vetor1.b * vetor2.c) - (vetor2.b * vetor1.c);
    result.b = -((vetor1.a * vetor2.c) - (vetor2.a * vetor1.c);
    result.c = (vetor1.a * vetor2.b) - (vetor2.a * vetor1.b);
    return result;
}

function projecao(V,N) {
    var result = 0;
    resut = ((produtoInterno(V,N) * N) / (produtoInterno(N,N)));
    return result;
}

function normalizacao(vetor) {
    var resut = {a: 0, b: 0, c: 0};
    var aux = Math.sqrt(vetor.a*vetor.a + vetor.b*vetor.b + vetor.c*vetor.c);
    result.a = vetor.a / aux;
    result.b = vetor.b / aux;
    result.c = vetor.c / aux;
    return result;
}

/*Ortogonalizar V */
    

