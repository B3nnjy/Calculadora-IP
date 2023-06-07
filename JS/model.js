class Ip {
    constructor(ip, cid, subredes){
        this.Ip = ip;
        this.subRedes = subredes;

        if(subredes){
            this.Cid = this.newCid(subredes);
        }else{
            this.Cid = cid;
        }

        this.clase = this.Clase();
        this.originalMask = this.OriginalMask();
        this.binaryMask = this.BinaryMask();
        this.decimalMask = this.DecimalMask();

        this.numSubRed = this.NumSubRed();
        this.saltos = this.Saltos();
        this.numHosts = this.saltos-2;
        this.network = this.Network();
        this.busqueda = new Object();
        this.numBusqueda = 0;
        this.subRedes = new Array();

        if (subredes) {
            this.SubRed(1000);
        }else{
            this.SubRed(this.numSubRed-1);            
        }
    }

    newCid(subredes){
        const bit = Math.ceil(Math.log2(subredes));
        let cidr;

        switch(this.Clase()){
            case "A":
                cidr = 8;
                break;
            case "B":
                cidr = 16;
                break;
            case "C":
                cidr = 24;
                break;
        }

        return cidr + bit; 
    }

    Clase(){
        if(this.Ip[0] >= 1 && this.Ip[0] <= 126){
            return("A");
        }else if(this.Ip[0] >= 128 && this.Ip[0] <= 191){
            return("B");
        }else if(this.Ip[0] >= 192 && this.Ip[0] <= 223){
            return("C");
        }
    }

    DecimalMask(){
        let decimalMask = new Array();
        this.binaryMask.map((item) => {
            decimalMask.push(this.BinaryToDecimal(item));
        });

        return decimalMask;
    }

    BinaryMask(){
        let binaryMask = new Array();
        this.originalMask.map((item) => {
            binaryMask.push(this.DecimalToBinary(item));
        })

        this.MaskOfCid(binaryMask);

        return binaryMask;
    }

    NumSubRed(){
        switch (this.clase) {
            case "A":
                return Math.pow(2, this.Cid-8);        
            case "B":
                return Math.pow(2, this.Cid-16);        
            case "C":
                return Math.pow(2, this.Cid-24);        
            default:
                break;
        }
    }

    Saltos(){
        const pot = 32-this.Cid;
        switch (this.clase) {
            case "A":
                return this.Cid >= 8 ? Math.pow(2, pot) : Math.pow(2, 32-8);        
            case "B":
                return this.Cid >= 16 ? Math.pow(2, pot) : Math.pow(2, 32-16);        
            case "C":
                return this.Cid >= 24 ? Math.pow(2, pot) : Math.pow(2, 32-24)         
        }
    }

    OriginalMask(){
        switch (this.clase) {
            case "A":
                return [255,0,0,0];
            case "B":
                return [255,255,0,0];
            case "C":
                return [255,255,255,0];
            default:
                return;
        }
    }

    DecimalToBinary(num10) {
        let binario = [0,0,0,0,0,0,0,0];
        let cont = -1;
        while (parseInt(num10) > 0) {
            binario.splice(cont,1,parseInt(num10%2));
            cont--;
            num10 = parseInt(num10/2);        
        }
        return binario;
    }

    BinaryToDecimal(num2){
        let decimal = 0;
        let potencia = 0;

        for (let i = num2.length-1; i >= 0; i--) {
            decimal = decimal+(num2[i]*Math.pow(2, potencia))
            potencia++;            
        }
        return decimal;
    }

    MaskOfCid(originalMask){
        switch (this.clase) {
            case "A":
                if(this.Cid > 8){
                    this.AddBits(1,8, originalMask);
                }
                break;
            case "B":
                if(this.Cid > 16){
                    this.AddBits(2,16, originalMask);
                }
                break;
            case "C":
                if (this.Cid > 24) {
                    this.AddBits(3, 24, originalMask);
                }
            break;
            default:
                break;
        }
    }

    AddBits(inicio, clase, originalMask){
        let addBits = this.Cid-clase;

        for (let i = inicio; i <= 3; i++) {
            for (let j = 0; j < 8; j++) {
                originalMask[i].splice(j,1,1);
                addBits --;
                if(addBits == 0){
                    break;
                }
            }
            if(addBits == 0){
                break;
            }
        }
    }

    Network(){
        let net  = new Array();

        switch (this.clase) {
            case "A":
                net = this.Ip.slice(0, 1);
                net.push(0,0,0);
                break;
            case "B":
                net = this.Ip.slice(0, 2);
                net.push(0,0);
                break;
            case "C":
                net = this.Ip.slice(0, 3);
                net.push(0);
                break;
            break;
            default:
                break;
        }
        return net;
    }

    SubRed(maxred){
        let cont = 0;
        let salto;
        let octeto = 3;
        let red = new Object();

        while(this.saltos > 256){
            octeto--;
            this.saltos = this.saltos/256;
        }
        salto = this.saltos;

        red.network = structuredClone(this.Network());
        red.hostMin = structuredClone(red.network);
        red.hostMin.splice(3, 1, red.network[3] + 1);
        red.hostMax = structuredClone(red.hostMin);

        if(this.numHosts > 255){
            red.hostMax.splice(octeto, 1, red.hostMin[octeto] + this.saltos-1);
            if(octeto == 2){
                red.hostMax.splice(3, 1, 254);
            }else if(octeto == 1){
                red.hostMax.splice(2, 1, 255);
                red.hostMax.splice(3, 1, 254);
            }
        }else{
            red.hostMax.splice(3, 1, red.hostMin[3] + this.numHosts - 1);
        }

        red.broadcast = structuredClone(red.hostMax);
        red.broadcast.splice(3, 1, red.hostMax[3] + 1);

        this.subRedes.push(red);

        if (maxred != 1000 && this.isSubred(this.subRedes[cont].broadcast)) {
            this.busqueda = red;
            this.numBusqueda += cont+1;
            return;
        }
         
        while (cont < this.numSubRed-1 && cont < maxred){
            red = new Object();
            red.network = new Array();
            red.network = structuredClone(this.subRedes[cont].broadcast);
            red.hostMin = new Array();
            red.hostMax = new Array();
            red.broadcast = new Array();
            cont++;

                if(this.subRedes[this.subRedes.length-1].broadcast[3] >= 255){
                    red.network.splice(2, 2, this.subRedes[this.subRedes.length-1].broadcast[2] + 1);
                    red.network.push(0);
                }
                if(this.subRedes[this.subRedes.length-1].broadcast[2] >= 255){
                    red.network.splice(1, 3, this.subRedes[this.subRedes.length-1].broadcast[1] + 1);
                    red.network.push(0);
                    red.network.push(0);
                }


            red.network.splice(octeto, 1, salto);

            red.hostMin = structuredClone(red.network);
            red.hostMin.splice(3, 1, red.network[3] + 1);

            red.hostMax = structuredClone(red.hostMin);

            if(this.numHosts > 255){
                    red.hostMax.splice(octeto, 1, salto + this.saltos-1);

                if(octeto == 2){
                    red.hostMax.splice(3, 1, 254);
                }else if(octeto == 1){
                    red.hostMax.splice(2, 1, 255);
                    red.hostMax.splice(3, 1, 254);
                }
            }else{
                red.hostMax.splice(3, 1, red.hostMin[3] + this.numHosts - 1);
            }

            red.broadcast = structuredClone(red.hostMax);
            red.broadcast.splice(3, 1, red.hostMax[3] + 1);
            salto += this.saltos;
            this.subRedes.push(red);

            if (maxred != 1000 && this.isSubred(this.subRedes[cont].broadcast)) {
                this.busqueda = red;
                this.numBusqueda += cont+1;
                return;
            }

            if(salto > 255){
                salto = 0;
            }
        }
    }

    isSubred(red){
        if(this.Ip[3] <= red[3]){
            if(this.Ip[2] <= red[2]){
                if(this.Ip[1] <= red[1]){
                    return true;
                }
            }
        }
        return false;
    }
}

export{Ip}