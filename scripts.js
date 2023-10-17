//  SCRIPT PARA AGREGAR Y ELIMINAR PERIODOS
var count = 3

$(document).ready(function() {
    $("#agregarCampo").click(function() {
        // Crea un nuevo campo de entrada con un botón "Eliminar" y lo agrega a "camposExtra"
        var nuevoCampo = `
            <div class="form-group">
                <label for="periodo${count}">Periodo ${count}:</label>
                <input type="text" class="form-control" name="periodo${count}" id="periodo${count}" required>
                
            </div>
        `;
        $("#camposExtra").append(nuevoCampo);
        count++
    });

    $("#eliminarCampo").click(function() {
        // Elimina el último campo de entrada
        $("#camposExtra .form-group:last").remove();
        if(count>3){
            count--
        }
    });

});

//============================================================  PRI  ==========================================================================
function calcularPRI(){
    var valores = [];
    valores.push(parseFloat(document.getElementById('inversionI').value))
    for (var i = 1; i <= count; i++) {
        var input = document.getElementById('periodo' + i);
        if (input) {
            valores.push(parseFloat(input.value));
        }
    }
    
    var II = valores[0];
    var a =0;  var c = 0;    var d = 0;
    var aux = 0;
    for (var i=1; i<valores.length; i++){
        aux += valores[i];
        if (aux >= II){
            a=i-1;
            c=aux-valores[i];
            d=valores[i];
            break;
        }
    }
    var resultado = a+((II-c)/d);
    var dec = resultado % 1;
    dec = dec*12;
    var meses = parseInt(dec);
    dec-=meses;
    dec= dec*30;
    var dias = parseInt(dec);
    dec-=dias;
    dec = dec*24;
    var horas = parseInt(dec);
    dec-=horas;
    dec = dec*60;
    var minutos = parseInt(dec);

    $("#solucion .form-group:last").remove();
    $("#solucion").append(`
    <div class="form-group">
        <p mt-10>Resultado: ${resultado} <br>Resultado: ${parseInt(resultado)} años, ${meses} meses, ${dias} dias, ${horas} horas y ${minutos} minutos.</p>
    </div>`);
    event.preventDefault();

}

function obtenerflujos() {
    var valores = [];
    valores.push(parseFloat(document.getElementById('inversionI').value));

    var interesInput = document.getElementById('interes');
    if (interesInput) {
        valores.push(parseFloat(interesInput.value));
    }
    else{
        valores.push(0.0)
    }
    
    for (var i = 1; i <= count; i++) {
        var input = document.getElementById('periodo' + i);
        if (input) {
            valores.push(parseFloat(input.value));
        }
    }
    return valores;
}


//=========================================================     VPN     =======================================================
function calcularVPN(){
    //La inversion es la inversion inicial, el vector son los flujos de efectivo y el interes el interes a usar en esa iteracion
    var flujos = [] 
    flujos = obtenerflujos();
    var II = flujos[0];
    var interes = flujos[1];
    interes /=100; 
    var valorpn = VPN(II,flujos,interes);

    $("#solucion .form-group:last").remove();
    $("#solucion").append(`
    <div class="form-group">
        <p mt-10>Resultado: ${valorpn.toFixed(4)}</p>
    </div>`);

    event.preventDefault();
    return valorpn;
}

function VPN(II, flujos = [] ,interes){
    let sumaFe = 0.0;
    for(let i = 2; i < flujos.length; i++){
        sumaFe += flujos[i] / Math.pow((1+interes),(i-1));
    }
    var valorvpn = sumaFe - II;
    return valorvpn
}

//==========================================================    VAE     =====================================================
function calcularVAE(){
    var flujos = []
    flujos = obtenerflujos();
    var VPN = calcularVPN();
    var interes =  flujos[1];
    interes/=100;
    var n = flujos.length-2;
    var VAE = (VPN*interes)/(1-(1/Math.pow((1+interes),(n))));

    var imagenResultado = document.getElementById('imagenResultado');
    
    if (VAE > 0) {
        imagenResultado.src = 'positivo.jpg';
    } else {
        //imagenResultado.src = 'imagen_negativa.jpg';
    }

    $("#solucion .form-group:last").remove();
    $("#solucion").append(`
    <div class="form-group">
        <p mt-10>Resultado: ${VAE.toFixed(4)}</p>
    </div>`);

    event.preventDefault();
}

//==========================================================    TIR     ==============================================================
function calcularTIR(){
    var flujos = [];
    flujos = obtenerflujos();
    var II = flujos[0];
    let iSuperior = 0.0;
    let iInferior = 0.0;
    let vpnSuperior = 0.0;
    let vpnInferior = 0.0;
    for(var j = 0; j < 100; j++){
        vpnSuperior = VPN(II,flujos,j*0.01);
        vpnInferior = VPN(II, flujos, (j+1)*0.01);
        if(vpnSuperior * vpnInferior < 0){
            iSuperior = j * 0.01;
            iInferior = (j + 1) * 0.01;
            break;
        }
    }
    let interTIR = iSuperior + (iInferior - iSuperior) * (vpnSuperior/(vpnSuperior-vpnInferior));
    interTIR *= 100;

    $("#solucion .form-group:last").remove();
    $("#solucion").append(`
    <div class="form-group">
        <p mt-10>Resultado: ${interTIR.toFixed(4)}</p>
    </div>`);

    event.preventDefault();
}