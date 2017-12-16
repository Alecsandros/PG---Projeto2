var canvas = document.getElementById("canvas");
//var ctx = canvas.getContext("2d");
var DesenharPontos = [];

var auxArray = [];
var camera = [];
var objeto = [];
var iluminacao = [];

//impressão
var aux1 = '';
var aux2 = '';
var aux3 = '';
var aux4 = '';
var aux5 = '';
var aux7 = '';
var t = '';
//impressão

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

var I;
var PontosVista = [];
var PlVista;

var PontosTela = [];
var larguraJanela = 1000; //MUDAR N ESQUECER
var alturaJanela = 1000; //MUDAR N ESQUECER

var PontosDesenhar = [];

function resizeCanvas() {
  canvas.width = parseFloat((window.getComputedStyle(canvas).width));
  canvas.height = parseFloat((window.getComputedStyle(canvas).height));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
            camera = cfgReader.result.split('\n');
            C = setVetor(camera[0]);
            N = setVetor(camera[1]);
            V = setVetor(camera[2]);
            var vet = setVetor(camera[3]);
            d = vet.a;
            hx = vet.b;
            hy = vet.c;

            //imprimir
            aux2 = '1º Carregar arquivos (objeto(s), iluminação e câmera): \n Camera: \n';
            aux2 += 'C: ' + C.a + ' ' + C.b + ' ' + C.c + '\n';
            aux2 += 'Vetor N: ' + N.a + ' ' + N.b + ' ' + N.c + '\n';
            aux2 += 'Vetor V: ' + V.a + ' ' + V.b + ' ' + V.c + '\n';
            aux2 += 'd: ' + d + ' hx: ' + hx + ' hy: ' + hy + '\n';
            //imrpimir
            
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
            MontarMatriz();

            /*imprimir();*/

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

            //Cada ponto para coordenada de vista 
            CoodenadasVistaPontos();

            //Cada ponto para coordenada de tela
            CoordenadasTela()

            //Chamando o scanline para imprimir os pontos dos triangulos na tela
            Scanline();

           /* imprimir();*/
            
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

            //Posicao da fonte de luz de coordenadas de mundo para coordenadas de vista
            CoodenadaVistaPl();


            /*imprimir();*/

        }
        txtReader.readAsText(txtTobeRead);

    }, false);
    
   
}

function setVetor(vetor){
    var auxArray = vetor.split(' ');
    return {a: parseFloat(auxArray[0]), b: parseFloat(auxArray[1]), c: parseFloat(auxArray[2])};
}

function produtoInterno(vetor1,vetor2) {
    var result = (vetor1.a * vetor2.a) + (vetor1.b * vetor2.b) + (vetor1.c * vetor2.c);
    return result;
}

function produtoVetorial(vetor1, vetor2) {
    var aux1 = (vetor1.b * vetor2.c) - (vetor2.b * vetor1.c);
    var aux2 = -1 * ((vetor1.a * vetor2.c) - (vetor2.a * vetor1.c));
    var aux3 = (vetor1.a * vetor2.b) - (vetor2.a * vetor1.b);
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

// Não conseguimos usar 11 para representar Linha 1, coluna 1, então as colunas serão representadas de "aa" a "cc"
// [ aa ab ac ]
// [ ba bb bc ]
// [ ca cb cc ]

function MontarMatriz(){
    I = {aa: U.a, ab: U.b, ac: U.c, ba: V.a, bb: V.b, bc: V.c, ca: N.a, cb: N.b, cc: N.c};
}

function CoodenadasVistaPontos(){
    for(var i = 0; i < Pontos.length; i++){
        var matriz = {aa: Pontos[i].a - C.a, ba: Pontos[i].b - C.b, ca: Pontos[i].c - C.c};
        PontosVista[i] = multmatrizes(matriz);;
    }
}

function CoodenadaVistaPl(){
    var matriz = {aa: Pl.a - C.a, ba: Pl.b - C.b, ca: Pl.c - C.c};
    PlVista = multmatrizes(matriz);
}

function multmatrizes(matriz){
    var x = (I.aa * matriz.aa) + (I.ab * matriz.ba) + (I.ac * matriz.ca);
    var y = (I.ba * matriz.aa) + (I.bb * matriz.ba) + (I.bc * matriz.ca);
    var z = (I.ca * matriz.aa) + (I.cb * matriz.ba) + (I.cc * matriz.ca);
    return {a: x, b: y, c: z};
}

function CoordenadasTela(){
    for(var i = 0; i < PontosVista.length; i++){
        var a = (d/hx) * PontosVista[i].a;
        var b = (d/hy) * PontosVista[i].b;
        a = a / PontosVista[i].c;
        b = b / PontosVista[i].c;
        a = (a + 1) * larguraJanela / 2;
        b = (1 - b) * alturaJanela / 2;
        PontosTela[i] = {x: parseInt(a), y: parseInt(b)};
    }
}

function Scanline(){
    for(var i = 0; i < Triangulos.length; i++){
    	var p1 = PontosTela[parseInt(Triangulos[i].a) -1];
        var p2 = PontosTela[parseInt(Triangulos[i].b) -1];
        var p3 = PontosTela[parseInt(Triangulos[i].c) -1];
        var v1, v2, v3, v4;
        var ord = ordem(p1, p2, p3);
        v1 = ord[2];
        v2 = ord[1];
        v3 = ord[0];
        //NÃO ESQUECER DE MUDAR PARA PARSEINTTTTTT
        v4 = {x: parseInt(v1.x + (parseFloat(v2.y - v1.y) / parseFloat(v3.y - v1.y)) * (v3.x - v1.x)), y: parseInt(v2.y)};
        Bottom(v1, v2, v4);
        Top(v2, v4, v3);
    }
}

function ordem(p1, p2, p3){
    var ordem = [];
    var aux;
    ordem[0] = p1;
    ordem[1] = p2;
    ordem[2] = p3;
    if(p1.y >= p2.y && p1.y >= p3.y){
       if(p3.y >= p2.y){
            ordem[1] = {x: p3.x, y: p3.y};
            ordem[2] = {x: p2.x, y: p3.y};
       }
    } else if (p2.y >= p1.y && p2.y >= p3.y){
        ordem[0] = p2;
        ordem[1] = p1;
        if(p1.y < p3.y){
            ordem[1] = p3;
            ordem[2] = p1;
        }
    } else if(p3.y >= p1.y && p3.y >= p2.y){
        ordem [0] = p3;
        ordem[2] = p1;
        if(p2.y < p1.y){
            ordem[1] = p1;
            ordem[2] = p2;
        }
    }
    return ordem;
}

function Top(v1, v2, v3){
    var invislope1 = (v3.x - v1.x) / (v3.y - v1.y);
    var invislope2 = (v3.x - v2.x) / (v3.y - v2.y);
    var curx1 = v3.x;
    var curx2 = v3.x; 
    for(var scanlineY = v3.y; scanlineY > v1.y; scanlineY--){
        desenharPontos(curx1, scanlineY, curx2);
        curx1 -= invislope1;
        curx2 -= invislope2;
    }
}
function Bottom(v1, v2, v3){
    var invislope1 = (v2.x - v1.x) / (v2.y - v1.y);
    var invislope2 = (v3.x - v1.x) / (v3.y - v1.y);
    var curx1 = v1.x;
    var curx2 = v1.x; 
    t += invislope1 + ' ' + invislope2 + ' ' + curx1 + ' ' + curx2;
    var content = document.getElementById('content'); 
    content.innerText = t; 
    for(var scanlineY = v1.y; scanlineY <= v2.y; scanlineY++){
        desenharPontos(curx1, scanlineY, curx2);
        curx1 += invislope1;
        curx2 += invislope2;
    }
}

function desenharPontos(curx1, b, curx2){
    for(var a = curx1; a <= curx2; a++){
        var ponto = {x: a, y: b};
        PontosDesenhar.push(ponto);
        //draw();
    }
}

//A parte de impressão será removida do projeto final, serve apenas para facilitar nossa vida e a vida dos monitores na correção

function imprimir (){
    var auxT;
    auxT = aux2;
    aux = 'Objeto: \n';
    for(var i = 0; i < Pontos.length; i ++){
        aux += 'Ponto ' + (i+1) + ': ' + Pontos[i].a + '  ' + Pontos[i].b + '  ' + Pontos[i].c + '\n';
    }
    for(var i = 0; i < Triangulos.length; i++){
        aux += 'Triangulo ' + (i+1) + ': ' + Triangulos[i].a + '  ' + Triangulos[i].b + '  ' + Triangulos[i].c + '\n';
    }
    aux += 'Iluminacao: \n';
    aux += 'Pl: ' + Pl.a + ' ' + Pl.b + ' ' + Pl.c + '\n';
    aux += 'ka: ' + ka + '\n';
    aux += 'Ia: ' + Ia.a + ' ' + Ia.b + ' ' + Ia.c + '\n';
    aux += 'kd: ' + kd + '\n';
    aux += 'Od: ' + Od.a + ' ' + Od.b + ' ' + Od.c + '\n';
    aux += 'ks: ' + ks + '\n';
    aux += 'Il: ' + Il.a + ' ' + Il.b + ' ' + Il.c + '\n';
    aux += 'n: ' + n + '\n';
    auxT += aux ;

    
    aux3 = 'Vetor N(normalizado): ' + N.a + '  ' + N.b + '  ' + N.c + '\n';
    aux3 += 'Vetor V(ortogonalizado + normalizado): ' + V.a + '  ' + V.b + '  ' + V.c + '\n';
    aux3 += 'Vetor U: ' + U.a + '  ' + U.b + '  ' + U.c + '\n';
    auxT += '\n\n 3º Preparar a câmera:\n' + aux3;


    for (var i = 0; i < Triangulos.length; i++){
        aux4 += 'NormalTriangulo ' + (i+1) + ': ' + NormalTriangulo[i].a + '  ' + NormalTriangulo[i].b + '  ' + NormalTriangulo[i].c + '\n';
    }
    for(var i = 0; i < Pontos.length; i++){
        aux4 += 'NormalVertice ' + (i+1) + ': ' + NormalVertice[i].a + '  ' + NormalVertice[i].b + '  ' + NormalVertice[i].c + '\n';
    }
    auxT += '\n\n 4º Calcular a normal do triângulo e dos vérties: \n ' + aux4; 

    aux5 = 'Cordenada de vista Pl: ' + PlVista.a + '  ' + PlVista.b + '  ' + PlVista.c + '\n';

    for(var i = 0; i < Pontos.length; i++){
        aux5 += 'PontosVista ' + (i+1) + ': ' + PontosVista[i].a + '  ' + PontosVista[i].b + '  ' + PontosVista[i].c + '\n';
    }
    auxT += '\n\n 5º Fazer a mudança de coordenadas de mundo para coordenadas de vista: \n ' + aux5; 

    var aux6 = '2º ENTREGA \n' + PontosTela.length;
    for (var i  = 0; i < PontosTela.length; i++){
        aux6 += 'PontosTela ' + (i+1) + ': ' + PontosTela[i].x + ' ' + PontosTela[i].y + '\n'; 
    }

    for(var i = 0; i < PontosDesenhar.length; i++){
    	aux7 += 'PontosDesenhar ' + (i+1) + ': ' + PontosDesenhar.x + ' ' + PontosDesenhar.y + '\n';
    }

    auxT += aux6;
    auxT += aux7;
    var content = document.getElementById('content'); 
    content.innerText = auxT; 
}