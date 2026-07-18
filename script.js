const API_URL = "https://script.google.com/macros/s/AKfycbxYzUnFWeHJzO18G3MyJE317cIR5aTP2QXIJ3jMMhPd2znhteytKkaCdXWDRCVz7vGI/exec";

const scanButton = document.getElementById("scanButton");
const submitButton = document.getElementById("submitButton");

const barcodeText = document.getElementById("barcode");
const namaText = document.getElementById("nama");
const kelasText = document.getElementById("kelas");

const reader = document.getElementById("reader");
const message = document.getElementById("message");

let scanner = null;
let currentBarcode = "";


//========================
// Scan QR
//========================

scanButton.onclick = async function(){

    message.innerHTML = "";

    reader.style.display = "block";

    scanner = new Html5Qrcode("reader");

    await scanner.start(

        {
            facingMode:"environment"
        },

        {
            fps:10,
            qrbox:250
        },

        async(decodedText)=>{

            currentBarcode = decodedText;

            navigator.vibrate?.(150);

            await scanner.stop();

            reader.style.display="none";

            cariSiswa(decodedText);

        },

        ()=>{}

    );

}



//========================
// Cari siswa
//========================

async function cariSiswa(barcode){

    message.innerHTML="";

    try{

        const response = await fetch(

            API_URL +
            "?action=search&barcode=" +
            encodeURIComponent(barcode)

        );

        const data = await response.json();

        if(data.success){

            barcodeText.innerHTML=data.barcode;
            namaText.innerHTML=data.nama;
            kelasText.innerHTML=data.kelas;

        }

        else{

            resetForm();

            tampilError("Data siswa tidak ditemukan");

        }

    }

    catch(e){

        tampilError("Gagal mengambil data");

        console.log(e);

    }

}



//========================
// Kirim absensi
//========================

submitButton.onclick = async function(){

    if(currentBarcode==""){

        tampilError("Silakan scan QR Code terlebih dahulu.");

        return;

    }

    submitButton.disabled=true;

    tampilLoading("Menyimpan absensi...");

    const status=document.querySelector(

        "input[name=status]:checked"

    ).value;

    try{

        const response=await fetch(

            API_URL+

            "?action=submit"+

            "&barcode="+encodeURIComponent(currentBarcode)+

            "&status="+encodeURIComponent(status)

        );

        const data=await response.json();

        if(data.success){

            tampilSukses("Absensi berhasil disimpan");

            resetForm();

        }

        else{

            tampilError("Gagal menyimpan absensi");

        }

    }

    catch(e){

        tampilError("Terjadi kesalahan");

        console.log(e);

    }

    submitButton.disabled=false;

}



//========================
// Reset
//========================

function resetForm(){

    currentBarcode="";

    barcodeText.innerHTML="-";

    namaText.innerHTML="-";

    kelasText.innerHTML="-";

    document.querySelector(

        "input[value='Hadir']"

    ).checked=true;

}



//========================
// Message
//========================

function tampilSukses(text){

    message.className="success";

    message.innerHTML=text;

}

function tampilError(text){

    message.className="error";

    message.innerHTML=text;

}

function tampilLoading(text){

    message.className="loading";

    message.innerHTML=text;

}