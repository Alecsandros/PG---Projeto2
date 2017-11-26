var camera = [];
var objeto = [];
var iluminacao = [];
var aux;
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
            var cfgContents = document.getElementById('cfgcontents');  //Imprimir
            for(var i = 0; i < camera.length; i++){   //imprimir
            	aux = aux + camera[i]; 
            } 
            cfgContents.innerText = aux; //imprimir
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

