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

            //A normal dos vertices inicializada com 0
            for(var i = 0; i < Pontos.length; i++){
                Normalvertice[i] = {a: 0, b:0, c:0};
            }


            // A normal do triangulo
            for (var i = 0; i < Triangulos.length; i++){
                Normaltriangulo[i] = normalTriangulo(Triangulos[i]);
                normalVertice(i);
            }
        }
        byuReader.readAsText(byuTobeRead);



    }, false);

    var botao2 = document.getElementById('button2');
    botao2.addEventListener('click', function (e) {

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

        //Cada ponto para coordenada de tela
        coordenadasTela();

        inicioZbuffer();

        //Chamando o scanline para imprimir os pontos dos triangulos na tela
        scanLine();

        draw();

        /*imprimir();*/

    }, false);
    
   
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
    var vertice1 = Pontos[triangulo.a - 1];
    var vertice2 = Pontos[triangulo.b - 1];
    var vertice3 = Pontos[triangulo.c - 1];
    var P3P1 = {a: parseFloat(vertice3.a) - parseFloat(vertice1.a), b: parseFloat(vertice3.b) - parseFloat(vertice1.b), c: parseFloat(vertice3.c) - parseFloat(vertice1.c)};
    var P2P1 = {a: parseFloat(vertice2.a) - parseFloat(vertice1.a), b: parseFloat(vertice2.b) - parseFloat(vertice1.b), c: parseFloat(vertice2.c) - parseFloat(vertice1.c) };
    var vetorial = produtoVetorial(P2P1, P3P1);
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

//A parte de impressão será removida do projeto final, serve apenas para facilitar nossa vida e a vida dos monitores na correção

function imprimir (){
    var auxT;
    aux3 = larguraJanela + ' ' + alturaJanela + '\n';
    aux3 += zBuffer.length + '\n';
    aux3 += zBuffer[0].length + '\n';
    for(var i in zBuffer){
        for(var j in zBuffer){
            aux3 += zBuffer[i][j].y + ' ';
        }
        aux3 += '\n';
    }

    /*aux2 += Pontos.length + ' ' + Triangulos.length + '\n';
    auxT = aux2;
    aux = 'Objeto: \n';
    for(var i = 0; i < Pontos.length; i ++){
        aux += 'Ponto ' + (i+1) + ': ' + Pontos[i].a + '  ' + Pontos[i].b + '  ' + Pontos[i].c + '\n';
    }
    for(var i = 0; i < Triangulos.length; i++){
        aux += 'Triangulo ' + (i+1) + ': ' + Triangulos[i].a + '  ' + Triangulos[i].b + '  ' + Triangulos[i].c + '\n';
    }*/
    /*aux += 'Iluminacao: \n';
    aux += 'Pl: ' + Pl.a + ' ' + Pl.b + ' ' + Pl.c + '\n';
    aux += 'ka: ' + ka + '\n';
    aux += 'Ia: ' + Ia.a + ' ' + Ia.b + ' ' + Ia.c + '\n';
    aux += 'kd: ' + kd + '\n';
    aux += 'Od: ' + Od.a + ' ' + Od.b + ' ' + Od.c + '\n';
    aux += 'ks: ' + ks + '\n';
    aux += 'Il: ' + Il.a + ' ' + Il.b + ' ' + Il.c + '\n';
    aux += 'n: ' + n + '\n';
    auxT += aux ;*/

    
    /*aux3 = 'Vetor N(normalizado): ' + N.a + '  ' + N.b + '  ' + N.c + '\n';
    aux3 += 'Vetor V(ortogonalizado + normalizado): ' + V.a + '  ' + V.b + '  ' + V.c + '\n';
    aux3 += 'Vetor U: ' + U.a + '  ' + U.b + '  ' + U.c + '\n';
    auxT += '\n\n 3º Preparar a câmera:\n' + aux3;
    for (var i = 0; i < Triangulos.length; i++){
        aux4 += 'Normaltriangulo ' + (i+1) + ': ' + Normaltriangulo[i].a + '  ' + Normaltriangulo[i].b + '  ' + Normaltriangulo[i].c + '\n';
    }
    for(var i = 0; i < Pontos.length; i++){
        aux4 += 'Normalvertice ' + (i+1) + ': ' + Normalvertice[i].a + '  ' + Normalvertice[i].b + '  ' + Normalvertice[i].c + '\n';
    }
    auxT += '\n\n 4º Calcular a normal do triângulo e dos vérties: \n ' + aux4; 
    aux5 = 'Cordenada de vista Pl: ' + Plvista.a + '  ' + Plvista.b + '  ' + Plvista.c + '\n';
    for(var i = 0; i < Pontos.length; i++){
        aux5 += 'Pontosvista ' + (i+1) + ': ' + Pontosvista[i].a + '  ' + Pontosvista[i].b + '  ' + Pontosvista[i].c + '\n';
    }
    auxT += '\n\n 5º Fazer a mudança de coordenadas de mundo para coordenadas de vista: \n ' + aux5; 
    var aux6 = '2º ENTREGA \n';
    for (var i  = 0; i < Pontostela.length; i++){
        aux6 += 'PontosTela ' + (i+1) + ': ' + Pontostela[i].x + ' ' + Pontostela[i].y + '\n'; 
    }
  /*  for(var i = 0; i < PontosDesenhar.length; i++){    
        //aux7 += 'PontosDesenhar ' + (i+1) + ': ' + PontosDesenhar[i].x + ' ' + PontosDesenhar[i].y + '\n'; 
        aux7 += 'PontosDesenhar ' + (i+1) + ': ' + PontosDesenhar[i].x + ' ' + PontosDesenhar[i].y + '\n'; 
    } */

    /*auxT += aux6;
    auxT += PontosDesenhar.length + '\n';
    auxT += aux7;*/
    var content = document.getElementById('content'); 
    content.innerText = aux3; 
}

/*setInterval(() => {
  draw();
}, 1/1000);*/