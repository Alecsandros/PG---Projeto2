var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var DesenharPontos = [];

var Auxarray = [];
var Camera = [];
var Objeto = [];
var Iluminacao = [];

//impressão
var aux1 = '';
var aux2 = '';
var aux3 = '';
var aux4 = '';
var aux5 = '';
var aux7 = '';
var AUX = true;
//impressão

var arrayy = [];

var C; 
var N; 
var V;  
var d;
var hx;
var hy;

var Pontos = [];
var Triangulos = [];

var Pl  = {a: 0, b: 0, c:0};
var ka;
var Ia  = {a: 0, b: 0, c:0};
var kd;
var Od  = {a: 0, b: 0, c:0};
var ks;
var Il  = {a: 0, b: 0, c:0};
var n;

var U;
var Normaltriangulo = [];
var Normalvertice= [];

var I;
var Pontosvista = [];
var Plvista = {a: 0, b: 0, c:0};

var Pontostela = [];
var larguraJanela = parseInt((window.getComputedStyle(canvas).width));
var alturaJanela = parseInt((window.getComputedStyle(canvas).height));

var PontosDesenhar = [];
var zBuffer = new Array (larguraJanela);
var vertices3d ;

var TriangulosR = [];
var PontosvistaR = [];
var PontostelaR = [];


function resizeCanvas() {
    canvas.width = parseFloat((window.getComputedStyle(canvas).width));
    canvas.height = parseFloat((window.getComputedStyle(canvas).height));
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.moveTo(0,0);
    for(var i = 0; i < PontosDesenhar.length-1; i++){
        if(PontosDesenhar[i].x < larguraJanela && PontosDesenhar[i].y < alturaJanela){
            var imgData = ctx.createImageData(1, 1);
            imgData.data[0] = parseInt(zBuffer[PontosDesenhar[i].x][PontosDesenhar[i].y].x.a);
            imgData.data[1] = parseInt(zBuffer[PontosDesenhar[i].x][PontosDesenhar[i].y].x.b);
            imgData.data[2] = parseInt(zBuffer[PontosDesenhar[i].x][PontosDesenhar[i].y].x.c);
            imgData.data[3] = 255;
            ctx.putImageData(imgData, PontosDesenhar[i].x, PontosDesenhar[i].y);

            /*ctx.beginPath();
            ctx.arc(PontosDesenhar[i].x, PontosDesenhar[i].y, 1, 0, 1 * Math.PI);
            ctx.fillStyle = 'rgb(' + parseInt(zBuffer[PontosDesenhar[i].x][PontosDesenhar[i].y].x.a) + ',' + parseInt(zBuffer[PontosDesenhar[i].x][PontosDesenhar[i].y].x.b) + ',' + parseInt(zBuffer[PontosDesenhar[i].x][PontosDesenhar[i].y].x.c) + ')';
            ctx.fill();*/
        }
    }
    ctx.stroke();
}


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
            resizeCanvas();
            Camera = cfgReader.result.split('\n');
            C = setVetor(Camera[0]);
            N = setVetor(Camera[1]);
            V = setVetor(Camera[2]);
            var vet = setVetor(Camera[3]);
            d = vet.a;
            hx = vet.b;
            hy = vet.c;
            console.log("Terminou camera");

        }
        cfgReader.readAsText(cfgTobeRead);

        txtReader.onload = function (e) {
            Iluminacao = txtReader.result.split('\n');
            Pl = setVetor(Iluminacao[0]);
            ka = Iluminacao[1];
            Ia = setVetor(Iluminacao[2]);
            kd = Iluminacao[3];
            Od = setVetor(Iluminacao[4]);
            ks = Iluminacao[5];
            Il = setVetor(Iluminacao[6]);
            n = Iluminacao[7];
            console.log("Terminou Iluminacao");

        }
        txtReader.readAsText(txtTobeRead);

        byuReader.onload = function (e) {
            Objeto = byuReader.result.split('\n');  //de 1 a vet[0]-1
            var vet = Objeto[0].split(' ');
            for(var i = 0; i < vet[0]; i ++){
                Pontos[i] = setVetor(Objeto[i+1]);
            }

            vet0 = parseInt(vet[0]) + 1;


            for(var i = 0; i < vet[1]; i++){ // de vet[0] a vet[1]-1
                Triangulos[i] = setVetor(Objeto[i + vet0]);
            }
            console.log("Terminou objeto com Pontos.length: " + Pontos.length + " e Triangulos.length: " + Triangulos.length);
        }
        byuReader.readAsText(byuTobeRead);



    }, false);

    var botao2 = document.getElementById('button2');
    botao2.addEventListener('click', function (e) {
        PontosDesenhar.length = 0;
        //Normalizar N
        N = normalizacao(N);
        
        //Ortogonalizar o vetor V
        var projecaoVN = projecao(V,N);
        V = {a: V.a - projecaoVN.a, b: V.b - projecaoVN.b, c: V.c - projecaoVN.c};

        //Normaizar V
        V = normalizacao(V);

        //Produto vetorial para achar U
        U = produtoVetorial(V,N);

        //Monta a matriz de mudança de base com U, V e N
        montarMatriz();

        //Posicao da fonte de luz de coordenadas de mundo para coordenadas de vista
        coordenadaVistaPl();

        //Cada ponto para coordenada de vista 
        coordenadasVistaPontos();
        console.log(C);
        console.log(Pontos);
        console.log(Pontosvista);

        //A normal dos vertices inicializada com 0
        for(var i = 0; i < Pontos.length; i++){
            Normalvertice[i] = {a: 0, b:0, c:0};
        }


        // A normal do triangulo
        for (var i = 0; i < Triangulos.length; i++){
            Normaltriangulo[i] = normalTriangulo(Triangulos[i]);
            normalVertice(i);
        }

        //Cada ponto para coordenada de tela
        coordenadasTela();

        //cortartriangulos();
        //definirtriangulos();

        inicioZbuffer();

        //Chamando o scanline para imprimir os pontos dos triangulos na tela
        scanLine();

        draw();

    }, false);
    
   
}

function definirtriangulos(){
    Triangulos.length = 0;
    PontosvistaR.length = 0;
    PontostelaR.length = 0;

    for(var i = 0; i < TriangulosR; i++){
        Triangulos[i] = TriangulosR[i];
    }

    for(var i = 0; i < PontosvistaR; i++){
        Pontosvista[i] = PontosvistaR[i];
    }

    for(var i = 0; i < PontostelaR; i++){
        Pontostela[i] = PontostelaR[i];
    }
}

function cortartriangulos (){ 
    for(var i in Triangulos){ 
        var p1 = Triangulos[i].a - 1; 
        var p2 = Triangulos[i].b - 1; 
        var p3 = Triangulos[i].c - 1; 
        var v1 = Pontostela[p1]; 
        var v2 = Pontostela[p2]; 
        var v3 = Pontostela[p3]; 
        var c1 = codificar(v1); 
        var c2 = codificar(v2); 
        var c3 = codificar(v3); 
        if(v1 === 0 && v2 === 0 && v3 === 0){ 
            var triangulo = {a: PontosvistaR.length, b: PontosvistaR.length+1, c: PontosvistaR.length+2};
            PontosvistaR.push(Pontosvista[p1]);
            PontosvistaR.push(Pontosvista[p2]);
            PontosvistaR.push(Pontosvista[p3]);
            PontostelaR.push(v1);
            PontostelaR.push(v2);
            PontostelaR.push(v3);
            TriangulosR.push(triangulo); 
        } else { 
            var A1 = vertice(v1, v2, c1, c2); 
            var A2 = vertice(v2, v3, c2, c3); 
            var A3 = vertice(v3, v1, c3, c1); 
            var A = criararray(A1, A2, A3);
            criartriangulo(A); 
        } 
    } 
} 

function codificar (v){
    var cod = 0;
    if(v.y < 0){ //Ponto acima da JS
            cod = 1;
    } else if (v.y > alturaJanela){ //Ponto abaixo da JS
            cod = 2;
    }
    if(v.x > larguraJanela){ //Ponto a direita da JS
            cod += 4;
    } else if (v.x < 0){ //Ponto a esquerda da JS
            cod += 8;
    }
    return cod;
}

function vertice(v1, v2, c1, c2){
  var auxVertice = [];
    if (c1 === 0 && c2 === 0) {
        auxVertice.push({x: v1.x, y: v1.y});
    auxVertice.push({x: v2.x, y: v2.y});
  } else if (c1!= 0 && c2!= 0) {
    auxVertice.push({x: -1, y: -1});
    auxVertice.push({x: -1, y: -1});
  } else {
    auxVertice = corte(v1,v2,c1,c2);
  }
  return auxVertice;
}

function corte(v1, v2, c1, c2) {
  var P = [];
  if (c1 == 8 || c1 == 9 || c1 == 10) {
    v1 = IntersecaoEsq(v1,v2);
  } else if (c2 == 8 || c2 == 9 || c2 == 10) {
    v2 = IntersecaoEsq(v1,v2);
  } 
  if (c1 == 4 || c1 == 5 || c1 == 6) {
    v1 = IntersecaoDir(v1,v2);
  } else if (c2 == 4 || c2 == 5 || c2 == 6) {
    v2 = IntersecaoDir(v1,v2);
  } 
  if (c1 == 1 || c1 == 5 || c1 == 9) {
    v1 = IntersecaoSup(v1,v2);
  } else if (c2 == 1 || c2 == 5 || c2 == 9) {
    v2 = IntersecaoSup(v1,v2);
  }
  if (c1 == 2 || c1 == 6 || c1 == 10) {
    v1 = IntersecaoInf(v1,v2);
  } else if (c2 == 2 || c2 == 6 || c2 == 10) {
    v2 = IntersecaoInf(v1,v2);
  }
  P.push({x:v1.x, y:v1.y});
  P.push({x:v2.x, y:v2.y});
  return P;
}


function IntersecaoEsq(v1, v2) {
  var x_int = 0;
  var m1 = (v2.y - v1.y) / (v2.x - v1.x); 
  var y_int = v1.y + (0 - v1.x) * m1;
  return {x: x_int, y: y_int};
}

function IntersecaoDir(v1, v2) {
  var x_int = larguraJanela;
  var m1 = (v2.y - v1.y) / (v2.x - v1.x); 
  var y_int = v1.y + (larguraJanela - v1.x) * m1;
  return {x: x_int, y: y_int};
}

function IntersecaoSup(v1, v2) {
  var m2 = (v2.x - v1.x) / (v2.y - v1.y);
  var x_int = v1.x + (alturaJanela - v1.y) * m2;
  var y_int = alturaJanela;
  return {x: x_int, y: y_int};
}

function IntersecaoInf(v1, v2) {
  var m2 = (v2.x - v1.x) / (v2.y - v1.y);
  var x_int = v1.x + (0 - v1.y) * m2;
  var y_int = 0;
  return {x: x_int, y: y_int};
}

function criararray(A1, A2, A3){
    var A = [];
    if(A1[0].X != -1){
        A.push(A1[0]);
    }
    if(A1[1].x != -1){
        A.push(A1[1])
    }
    if(A2[0].x != -1 && A2[0].x != A1[1].x && A2[0].y != A1[1].y){
        A.push(A2[0]);
    }
    if(A2[1].x != -1){
        A.push(A2[1]);
    }
    if(A3[0].x != -1 && A3[0].x != A2[1].x && A3[0].y != A2[1].y){
        A.push(A3[0]);
    }
    if(A3[1].x != -1 && A3[1].x != A1[0].x && A3[1].y != A1[0].y){
        A.push(A3[1]);
    }
    return A;
}

function criartriangulo(A){ //mudar isso pra se adequar a nova coisa
    if(A.length === 3){

        var triangulo = {a: PontostelaR.length, b: PontostelaR.length+1, c: PontostelaR.length+2};
        PontostelaR.push(A[0]);
        PontostelaR.push(A[1]);
        PontostelaR.push(A[2]);
        TriangulosR.push(triangulo);
        var pv1 = calcularponto3D(TriangulosR.length-1, A[0]);
        var pv2 = calcularponto3D(TriangulosR.length-1, A[1]);
        var pv3 = calcularponto3D(TriangulosR.length-1, A[2]);
        PontosvistaR.push(pv1);
        PontosvistaR.push(pv2);
        PontosvistaR.push(pv3);

    
    } else if(A.length === 4) {

        var triangulo = {a: PontostelaR.length, b: PontostelaR.length+1, c: PontostelaR.length+2};
        PontostelaR.push(A[0]);
        PontostelaR.push(A[1]);
        PontostelaR.push(A[2]);
        TriangulosR.push(triangulo);
        var pv1 = calcularponto3D(TriangulosR.length-1, A[0]);
        var pv2 = calcularponto3D(TriangulosR.length-1, A[1]);
        var pv3 = calcularponto3D(TriangulosR.length-1, A[2]);
        PontosvistaR.push(pv1);
        PontosvistaR.push(pv2);
        PontosvistaR.push(pv3);

        var triangulo2 = {a: PontostelaR.length, b: PontostelaR.length+1, c: PontostelaR.length+2};
        PontostelaR.push(A[2]);
        PontostelaR.push(A[3]);
        PontostelaR.push(A[0]);
        TriangulosR.push(triangulo2);
        var pv4 = calcularponto3D(TriangulosR.length-1, A[2]);
        var pv6 = calcularponto3D(TriangulosR.length-1, A[3]);
        var pv6 = calcularponto3D(TriangulosR.length-1, A[0]);
        PontosvistaR.push(pv4);
        PontosvistaR.push(pv5);
        PontosvistaR.push(pv6);

    } else if(A.length == 5) {

        var triangulo = {a: PontostelaR.length, b: PontostelaR.length+1, c: PontostelaR.length+2};
        PontostelaR.push(A[0]);
        PontostelaR.push(A[1]);
        PontostelaR.push(A[2]);
        TriangulosR.push(triangulo);
        var pv1 = calcularponto3D(TriangulosR.length-1, A[0]);
        var pv2 = calcularponto3D(TriangulosR.length-1, A[1]);
        var pv3 = calcularponto3D(TriangulosR.length-1, A[2]);
        PontosvistaR.push(pv1);
        PontosvistaR.push(pv2);
        PontosvistaR.push(pv3);

        var triangulo2 = {a: PontostelaR.length, b: PontostelaR.length+1, c: PontostelaR.length+2};
        PontostelaR.push(A[2]);
        PontostelaR.push(A[3]);
        PontostelaR.push(A[4]);
        TriangulosR.push(triangulo2);
        var pv4 = calcularponto3D(TriangulosR.length-1, A[2]);
        var pv5 = calcularponto3D(TriangulosR.length-1, A[3]);
        var pv6 = calcularponto3D(TriangulosR.length-1, A[4]);
        PontosvistaR.push(pv4);
        PontosvistaR.push(pv5);
        PontosvistaR.push(pv6);

        var triangulo3 = {a: PontostelaR.length, b: PontostelaR.length+1, c: PontostelaR.length+2};
        PontostelaR.push(A[4]);
        PontostelaR.push(A[0]);
        PontostelaR.push(A[2]);
        TriangulosR.push(triangulo3);
        var pv7 = calcularponto3D(TriangulosR.length-1, A[4]);
        var pv8 = calcularponto3D(TriangulosR.length-1, A[0]);
        var pv9 = calcularponto3D(TriangulosR.length-1, A[2]);
        PontosvistaR.push(pv7);
        PontosvistaR.push(pv8);
        PontosvistaR.push(pv9);
    }
}

function calcularponto3D(i, pixel){
    var alfa,beta,gama;
    var baricentricas = [];
    var p1 = parseInt(Triangulos[i].a - 1);
    var p2 = parseInt(Triangulos[i].b - 1);
    var p3 = parseInt(Triangulos[i].c - 1);
    var a = Pontostela[p1].x;
    var b = Pontostela[p2].x;
    var c = Pontostela[p3].x;
    var d = Pontostela[p1].y;
    var e = Pontostela[p2].y;
    var f = Pontostela[p3].y;
    var g = 1, h = 1, k = 1;
    var r1 = pixel.x, r2 = pixel.y, r3 = 1;
    var det =  ((a * e * k) + (b * f * g) + (c * d * h)) - ((c * e * g) + (a * f * h) + (b * d * k));
    var detAlfa = ((r1 * e * k) + (b * f * r3) + (c * r2 * h)) - ((c * e * r3) + (r1 * f * h) + (b * r2 * k));
    var detBeta = ((a * r2 * k) + (r1 * f * g) + (c * d * r3)) - ((c * r2 * g) + (a * f * r3) + (r1 * d * k));
    var detGama = ((a * e * r3) + (b * r2 * g) + (r1 * d * h)) - ((r1 * e * g) + (a * r2 * h) + (b * d * r3));
    
    if (det == 0) {
        // Divisão por zero! Não é possível completar a operação!
    } else {
        alfa = detAlfa /det;
        beta = detBeta / det;
        gama = detGama / det;
    }
    return pontoCorrespondente(i, alfa, beta, gama);
}

function subtracaovetores(vetor1, vetor2){
    var x = vetor1.a - vetor2.a;
    var y = vetor1.b - vetor2.b;
    var z = vetor1.c - vetor2.c;
    var vetor = {a: x, b: y, c: z};
    return vetor;
}

function multvetores(vetor, escalar){
    var x = vetor.a * escalar;
    var y = vetor.b * escalar;
    var z = vetor.c * escalar;
    vetor = {a: x, b: y, c: z};
    return vetor;
}

function setVetor(vetor){
    var Auxarray = vetor.split(' ');
    return {a: parseFloat(Auxarray[0]), b: parseFloat(Auxarray[1]), c: parseFloat(Auxarray[2])};
}

function produtoInterno(vetor1,vetor2) {
    var result = (vetor1.a * vetor2.a) + (vetor1.b * vetor2.b) + (vetor1.c * vetor2.c);
    return result;
}

function produtoVetorial(vetor1, vetor2) {
    var aux1 = (parseFloat(vetor1.b) * parseFloat(vetor2.c)) - ( parseFloat(vetor2.b) * parseFloat(vetor1.c));
    var aux2 = -1 * (( parseFloat(vetor1.a) * parseFloat(vetor2.c)) - ( parseFloat(vetor2.a) * parseFloat(vetor1.c)));
    var aux3 = ( parseFloat(vetor1.a) * parseFloat(vetor2.b)) - ( parseFloat(vetor2.a) * parseFloat(vetor1.b));
    return {a: aux1, b: aux2, c: aux3};
}

function projecao(V,N) {
    var produtoVN = produtoInterno(V,N);
    var produtoNN = produtoInterno(N,N);
    var VNN = {a: N.a * produtoVN, b: N.b * produtoVN, c: N.c * produtoVN};
    return {a: VNN.a / produtoNN, b: VNN.b / produtoNN, c: VNN.c / produtoNN};
}

function normalizacao(vetor) {
    var aux = Math.sqrt( parseFloat(vetor.a*vetor.a) + parseFloat(vetor.b*vetor.b) + parseFloat(vetor.c*vetor.c));
    return {a: vetor.a / aux, b: vetor.b / aux, c: vetor.c / aux};
}

function normalTriangulo(triangulo) {
    var vertice1 = Pontosvista[triangulo.a - 1];
    var vertice2 = Pontosvista[triangulo.b - 1];
    var vertice3 = Pontosvista[triangulo.c - 1];
    var P3P1 = {a: parseFloat(vertice3.a) - parseFloat(vertice1.a), b: parseFloat(vertice3.b) - parseFloat(vertice1.b), c: parseFloat(vertice3.c) - parseFloat(vertice1.c)};
    var P2P1 = {a: parseFloat(vertice2.a) - parseFloat(vertice1.a), b: parseFloat(vertice2.b) - parseFloat(vertice1.b), c: parseFloat(vertice2.c) - parseFloat(vertice1.c) };
    var vetorial = produtoVetorial(P3P1, P2P1);
    return normalizacao(vetorial);
}

function normalVertice(i){
    var p1 = Triangulos[i].a - 1;
    var p2 = Triangulos[i].b - 1;
    var p3 = Triangulos[i].c - 1;
    var Ta = Normaltriangulo[i].a;
    var Tb = Normaltriangulo[i].b;
    var Tc = Normaltriangulo[i].c;
    Normalvertice[p1] = {a: Normalvertice[p1].a + Ta, b: Normalvertice[p1].b + Tb,c: Normalvertice[p1].c + Tc};
    Normalvertice[p2] = {a: Normalvertice[p2].a + Ta, b: Normalvertice[p2].b + Tb,c: Normalvertice[p2].c + Tc};
    Normalvertice[p3] = {a: Normalvertice[p3].a + Ta, b: Normalvertice[p3].b + Tb,c: Normalvertice[p3].c + Tc};
}

// Não conseguimos usar 11 para representar Linha 1, coluna 1, então as colunas serão representadas de "aa" a "cc"
// [ aa ab ac ]
// [ ba bb bc ]
// [ ca cb cc ]

function montarMatriz(){
    I = {aa: U.a, ab: U.b, ac: U.c, ba: V.a, bb: V.b, bc: V.c, ca: N.a, cb: N.b, cc: N.c};
}

function coordenadasVistaPontos(){
    for(var i = 0; i < Pontos.length; i++){
        var matriz = {aa: Pontos[i].a - C.a, ba: Pontos[i].b - C.b, ca: Pontos[i].c - C.c};
        Pontosvista[i] = multMatrizes(matriz);;
    }
}

function coordenadaVistaPl(){
    var matriz = {aa: Pl.a - C.a, ba: Pl.b - C.b, ca: Pl.c - C.c};
    Plvista = multMatrizes(matriz);
    aux3 += Plvista.a + ' ' + Plvista.b + ' ' + Plvista.c;
}

function multMatrizes(matriz){
    var x = (I.aa * matriz.aa) + (I.ab * matriz.ba) + (I.ac * matriz.ca);
    var y = (I.ba * matriz.aa) + (I.bb * matriz.ba) + (I.bc * matriz.ca);
    var z = (I.ca * matriz.aa) + (I.cb * matriz.ba) + (I.cc * matriz.ca);
    return {a: parseFloat(x), b: parseFloat(y), c: parseFloat(z)};
}

function coordenadasTela(){
    var dhx = d/hx;
    var dhy = d/hy;
    for(var i = 0; i < Pontosvista.length; i++){
        var a = dhx * Pontosvista[i].a;
        var b = dhy * Pontosvista[i].b;
        a = a / Pontosvista[i].c;
        b = b / Pontosvista[i].c;
        a = (a + 1) * larguraJanela / 2;
        b = (1 - b) * alturaJanela / 2;
        Pontostela[i] = {x: parseInt(a), y: parseInt(b)};
    }
}

function scanLine(){
    for(var i = 0; i < Triangulos.length; i++){
        var p1 = Pontostela[parseInt(Triangulos[i].a) -1];
        var p2 = Pontostela[parseInt(Triangulos[i].b) -1];
        var p3 = Pontostela[parseInt(Triangulos[i].c) -1];
        var v1, v2, v3, v4;
        var ord = ordem(p1, p2, p3);
        v1 = ord[2];
        v2 = ord[1];
        v3 = ord[0];
        v4 = {x: parseInt(v1.x + (parseFloat(v2.y - v1.y) / parseFloat(v3.y - v1.y)) * (v3.x - v1.x)), y: parseInt(v2.y)};
        if (v2.y === v3.y) {
            Bottom(v1, v2, v3, i);
        } else if (v1.y === v2.y) {
            Top(v1, v2, v3, i);
        } else {
            Bottom(v1, v2, v4, i);
            Top(v2, v4, v3, i);
        }
    }
}

function ordem(p1, p2, p3){
    var ordem = [];
    var aux;
    ordem[0] = p1;
    ordem[1] = p2;
    ordem[2] = p3;
    if(p1.y >= p2.y && p1.y >= p3.y){
       if(p2.y === p3.y) {
            if(p2.x < p3.x) {
                ordem[1] = {x: p3.x, y: p3.y};
                ordem[2] = {x: p2.x, y: p2.y};
            } else {
                ordem[1] = {x: p2.x, y: p2.y};
                ordem[2] = {x: p3.x, y: p3.y};
            }
       } else if (p3.y > p2.y){
            ordem[1] = {x: p3.x, y: p3.y};
            ordem[2] = {x: p2.x, y: p2.y};
       }
    } else if (p2.y >= p1.y && p2.y >= p3.y){
        ordem[0] = p2;
        ordem[1] = p1;
        if(p1.y < p3.y){
            ordem[1] = p3;
            ordem[2] = p1;
        } else if (p1.y === p3.y) {
            if (p1.x < p3.x) {
                ordem[1] = p3;
                ordem[2] = p1;
            } else {
                ordem[1] = p1;
                ordem[2] = p3;
            }
        }
    } else if(p3.y >= p1.y && p3.y >= p2.y){
        ordem [0] = p3;
        ordem[2] = p1;
        if(p2.y < p1.y){
            ordem[1] = p1;
            ordem[2] = p2;
        } else if (p2.y === p1.y) {
            if (p2.x < p1.x) {
                ordem[1] = p1;
                ordem[2] = p2;
            } else {
                ordem[1] = p2;
                ordem[2] = p1;
            }
        }
    }
    return ordem;
}

function Top(v1, v2, v3, i){
    var invislope1 = (v3.x - v1.x) / (v3.y - v1.y);
    var invislope2 = (v3.x - v2.x) / (v3.y - v2.y);
    var curx1 = v3.x;
    var curx2 = v3.x;
    for(var scanlineY = v3.y; scanlineY >= v1.y; scanlineY--, i){
        desenharPontos(parseInt(curx1), parseInt(curx2),scanlineY, i, v1, v2, v3);
        curx1 -= invislope1;
        curx2 -=invislope2;
    }
}
function Bottom(v1, v2, v3, i){
    var invislope1 = (v2.x - v1.x) / (v2.y - v1.y);
    var invislope2 = (v3.x - v1.x) / (v3.y - v1.y);
    var curx1 = v1.x;
    var curx2 = v1.x; 
    for(var scanlineY = v1.y; scanlineY <= v2.y; scanlineY++, i){
        desenharPontos( parseInt(curx1), parseInt(curx2), scanlineY, i, v1, v2, v3);
        curx1 += invislope1;
        curx2 += invislope2;
    }
}

function desenharPontos(curx1, curx2, b, i, v1, v2, v3){
    if(curx1 > curx2){
        var aux = curx1;
        curx1 = curx2;
        curx2 = aux;
    }
    for(var a = curx1; a <= curx2; a++){
        var pixel = {x: a, y: b};
        if(pixel != v1 && pixel != v2 && pixel != v3){
            coordenadasBaricentricas(i, pixel);
        }
        PontosDesenhar.push(pixel);
    }
}

function inicioZbuffer(){
    var cor = {a: 0, b: 0, c: 0};
    for(var i = 0; i < larguraJanela; i++){
        zBuffer[i] = [];
    }
    for(var i = 0; i < larguraJanela; i++){
        var a = [];
        for(var j = 0; j < alturaJanela; j++){
            a[j] = {x: {a: 0, b: 0, c: 0}, y: 99999999};
        }
        zBuffer[i] = a;
    }
}

function coordenadasBaricentricas(i, pixel){
    var alfa,beta,gama;
    var baricentricas = [];
    var p1 = parseInt(Triangulos[i].a - 1);
    var p2 = parseInt(Triangulos[i].b - 1);
    var p3 = parseInt(Triangulos[i].c - 1);
    var a = Pontostela[p1].x;
    var b = Pontostela[p2].x;
    var c = Pontostela[p3].x;
    var d = Pontostela[p1].y;
    var e = Pontostela[p2].y;
    var f = Pontostela[p3].y;
    var g = 1, h = 1, k = 1;
    var r1 = pixel.x, r2 = pixel.y, r3 = 1;
    var det =  ((a * e * k) + (b * f * g) + (c * d * h)) - ((c * e * g) + (a * f * h) + (b * d * k));
    var detAlfa = ((r1 * e * k) + (b * f * r3) + (c * r2 * h)) - ((c * e * r3) + (r1 * f * h) + (b * r2 * k));
    var detBeta = ((a * r2 * k) + (r1 * f * g) + (c * d * r3)) - ((c * r2 * g) + (a * f * r3) + (r1 * d * k));
    var detGama = ((a * e * r3) + (b * r2 * g) + (r1 * d * h)) - ((r1 * e * g) + (a * r2 * h) + (b * d * r3));
    
    if (det == 0) {
        // Divisão por zero! Não é possível completar a operação!
    } else {
        alfa = detAlfa /det;
        beta = detBeta / det;
        gama = detGama / det;
    }
    consultaZbuffer(i,pixel, alfa, beta, gama);
}


// funcao que calcula o ponto correspondente ao pixel em coordenadas de mundo
function pontoCorrespondente(i, alfa, beta, gama){
    var v1 = Pontosvista[parseInt(Triangulos[i].a - 1)];
    var v2 = Pontosvista[parseInt(Triangulos[i].b - 1)];
    var v3 = Pontosvista[parseInt(Triangulos[i].c - 1)];
    var x = parseFloat(alfa * v1.a) + parseFloat(beta * v2.a) + parseFloat(gama * v3.a);
    var y = parseFloat(alfa * v1.b) + parseFloat(beta * v2.b) + parseFloat(gama * v3.b);
    var z = parseFloat(alfa * v1.c) + parseFloat(beta * v2.c) + parseFloat(gama * v3.c);
    var p = {a: x, b: y, c: z};
    return p;
}

//funcao que calcula a distancia do ponto p ate a camera
function consultaZbuffer(i,pixel, alfa, beta, gama){
    var pontocorrespondente = pontoCorrespondente(i, alfa, beta, gama);
    if(pixel.x < larguraJanela && pixel.y < alturaJanela && pontocorrespondente.c < zBuffer[pixel.x][pixel.y].y){
        Phong(pontocorrespondente, i, pixel, alfa, beta, gama);
    }
}
function normalpontocorrespondente(i, alfa, beta, gama){
    var p1 = parseInt(Triangulos[i].a - 1);
    var p2 = parseInt(Triangulos[i].b - 1);
    var p3 = parseInt(Triangulos[i].c - 1);
    var normalv1 = Normalvertice[p1];
    var normalv2 = Normalvertice[p2];
    var normalv3 = Normalvertice[p3];
    var x = parseFloat(alfa * normalv1.a) + parseFloat(beta * normalv2.a) + parseFloat(gama * normalv3.a);  //alfa beta e gama serao enviados em um array;
    var y = parseFloat(alfa * normalv1.b) + parseFloat(beta * normalv2.b) + parseFloat(gama * normalv3.b);
    var z = parseFloat(alfa * normalv1.c) + parseFloat(beta * normalv2.c) + parseFloat(gama * normalv3.c);
    var N = {a: x, b: y, c: z};
    return N;
}



function Phong(pontocorrespondente,i,pixel, alfa, beta, gama){
    var normal, produtodifusa, produtoespecular,potenciaespecular, cor;
    var ambiental, difusa, especular;
    var escalarespecular;
    var L = subtracaovetores(Plvista, pontocorrespondente);
    var V = multvetores(pontocorrespondente, -1);
    var N = normalpontocorrespondente(i, alfa, beta, gama);
    L = normalizacao(L);
    V = normalizacao(V);
    N = normalizacao(N);
    
    produtonormal = produtoInterno(V,N);
    if(produtonormal < 0){
        N = multvetores(N, -1);
    }
    produtodifusa = produtoInterno(N,L);
    
    var escalardifusa = (kd * produtodifusa);
    ambiental = multvetores(Ia,ka);
    difusa = multvetores(Od, escalardifusa);
    difusa.a *= Il.a;
    difusa.b *= Il.b;
    difusa.c *= Il.c;
    
    
    if(produtodifusa < 0){
        difusa = {a: 0, b: 0, c: 0};
        especular = {a: 0, b: 0, c: 0};
    } else {
        var a = 2 * produtodifusa;
        var b = multvetores(N,a);
        var R = subtracaovetores(b,L);
        R = normalizacao(R);
        
        produtoespecular = produtoInterno(R,V);
        potenciaespecular = Math.pow(produtoespecular,n);
        escalarespecular = (ks * potenciaespecular);
        
        if(produtoespecular < 0){
            especular = {a: 0, b: 0, c: 0};
        }
        else{
            especular = multvetores(Il, escalarespecular); 
        }
        
    }
    cor = somavetor(ambiental,difusa,especular);
    
        if(cor.a > 255){
            cor.a = 255;
        }
        if(cor.b > 255){
            cor.b = 255;
        }
        if(cor.c > 255){
            cor.c = 255;
        }

    var buffer = {x: cor, y: pontocorrespondente.c};
    zBuffer[pixel.x][pixel.y] = buffer;


}
    
function somavetor(vetor1,vetor2, vetor3){
    var x = vetor1.a + vetor2.a + vetor3.a;
    var y = vetor1.b + vetor2.b + vetor3.b;
    var z = vetor1.c + vetor2.c + vetor3.c;
    var vetor = {a: x, b: y, c: z};
    return vetor;
}
