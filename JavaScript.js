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
var NormalTriangulo = [];
var NormalVertice= [];

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
            
            //Normalizar N
            N = normalizacao(N);

            //Ortogonalizar o vetor V
            var projecaoVN = projecao(V,N);
            V = {a: V.a - projecaoVN.a, b: V.b - projecaoVN.b, c: V.c - projecaoVN.c};

            //Normaizar V
            V = normalizacao(V);

            //Produto vetorial para achar U
            U = produtoVetorial(V,N);

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

            //A normal dos vertices inicializada com 0
            for(var i = 0; i < Pontos.length; i++){
                NormalVertice[i] = {a: 0, b:0, c:0};
            }


            // A normal do triangulo
            for (var i = 0; i < Triangulos.length; i++){
                NormalTriangulo[i] = normalTriangulo(Triangulos[i]);
                normalVertice(i);
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
    result = (vetor1.a * vetor2.a) + (vetor1.b * vetor2.b) + (vetor1.c * vetor2.c);
    return result;
}

function produtoVetorial(vetor1, vetor2) {
    var aux1 = 0;
    var aux2 = 0;
    var aux3 = 0;
    aux1 = (vetor1.b * vetor2.c) - (vetor2.b * vetor1.c);
    aux2 = -1 * ((vetor1.a * vetor2.c) - (vetor2.a * vetor1.c));
    aux3 = (vetor1.a * vetor2.b) - (vetor2.a * vetor1.b);
    return {a: aux1, b: aux2, c: aux3};
}

function projecao(V,N) {
    var produtoVN = produtoInterno(V,N);
    var produtoNN = produtoInterno(N,N);
    var VNN = {a: N.a * produtoVN, b: N.b * produtoVN, c: N.c * produtoVN};
    return {a: VNN.a / produtoNN, b: VNN.b / produtoNN, c: VNN.c / produtoNN};
}

function normalizacao(vetor) {
    var aux = Math.sqrt( parseInt(vetor.a*vetor.a) + parseInt(vetor.b*vetor.b) + parseInt(vetor.c*vetor.c));
    return {a: vetor.a / aux, b: vetor.b / aux, c: vetor.c / aux};
}

function normalTriangulo(triangulo) {
    var vertice1 = Pontos[triangulo.a - 1];
    var vertice2 = Pontos[triangulo.b - 1];
    var vertice3 = Pontos[triangulo.c - 1];
    var P3P1 = {a: vertice3.a - vertice1.a, b: vertice3.b - vertice1.b, c: vertice3.c - vertice1.c };
    var P2P1 = {a: vertice2.a - vertice1.a, b: vertice2.b - vertice1.b, c: vertice2.c - vertice1.c };
    var vetorial = produtoVetorial(P3P1, P2P1);
    return normalizacao(vetorial);
}

function normalVertice(i){
    var p1 = Triangulos[i].a - 1;
    var p2 = Triangulos[i].b - 1;
    var p3 = Triangulos[i].c - 1;
    var Ta = NormalTriangulo[i].a;
    var Tb = NormalTriangulo[i].b;
    var Tc = NormalTriangulo[i].c;
    NormalVertice[p1] = {a: NormalVertice[p1].a + Ta, b: NormalVertice[p1].b + Tb,c: NormalVertice[p1].c + Tc};
    NormalVertice[p2] = {a: NormalVertice[p2].a + Ta, b: NormalVertice[p2].b + Tb,c: NormalVertice[p2].c + Tc};
    NormalVertice[p3] = {a: NormalVertice[p3].a + Ta, b: NormalVertice[p3].b + Tb,c: NormalVertice[p3].c + Tc};
}
    

